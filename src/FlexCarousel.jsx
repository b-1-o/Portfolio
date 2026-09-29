'use client';

import { useEffect, useRef, useState } from 'react';
import { Renderer, Program, Mesh, Triangle, Plane, Texture, RenderTarget } from 'ogl';
import './FlexCarousel.css';

const DEFAULT_ITEMS = [];
const BEND_PRESETS = {
  liquid: { lensWidth: 0.74, lensHeight: 1.18, tilt: 62, roundness: 1, bend: 0.34, reach: 0.38, curl: 'twist', dispersion: 0.45, liquid: 0, followCursor: false },
  ribbon: { lensWidth: 0.8, lensHeight: 0.8, tilt: 0, roundness: 1, bend: 0.34, reach: 0.34, curl: 'twist', dispersion: 0.4, liquid: 0, followCursor: false },
  vortex: { lensWidth: 0.7, lensHeight: 0.95, tilt: 30, roundness: 1, bend: 0.46, reach: 0.3, curl: 'twist', dispersion: 0.5, liquid: 0, followCursor: false },
  arch: { lensWidth: 0.8, lensHeight: 0.8, tilt: 0, roundness: 1, bend: 0.3, reach: 0.36, curl: 'rise', dispersion: 0.4, liquid: 0, followCursor: false }
};
const FIT_ASPECT = { portrait: 0.75, square: 1, landscape: 4 / 3 };
const TAPS = 8;
const PIXEL_BUDGET = 2.2e6;
const INTRO_DURATION = { rise: 2.1, bloom: 1.6, spin: 2.2, deal: 1.5, fade: 0.35 };
const wrap = (value, size) => ((((value + size / 2) % size) + size) % size) - size / 2;
const clamp01 = value => Math.min(Math.max(value, 0), 1);
const easeOut = value => 1 - Math.pow(1 - clamp01(value), 3);
const easeOutQuint = value => 1 - Math.pow(1 - clamp01(value), 5);
const easeInOut = value => { const t = clamp01(value); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

const cardVertex = `#version 300 es\nin vec3 position;\nin vec2 uv;\nuniform vec4 uRect;\nuniform vec2 uResolution;\nout vec2 vUv;\nout vec2 vLocal;\nvoid main() {\nvUv = uv;\nvLocal = vec2(position.x, -position.y) * uRect.zw;\nvec2 px = uRect.xy + vLocal;\ngl_Position = vec4(px.x / uResolution.x * 2.0 - 1.0, 1.0 - px.y / uResolution.y * 2.0, 0.0, 1.0);\n}`;

const cardFragment = `#version 300 es\nprecision mediump float;\nuniform sampler2D tMap;\nuniform vec2 uSize;\nuniform vec2 uImage;\nuniform float uRadius;\nuniform float uAlpha;\nuniform float uReady;\nuniform float uShift;\nuniform float uDpr;\nuniform vec3 uPlaceholder;\nin vec2 vUv;\nin vec2 vLocal;\nout vec4 fragColor;\nfloat roundedBox(vec2 p, vec2 b, float r) {\nvec2 q = abs(p) - b + r;\nreturn length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\n}\nvoid main() {\nfloat sd = roundedBox(vLocal, uSize * 0.5, min(uRadius, min(uSize.x, uSize.y) * 0.5));\nfloat mask = clamp(0.5 - sd * uDpr, 0.0, 1.0);\nvec2 local = vLocal / uSize + 0.5;\nfloat cardAspect = uSize.x / uSize.y;\nfloat imageAspect = uImage.x / max(uImage.y, 1.0);\nvec2 scale = imageAspect > cardAspect ? vec2(cardAspect / imageAspect, 1.0) : vec2(1.0, imageAspect / cardAspect);\nscale /= 1.08;\nvec2 uv = vec2(local.x, 1.0 - local.y);\nuv = (uv - 0.5) * scale + 0.5;\nuv.x += uShift * (1.0 - scale.x) * 0.5;\nvec4 sample = texture(tMap, uv);\nvec3 image = sample.rgb;\nvec3 color = mix(uPlaceholder, image, uReady);\nfloat texA = mix(1.0, sample.a, uReady);\nfloat alpha = mask * uAlpha * max(texA, 0.0);\nfragColor = vec4(color * alpha, alpha);\n}`;

const lensVertex = `#version 300 es\nin vec2 position;\nvoid main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const lensFragment = `#version 300 es\nprecision mediump float;\nuniform sampler2D tScene;\nuniform vec2 uResolution;\nuniform float uDpr;\nuniform vec2 uCenter;\nuniform vec2 uHalf;\nuniform float uAngle;\nuniform float uExponent;\nuniform float uInner;\nuniform float uOuter;\nuniform float uFlow;\nuniform float uCurl;\nuniform float uDispersion;\nuniform float uStrength;\nuniform float uSceneAlpha;\nout vec4 fragColor;\nvoid main() {\nvec2 frag = gl_FragCoord.xy / uDpr;\nvec2 uv = frag / uResolution;\nvec2 rel = frag - vec2(uCenter.x, uResolution.y - uCenter.y);\nfloat ca = cos(uAngle);\nfloat sa = sin(uAngle);\nvec2 local = vec2(ca * rel.x + sa * rel.y, -sa * rel.x + ca * rel.y);\nvec2 k = max(abs(local) / uHalf, vec2(1e-5));\nfloat nd = pow(pow(k.x, uExponent) + pow(k.y, uExponent), 1.0 / uExponent);\nvec2 grad = pow(k, vec2(uExponent - 1.0)) * sign(local) / uHalf * pow(nd, 1.0 - uExponent);\nfloat glen = max(length(grad), 1e-6);\nfloat edge = (nd - 1.0) / glen;\nvec2 outward = grad / glen;\nvec2 normal = vec2(ca * outward.x - sa * outward.y, sa * outward.x + ca * outward.y);\nvec2 along = vec2(-normal.y, normal.x);\nfloat t = clamp((edge + uInner) / (uInner + uOuter), 0.0, 1.0);\nfloat ramp = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\nfloat slope = 16.0 * t * t * (1.0 - t) * (1.0 - t);\nfloat reachX = rel.x / (uResolution.x * 0.5);\nfloat side = smoothstep(0.02, 0.3, abs(reachX)) * (uCurl == 0.0 ? sign(reachX) : uCurl);\nfloat lift = ramp * side * uFlow * uStrength;\nvec2 swirl = along * along.y * side * slope * uFlow * uStrength * 0.35;\nvec2 drift = vec2(0.0, -lift) - swirl;\nvec2 shifted = uv + drift / uResolution;\nvec2 texels = uResolution * uDpr;\nvec2 gx = dFdx(shifted);\nvec2 gy = dFdy(shifted);\ngx *= min(1.0, 3.0 / max(length(gx * texels), 1e-4));\ngy *= min(1.0, 3.0 / max(length(gy * texels), 1e-4));\nvec4 color = textureGrad(tScene, shifted, gx, gy);\nvec2 spread = vec2(0.0, side * slope * uFlow * uStrength) / uResolution * uDispersion;\nfloat spreadPx = length(spread * texels);\nif (color.a > 0.002 && spreadPx > 0.25) {\nvec3 base = color.rgb / color.a;\nvec3 sumColor = vec3(0.0);\nvec3 sumWeight = vec3(0.0);\nfor (int i = 0; i < 8; i++) {\nfloat s = (float(i) + 0.5) / 8.0;\nvec4 c = textureGrad(tScene, shifted + spread * (s - 0.5), gx, gy);\nvec3 w = max(1.0 - abs(vec3(s) - vec3(0.15, 0.5, 0.85)) * 2.6, 0.0) * c.a;\nsumColor += c.rgb * (w / max(c.a, 0.002));\nsumWeight += w;\n}\nvec3 split = mix(base, sumColor / max(sumWeight, vec3(1e-4)), clamp(sumWeight * 2.0, 0.0, 1.0));\ncolor.rgb = mix(color.rgb, clamp(split, 0.0, 1.0) * color.a, smoothstep(0.25, 1.5, spreadPx));\n}\nfragColor = color * uSceneAlpha;\n}`;

const Digits = ({ value }) => (
  <span className="flex-carousel__digits">
    {String(value).padStart(2, '0').split('').map((digit, index) => (
      <span key={index} className="flex-carousel__digit">
        <span className="flex-carousel__reel" style={{ transform: `translateY(${-Number(digit) * 10}%)` }}>
          {'0123456789'.split('').map(n => (<span key={n}>{n}</span>))}
        </span>
      </span>
    ))}
  </span>
);

const FlexCarousel = ({
  items = DEFAULT_ITEMS, preset = 'liquid', intro = 'rise', cardHeight = 0.5, gap = 12, radius = 0, fit = 'natural',
  lensWidth, lensHeight, tilt, roundness, bend, reach, curl, dispersion, liquid, followCursor,
  squeeze = 0.2, focusOnClick = true, autoplay = false, interval = 4, captions = true, captureWheel = true,
  onChange, onSelect, className = '', style
}) => {
  const containerRef = useRef(null);
  const settingsRef = useRef(null);
  const itemsRef = useRef(items);
  const engineRef = useRef(null);
  const callbacksRef = useRef({ onChange, onSelect });
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const base = BEND_PRESETS[preset] || BEND_PRESETS.liquid;
  const pick = (value, key) => (value === undefined || value === null ? base[key] : value);
  const list = items && items.length ? items : DEFAULT_ITEMS;
  const itemsKey = list.map(item => item.src).join('|');

  useEffect(() => {
    itemsRef.current = list;
    callbacksRef.current = { onChange, onSelect };
    settingsRef.current = {
      intro, cardHeight, gap, radius, fit,
      lensWidth: pick(lensWidth, 'lensWidth'), lensHeight: pick(lensHeight, 'lensHeight'),
      tilt: pick(tilt, 'tilt'), roundness: pick(roundness, 'roundness'), bend: pick(bend, 'bend'),
      reach: pick(reach, 'reach'), curl: pick(curl, 'curl'), dispersion: pick(dispersion, 'dispersion'),
      liquid: pick(liquid, 'liquid'), followCursor: pick(followCursor, 'followCursor'),
      squeeze, focusOnClick, autoplay, interval, captureWheel
    };
    engineRef.current?.wake();
  });

  useEffect(() => { engineRef.current?.setItems(itemsRef.current); }, [itemsKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const renderer = new Renderer({ dpr: 1, alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
    const gl = renderer.gl;
    if (!renderer.isWebgl2) { gl.getExtension('WEBGL_lose_context')?.loseContext(); return undefined; }
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.setAttribute('aria-hidden', 'true');
    container.prepend(canvas);

    const cardProgram = new Program(gl, {
      vertex: cardVertex, fragment: cardFragment, transparent: true, depthTest: false, depthWrite: false,
      uniforms: {
        tMap: { value: new Texture(gl) }, uRect: { value: [0, 0, 1, 1] }, uResolution: { value: [1, 1] },
        uSize: { value: [1, 1] }, uImage: { value: [1, 1] }, uRadius: { value: 16 }, uAlpha: { value: 1 },
        uReady: { value: 0 }, uShift: { value: 0 }, uDpr: { value: 1 }, uPlaceholder: { value: [0.22, 0.22, 0.26] }
      }
    });
    cardProgram.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const cardMesh = new Mesh(gl, { geometry: new Plane(gl), program: cardProgram });
    const target = new RenderTarget(gl, { width: 2, height: 2, depth: false, minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR });
    const lensUniforms = {
      tScene: { value: target.texture }, uResolution: { value: [1, 1] }, uDpr: { value: 1 },
      uCenter: { value: [0, 0] }, uHalf: { value: [1, 1] }, uAngle: { value: 0 }, uExponent: { value: 2 },
      uInner: { value: 60 }, uOuter: { value: 80 }, uFlow: { value: 0 }, uCurl: { value: 0 },
      uDispersion: { value: 0 }, uStrength: { value: 0 }, uSceneAlpha: { value: 0 }
    };
    const lensMesh = new Mesh(gl, {
      geometry: new Triangle(gl),
      program: new Program(gl, { vertex: lensVertex, fragment: lensFragment, uniforms: lensUniforms, depthTest: false, depthWrite: false })
    });

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const anisotropy = renderer.getExtension('EXT_texture_filter_anisotropic') ? 4 : 0;
    let slots = [];
    let width = 1, height = 1, pos = 0, vel = 0, goal = 0, mode = 'spring', wheelAt = 0, raf = 0;
    let last = performance.now(), visible = true, alive = true, dirty = true, activeIndex = -1;
    let interactedAt = -Infinity, autoplayAt = performance.now(), hasFocus = false, deform = 0, deformVel = 0;
    let layout = null, resnap = false, hover = '', lift = 1, energy = 0, lastPos = 0;
    const lens = { x: 0, y: 0, vx: 0, vy: 0, ready: false };
    const pointer = { x: 0, y: 0, over: false, down: false, id: -1, startX: 0, startY: 0, startPos: 0, dragging: false, touch: false, samples: [] };
    const introState = { kind: 'none', t: 0, running: false, done: false, readyAt: 0 };
    const focus = { index: -1, pending: -1, t: 0, v: 0, target: 0 };
    let instances = [];

    const loadSlot = (item, index) => {
      const texture = new Texture(gl, { generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR, anisotropy });
      const slot = { item, index, texture, aspect: 0.8, loaded: false, failed: false, ready: 0, color: [0.22, 0.22, 0.26], image: [1, 1], dispose: () => {} };
      const image = new Image();
      if (/^https?:/i.test(String(item.src))) image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      image.onload = () => {
        if (!alive || !slots.includes(slot)) return;
        texture.image = image; texture.update();
        slot.image = [image.naturalWidth || 1, image.naturalHeight || 1];
        slot.aspect = slot.image[0] / slot.image[1];
        slot.color = [0.22, 0.22, 0.26];
        slot.loaded = true; dirty = true; start();
      };
      image.onerror = () => { if (!alive) return; slot.failed = true; dirty = true; start(); };
      image.src = item.src;
      slot.dispose = () => { image.onload = null; image.onerror = null; gl.deleteTexture(texture.texture); };
      return slot;
    };

    const setItems = next => {
      slots.forEach(slot => slot.dispose());
      slots = next.map(loadSlot);
      activeIndex = -1; layout = null; resnap = true;
      focus.target = 0; focus.t = 0; focus.v = 0; focus.pending = -1;
      setFocusOpen(false); introState.readyAt = performance.now(); dirty = true; start();
    };

    const metrics = s => {
      const cardH = Math.max(24, s.cardHeight * height);
      const fixed = FIT_ASPECT[s.fit];
      const widths = slots.map(slot => (fixed || slot.aspect) * cardH);
      const centers = [];
      let cursor = 0;
      for (let i = 0; i < widths.length; i++) { centers.push(cursor + widths[i] / 2); cursor += widths[i] + s.gap; }
      return { cardH, widths, centers, gap: s.gap, loop: Math.max(cursor, 1) };
    };

    const nearest = (m, at) => {
      let best = 0, bestDist = Infinity;
      for (let i = 0; i < m.centers.length; i++) {
        const dist = Math.abs(wrap(m.centers[i] - at, m.loop));
        if (dist < bestDist) { bestDist = dist; best = i; }
      }
      return best;
    };
    const snapPoint = (m, at) => { const i = nearest(m, at); return at + wrap(m.centers[i] - at, m.loop); };
    const remap = (from, to, at) => {
      const i = nearest(from, at);
      const offset = wrap(at - from.centers[i], from.loop);
      const cycles = Math.round((at - offset - from.centers[i]) / from.loop);
      return cycles * to.loop + to.centers[i] + offset * (to.widths[i] / from.widths[i]);
    };
    const step = (m, delta) => {
      let at = snapPoint(m, goal); let index = nearest(m, at); const n = m.centers.length;
      for (let k = 0; k < Math.abs(delta); k++) {
        const next = (index + (delta > 0 ? 1 : n - 1)) % n;
        const distance = delta > 0 ? m.widths[index] / 2 + m.gap + m.widths[next] / 2 : -(m.widths[next] / 2 + m.gap + m.widths[index] / 2);
        at += distance; index = next;
      }
      goal = at; mode = 'spring'; dirty = true; start();
    };
    const goTo = (m, index) => {
      const i = ((index % m.centers.length) + m.centers.length) % m.centers.length;
      goal = goal + wrap(m.centers[i] - goal, m.loop); mode = 'spring'; dirty = true; start();
    };
    const openFocus = index => { focus.index = index; focus.pending = -1; focus.target = 1; setFocusOpen(true); dirty = true; start(); };
    const closeFocus = () => { focus.pending = -1; if (focus.target === 0) return false; focus.target = 0; setFocusOpen(false); dirty = true; start(); return true; };
    const skipIntro = () => { if (introState.running) introState.t = 1; };

    const introEffects = () => {
      const t = introState.running ? introState.t : introState.done ? 1 : 0;
      const e = { sceneAlpha: 1, strength: 1, card: null };
      if (!introState.done && !introState.running) { e.sceneAlpha = 0; e.strength = 0; return e; }
      if (t >= 1) return e;
      const kind = introState.kind;
      if (kind === 'rise') {
        e.strength = easeInOut((t - 0.3) / 0.65);
        e.card = rel => {
          const delay = Math.min(Math.abs(rel) / (width * 0.6), 1) * 0.34;
          const local = clamp01((t - delay) / 0.6);
          return { alpha: clamp01(local * 4), x: 0, y: (1 - easeOutQuint(local)) * height * 0.62, scale: 0.5 + 0.5 * easeInOut((local - 0.18) / 0.82) };
        };
      } else if (kind === 'fade') { e.sceneAlpha = easeOut(t); e.strength = easeOut(t); }
      else { e.sceneAlpha = easeOut(t); e.strength = easeOut(t); }
      return e;
    };

    const beginIntro = (s, m) => {
      const kind = reducedMotion && s.intro !== 'none' ? 'fade' : s.intro;
      introState.kind = INTRO_DURATION[kind] ? kind : 'none';
      introState.running = introState.kind !== 'none';
      introState.done = !introState.running;
      introState.t = 0;
      if (introState.done) setRevealed(true);
    };

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      renderer.dpr = Math.min(1, Math.sqrt(PIXEL_BUDGET / (width * height)));
      renderer.setSize(width, height);
      target.setSize(Math.max(2, Math.round(width * renderer.dpr)), Math.max(2, Math.round(height * renderer.dpr)));
      lensUniforms.tScene.value = target.texture;
      dirty = true; start();
    };

    const frame = now => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (!s || !slots.length) { if (visible) raf = requestAnimationFrame(frame); return; }
      const m = metrics(s);
      const n = slots.length;
      let animating = false;
      if (resnap) { goal = snapPoint(m, goal); pos = goal; vel = 0; resnap = false; }
      else if (layout && layout.loop !== m.loop) {
        pos = remap(layout, m, pos); goal = remap(layout, m, goal);
        pointer.startPos = pos + (pointer.x - pointer.startX); animating = true;
      }
      layout = m;
      if (!introState.running && !introState.done) {
        const allSettled = slots.every(slot => slot.loaded || slot.failed);
        if (allSettled || now - introState.readyAt > 3500) { goal = snapPoint(m, goal); pos = goal; beginIntro(s, m); }
      }
      if (introState.running) {
        introState.t = Math.min(1, introState.t + dt / (INTRO_DURATION[introState.kind] || 1));
        if (introState.t >= 1) { introState.running = false; introState.done = true; setRevealed(true); }
        animating = true;
      }
      if (mode === 'wheel' && now - wheelAt > 150) { goal = snapPoint(m, goal); mode = 'spring'; }
      if (!pointer.dragging) {
        const stiffness = mode === 'wheel' ? 80 : 55;
        const damping = 2 * Math.sqrt(stiffness);
        const steps = Math.ceil(dt / (1 / 240));
        const h = dt / steps;
        for (let i = 0; i < steps; i++) { const acc = stiffness * (goal - pos) - damping * vel; vel += acc * h; pos += vel * h; }
        if (Math.abs(goal - pos) < 0.05 && Math.abs(vel) < 0.5) { pos = goal; vel = 0; } else animating = true;
      } else animating = true;
      if (Math.abs(pos) > m.loop * 8) {
        const shift = Math.round(pos / m.loop) * m.loop; pos -= shift; goal -= shift; pointer.startPos -= shift;
      }
      const current = nearest(m, pos);
      if (current !== activeIndex) { activeIndex = current; setActive(current); callbacksRef.current.onChange?.(current, itemsRef.current[current]); }
      if (focus.pending >= 0 && mode === 'spring' && Math.abs(goal - pos) < 1.5 && Math.abs(vel) < 30) {
        if (current === focus.pending) openFocus(current); else focus.pending = -1;
      }
      if (s.autoplay && !reducedMotion && introState.done && focus.target === 0 && focus.t < 0.01 && !pointer.over && !pointer.down && !hasFocus && mode === 'spring' && Math.abs(goal - pos) < 1 && now - interactedAt > 3000 && now - autoplayAt > s.interval * 1000) {
        autoplayAt = now; step(m, 1);
      }
      if (s.autoplay && !reducedMotion) animating = true;
      const travel = Math.abs(pos - lastPos) / dt; lastPos = pos;
      const energyTarget = reducedMotion ? 0 : Math.min(travel / 2600, 1);
      energy += (energyTarget - energy) * (1 - Math.exp(-dt / (energyTarget > energy ? 0.07 : 0.35)));
      if (energy > 0.001) animating = true;
      const liquidAmount = reducedMotion ? 0 : s.liquid;
      const push = Math.max(-1, Math.min(1, vel / 2200));
      const deformStiffness = 120;
      const deformDamping = 2 * Math.sqrt(deformStiffness) * 0.32;
      deformVel += (deformStiffness * (push - deform) - deformDamping * deformVel) * dt;
      deform += deformVel * dt;
      if (Math.abs(deform) > 0.0005 || Math.abs(deformVel) > 0.005) animating = true;
      const focusStiffness = 64;
      focus.v += (focusStiffness * (focus.target - focus.t) - 2 * Math.sqrt(focusStiffness) * focus.v) * dt;
      focus.t += focus.v * dt;
      if (Math.abs(focus.target - focus.t) < 0.0005 && Math.abs(focus.v) < 0.001) { focus.t = focus.target; focus.v = 0; } else animating = true;
      const focusAmount = clamp01(focus.t);
      const focusEase = easeInOut(focusAmount);
      const focusW = focus.index >= 0 && focus.index < n ? m.widths[focus.index] : m.cardH;
      const focusScale = Math.max(1, Math.min(1.3, (height * 0.84) / m.cardH, (width * 0.92) / focusW));
      const nextLift = 1 + (focusScale - 1) * focusEase;
      if (Math.abs(nextLift - lift) > 0.0005) { lift = nextLift; container.style.setProperty('--flex-carousel-lift', lift.toFixed(4)); }
      const effects = introEffects();
      const homeX = width / 2, homeY = height / 2;
      const follow = s.followCursor && pointer.over && !pointer.dragging && !pointer.touch && focus.target === 0;
      const aimX = follow ? pointer.x : homeX, aimY = follow ? pointer.y : homeY;
      if (!lens.ready) { lens.x = homeX; lens.y = homeY; lens.ready = true; }
      const lensK = 110, lensC = 2 * Math.sqrt(lensK) * 0.8;
      lens.vx += (lensK * (aimX - lens.x) - lensC * lens.vx) * dt;
      lens.vy += (lensK * (aimY - lens.y) - lensC * lens.vy) * dt;
      lens.x += lens.vx * dt; lens.y += lens.vy * dt;
      if (Math.abs(aimX - lens.x) + Math.abs(aimY - lens.y) > 0.2 || Math.abs(lens.vx) + Math.abs(lens.vy) > 0.5) animating = true;
      const cardH = m.cardH;
      let halfW = (s.lensWidth * width) / 2, halfH = (s.lensHeight * width) / 2;
      const squash = Math.abs(deform) * liquidAmount;
      halfW *= 1 + squash * 0.16; halfH *= 1 - squash * 0.08;
      const lensX = lens.x - deform * 14 * liquidAmount;
      for (let i = 0; i < n; i++) { const slot = slots[i]; if (slot.loaded && slot.ready < 1) { slot.ready = Math.min(1, slot.ready + dt / 0.45); animating = true; } }
      const waiting = !introState.done;
      if (dirty || animating || pointer.dragging) {
        dirty = false; instances = [];
        const dpr = renderer.dpr;
        cardProgram.uniforms.uResolution.value = [width, height];
        cardProgram.uniforms.uDpr.value = dpr;
        cardProgram.uniforms.uRadius.value = s.radius;
        const shrink = 1 - clamp01(s.squeeze) * energy;
        const draws = [];
        for (let i = 0; i < n; i++) {
          const w = m.widths[i];
          const baseRel = wrap(m.centers[i] - pos, m.loop);
          for (let k = -2; k <= 2; k++) {
            const rel = baseRel + k * m.loop;
            if (Math.abs(rel) - w / 2 > width + 40) continue;
            const fx = effects.card ? effects.card(rel) : null;
            let x = homeX + rel + (fx ? fx.x : 0);
            let scale = shrink * (fx ? fx.scale : 1);
            let alpha = fx ? fx.alpha : 1;
            if (focusAmount > 0) {
              if (i === focus.index && Math.abs(rel) < w) scale *= 1 + (focusScale - 1) * focusEase;
              else {
                const order = Math.min(Math.abs(rel) / width, 1) * 0.25;
                const part = easeInOut(focusAmount * 1.25 - order);
                x += Math.sign(rel) * part * width * 0.7; alpha *= 1 - part;
              }
            }
            const cw = w * scale;
            if (alpha <= 0.001 || x + cw / 2 < -40 || x - cw / 2 > width + 40) continue;
            draws.push({ i, rel, x, y: homeY + (fx ? fx.y : 0), cw, ch: cardH * scale, alpha });
          }
        }
        draws.sort((a, b) => Math.abs(b.rel) - Math.abs(a.rel));
        let first = true;
        for (const draw of draws) {
          const slot = slots[draw.i];
          cardProgram.uniforms.tMap.value = slot.texture;
          cardProgram.uniforms.uRect.value = [draw.x, draw.y, draw.cw + 2, draw.ch + 2];
          cardProgram.uniforms.uSize.value = [draw.cw, draw.ch];
          cardProgram.uniforms.uImage.value = slot.image;
          cardProgram.uniforms.uAlpha.value = draw.alpha;
          cardProgram.uniforms.uReady.value = slot.ready;
          cardProgram.uniforms.uShift.value = reducedMotion ? 0 : Math.max(-1, Math.min(1, draw.rel / (width * 0.75)));
          cardProgram.uniforms.uPlaceholder.value = slot.color;
          renderer.render({ scene: cardMesh, target, clear: first });
          first = false;
          instances.push({ index: draw.i, x0: draw.x - draw.cw / 2, x1: draw.x + draw.cw / 2, y0: draw.y - draw.ch / 2, y1: draw.y + draw.ch / 2 });
        }
        if (first) { renderer.bindFramebuffer(target); gl.viewport(0, 0, target.width, target.height); gl.clear(gl.COLOR_BUFFER_BIT); }
        renderer.bindFramebuffer();
        target.texture.bind();
        gl.generateMipmap(gl.TEXTURE_2D);
        lensUniforms.uResolution.value = [width, height];
        lensUniforms.uDpr.value = dpr;
        lensUniforms.uCenter.value = [lensX, lens.y];
        lensUniforms.uHalf.value = [Math.max(halfW, 1), Math.max(halfH, 1)];
        lensUniforms.uAngle.value = (s.tilt * Math.PI) / 180;
        lensUniforms.uExponent.value = 2 + Math.pow(1 - clamp01(s.roundness), 1.5) * 10;
        const spanW = Math.max(halfW, 1), spanH = Math.max(halfH, 1);
        const inner = Math.max(4, s.reach * (spanW + spanH) * 0.5);
        lensUniforms.uInner.value = inner;
        lensUniforms.uOuter.value = inner * 1.6;
        lensUniforms.uFlow.value = s.bend * (spanW + spanH) * 0.45;
        lensUniforms.uCurl.value = s.curl === 'rise' ? 1 : s.curl === 'fall' ? -1 : 0;
        lensUniforms.uDispersion.value = s.dispersion * 0.12 * (1 + Math.abs(deform) * liquidAmount * 1.2);
        lensUniforms.uStrength.value = effects.strength * (1 - focusEase);
        lensUniforms.uSceneAlpha.value = effects.sceneAlpha;
        renderer.render({ scene: lensMesh });
      }
      let nextHover = '';
      if (pointer.over && !pointer.dragging && introState.done && s.focusOnClick) {
        const hit = instances.find(inst => pointer.x >= inst.x0 && pointer.x <= inst.x1 && pointer.y >= inst.y0 && pointer.y <= inst.y1);
        if (focus.target > 0) nextHover = 'close';
        else if (hit) nextHover = 'open';
      }
      if (nextHover !== hover) {
        hover = nextHover;
        if (hover) container.setAttribute('data-hover', hover);
        else container.removeAttribute('data-hover');
      }
      if (visible && (animating || waiting || dirty || pointer.down)) raf = requestAnimationFrame(frame);
    };

    const start = () => { if (raf || !visible || !alive) return; last = performance.now(); raf = requestAnimationFrame(frame); };
    const localPoint = e => { const rect = container.getBoundingClientRect(); return [e.clientX - rect.left, e.clientY - rect.top]; };

    const onPointerDown = e => {
      if (e.button !== undefined && e.button > 0) return;
      skipIntro();
      const [x, y] = localPoint(e);
      pointer.down = true; pointer.id = e.pointerId; pointer.touch = e.pointerType === 'touch';
      pointer.startX = x; pointer.startY = y; pointer.x = x; pointer.y = y; pointer.startPos = pos;
      pointer.dragging = false; pointer.samples = [{ x, t: performance.now() }];
      interactedAt = performance.now();
      if (Math.abs(vel) > 40) { goal = pos; vel = 0; }
      dirty = true; start();
    };
    const onPointerMove = e => {
      const [x, y] = localPoint(e);
      pointer.x = x; pointer.y = y; pointer.over = true;
      if (pointer.down && e.pointerId === pointer.id) {
        const dx = x - pointer.startX, dy = y - pointer.startY;
        const slop = pointer.touch ? 10 : 5;
        if (!pointer.dragging) {
          if (pointer.touch && Math.abs(dy) > slop && Math.abs(dy) > Math.abs(dx)) { pointer.down = false; return; }
          if (Math.abs(dx) > slop) {
            pointer.dragging = true; pointer.startX = x; pointer.startPos = pos; closeFocus();
            try { container.setPointerCapture(e.pointerId); } catch {}
            container.setAttribute('data-dragging', '');
          }
        }
        if (pointer.dragging) {
          pos = pointer.startPos - (x - pointer.startX); goal = pos; vel = 0;
          const now = performance.now();
          pointer.samples.push({ x, t: now });
          while (pointer.samples.length > 2 && now - pointer.samples[0].t > 100) pointer.samples.shift();
        }
      }
      dirty = true; start();
    };
    const onPointerUp = e => {
      if (!pointer.down || e.pointerId !== pointer.id) return;
      pointer.down = false; container.removeAttribute('data-dragging');
      const s = settingsRef.current; if (!s) return;
      const m = metrics(s); interactedAt = performance.now();
      if (pointer.dragging) {
        pointer.dragging = false;
        const now = performance.now();
        const first = pointer.samples[0], lastSample = pointer.samples[pointer.samples.length - 1];
        let velocity = 0;
        if (first && lastSample && lastSample.t > first.t && now - lastSample.t < 70) velocity = -((lastSample.x - first.x) / (lastSample.t - first.t)) * 1000;
        vel = velocity;
        const landing = snapPoint(m, pos + velocity * 0.32);
        goal = landing;
        if (Math.abs(velocity) > 400 && Math.abs(landing - pos) < 1) step(m, velocity > 0 ? 1 : -1);
        mode = 'spring'; start(); return;
      }
      if (closeFocus()) return;
      const [x, y] = localPoint(e);
      const hit = instances.find(inst => x >= inst.x0 && x <= inst.x1 && y >= inst.y0 && y <= inst.y1);
      if (!hit) return;
      if (hit.index === activeIndex && Math.abs(goal - pos) < 2) {
        callbacksRef.current.onSelect?.(hit.index, itemsRef.current[hit.index]);
        if (s.focusOnClick) openFocus(hit.index);
      } else {
        const rel = (hit.x0 + hit.x1) / 2 - width / 2;
        goal = snapPoint(m, pos + rel); mode = 'spring';
        if (s.focusOnClick) focus.pending = hit.index;
        start();
      }
    };
    const onPointerLeave = () => { pointer.over = false; dirty = true; start(); };
    const onPointerCancel = () => {
      pointer.down = false; pointer.dragging = false; container.removeAttribute('data-dragging');
      const s = settingsRef.current; if (!s) return;
      goal = snapPoint(metrics(s), pos); mode = 'spring'; start();
    };
    const onWheel = e => {
      const s = settingsRef.current; if (!s || e.ctrlKey) return;
      let dx = e.deltaX, dy = e.deltaY;
      if (e.shiftKey && Math.abs(dx) < Math.abs(dy)) { dx = dy; dy = 0; }
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? height : 1;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      if (!horizontal && !s.captureWheel) return;
      e.preventDefault(); skipIntro(); interactedAt = performance.now();
      if (closeFocus()) return;
      const delta = Math.max(-120, Math.min(120, (horizontal ? dx : dy) * unit));
      goal += delta * 1.25; mode = 'wheel'; wheelAt = performance.now(); start();
    };
    const onKeyDown = e => {
      const s = settingsRef.current; if (!s) return;
      const m = metrics(s);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); skipIntro(); closeFocus(); interactedAt = performance.now(); step(m, 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); skipIntro(); closeFocus(); interactedAt = performance.now(); step(m, -1); }
      else if (e.key === 'Escape') { if (closeFocus()) e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (closeFocus() || activeIndex < 0) return;
        callbacksRef.current.onSelect?.(activeIndex, itemsRef.current[activeIndex]);
        if (s.focusOnClick) openFocus(activeIndex);
      }
    };
    const onFocus = () => { hasFocus = true; };
    const onBlur = () => { hasFocus = false; };
    const onVisibility = () => { if (!document.hidden) start(); };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('pointercancel', onPointerCancel);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('keydown', onKeyDown);
    container.addEventListener('focus', onFocus);
    container.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); });
    intersectionObserver.observe(container);
    engineRef.current = { wake: () => { dirty = true; start(); }, setItems };
    resize();
    setItems(itemsRef.current);
    return () => {
      alive = false; visible = false; engineRef.current = null;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect(); intersectionObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointercancel', onPointerCancel);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('focus', onFocus);
      container.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      slots.forEach(slot => slot.dispose()); slots = [];
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  const current = list[active] || list[0];
  const label = current ? current.title || current.alt || `Image ${active + 1}` : '';

  return (
    <div
      ref={containerRef}
      className={`flex-carousel ${className}`.trim()}
      style={{ ...style, '--flex-carousel-half': `${Math.min(Math.max(cardHeight, 0.05), 1) * 50}%` }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Image carousel"
      tabIndex={0}
    >
      {captions && current && revealed && (
        <div className="flex-carousel__caption" aria-hidden="true">
          <span key={active} className="flex-carousel__title">
            {current.title || current.alt}
            {current.subtitle && <span className="flex-carousel__subtitle">{current.subtitle}</span>}
          </span>
          <span className="flex-carousel__count" data-hidden={focusOpen ? '' : undefined}>
            <Digits value={active + 1} />
            <span className="flex-carousel__slash">/</span>
            <span>{String(list.length).padStart(2, '0')}</span>
          </span>
        </div>
      )}
      <div className="flex-carousel__live" aria-live="polite" aria-atomic="true">
        {`${label}, ${active + 1} of ${list.length}`}
      </div>
    </div>
  );
};

export default FlexCarousel;

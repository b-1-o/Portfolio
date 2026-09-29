import { useEffect, useRef, useState, useCallback } from 'react';
import RippleDistortion from './RippleDistortion';

import pageBg from '../assets/page.png';
import sfxClick from '../assets/Cough_Nothing_Phone_2_Stock_Notification-649463-mobiles24.mp3';
import sfxNav from '../assets/Squiggle_Nothing_Phone_1_Stock_Notification-645458-mobiles24.mp3';
import sfxRefresh from '../assets/Bulb_One_Nothing_Phone_2_Stock_Notification-649453-mobiles24.mp3';
import sfxError from '../assets/Lonba_Nothing_Phone_2_Stock_Notification-649461-mobiles24.mp3';

const SFX = {
  click: sfxClick,
  navigation: sfxNav,
  refresh: sfxRefresh,
  error: sfxError,
};

const projects = [
  {
    id: '01',
    name: 'music',
    kind: 'WEB · MUSIC',
    blurb: 'Local-first music player with YouTube search, playlists, queue, likes and atmospheric playback controls.',
    detail: 'Built as a visual world around sound — history, shuffle and appearance stay in the browser with no account required.',
    stack: ['React', 'TypeScript', 'YouTube API', 'Web Audio'],
    repo: 'https://github.com/b-1-o/music',
    site: 'https://b-1-o.github.io/music/',
  },
  {
    id: '02',
    name: 'heaven',
    kind: 'WEB · TOOLING',
    blurb: 'Developer command center — launch workflows, tools and environments from one surface.',
    detail: 'A focused UI for daily developer routines: open groups of URLs, scripts and apps without leaving the browser.',
    stack: ['TypeScript', 'React', 'Vite'],
    repo: 'https://github.com/b-1-o/heaven',
    site: 'https://b-1-o.github.io/heaven/',
  },
  {
    id: '03',
    name: 'fog',
    kind: 'WEB · INTERACTION',
    blurb: 'Layered depth and a draggable 3D carousel — the visual grammar behind atmospheric UIs.',
    detail: 'Interaction experiment that explores motion, opacity and perspective as a shared language across portfolio surfaces.',
    stack: ['React', '3D CSS', 'Motion'],
    repo: 'https://github.com/b-1-o/fog',
    site: 'https://b-1-o.github.io/fog/',
  },
  {
    id: '04',
    name: 'forest',
    kind: 'WEB · EXPERIENCE',
    blurb: 'Immersive forest portfolio experiment with motion and environmental mood.',
    detail: 'A narrative web experience where navigation feels like walking through layers of canopy and light.',
    stack: ['React', 'TypeScript', 'CSS'],
    repo: 'https://github.com/b-1-o/forest',
    site: 'https://b-1-o.github.io/forest/',
  },
  {
    id: '05',
    name: 'biohub',
    kind: 'LINUX · PRODUCTIVITY',
    blurb: 'Local Linux command center for apps, URL groups and repeatable workflows.',
    detail: 'Terminal + desktop interfaces via Python — FastAPI, Typer and PySide6 for launching real work, not demos.',
    stack: ['Python', 'FastAPI', 'Typer', 'PySide6'],
    repo: 'https://github.com/b-1-o/biohub',
  },
  {
    id: '06',
    name: 'Biogram',
    kind: 'IOS · MESSAGING',
    blurb: 'Native iOS Telegram client work — builds, signing, Bazel and Telegram architecture.',
    detail: 'Deep dive into native mobile: configuration, signing pipelines and the structure of a large messaging codebase.',
    stack: ['Swift', 'iOS', 'Xcode', 'Bazel'],
    repo: 'https://github.com/b-1-o/Biogram-iOS-26',
  },
  {
    id: '07',
    name: 's1eep',
    kind: 'WEB · SURFACE',
    blurb: 'This site — quiet digital room with pointer-driven water distortion and low-light HUD.',
    detail: 'React Bits RippleDistortion, custom glass UI, Nothing Phone system sounds and a portfolio layer on top.',
    stack: ['React', 'WebGL', 'ogl', 'Vite'],
    repo: 'https://github.com/b-1-o/s1eep',
    site: 'https://b-1-o.github.io/s1eep/',
  },
  {
    id: '08',
    name: 'barber',
    kind: 'WEB · PRODUCT',
    blurb: 'Barbershop product surface — booking-minded UI in TypeScript.',
    detail: 'Clean product patterns for service businesses: services, availability and a calm conversion-focused layout.',
    stack: ['TypeScript', 'React'],
    repo: 'https://github.com/b-1-o/barber',
  },
  {
    id: '09',
    name: 'my',
    kind: 'WEB · PORTFOLIO',
    blurb: 'Earlier personal space with spiral carousel and image-driven navigation.',
    detail: 'Atmospheric portfolio built around depth, motion and a foggy visual rhythm.',
    stack: ['React', 'TypeScript', 'CSS', 'Motion'],
    repo: 'https://github.com/b-1-o/my',
    site: 'https://b-1-o.github.io/my/',
  },
  {
    id: '10',
    name: 'Benzola',
    kind: 'WEB · BRAND',
    blurb: 'Brand-forward web surface in TypeScript with deliberate motion.',
    detail: 'Experiment in product identity — typography, pacing and restrained interaction.',
    stack: ['TypeScript', 'React'],
    repo: 'https://github.com/b-1-o/Benzola',
  },
  {
    id: '11',
    name: 'build',
    kind: 'WEB · SYSTEMS',
    blurb: 'Build tooling and system surfaces for shipping faster.',
    detail: 'Internal-facing tools that keep deployment and local workflows predictable.',
    stack: ['TypeScript', 'Vite'],
    repo: 'https://github.com/b-1-o/build',
  },
  {
    id: '12',
    name: 'b1o-remote-agent',
    kind: 'PYTHON · AGENT',
    blurb: 'Remote agent experiments in Python for automation and tooling.',
    detail: 'Exploring agent loops, remote control surfaces and practical automation helpers.',
    stack: ['Python'],
    repo: 'https://github.com/b-1-o/b1o-remote-agent',
  },
];

const services = [
  {
    title: 'Product UI',
    text: 'Interfaces for real products — dashboards, booking flows, music tools and command centers with clear hierarchy.',
  },
  {
    title: 'Immersive web',
    text: 'Atmospheric experiences with WebGL, motion and custom interaction models that still stay usable.',
  },
  {
    title: 'Frontend systems',
    text: 'React + TypeScript apps with solid structure, Vite builds and attention to performance on real devices.',
  },
  {
    title: 'Freelance delivery',
    text: 'Available on Fiverr and Contra for focused builds, redesigns and interactive portfolio pieces.',
  },
];

const timeline = [
  { year: '2026', title: 'Immersive portfolio system', text: 's1eep, fog, forest, music — a shared visual language across experiments.' },
  { year: '2025', title: 'Tools & native', text: 'biohub, Biogram, remote agent work — Linux productivity and iOS architecture.' },
  { year: 'Now', title: 'Open for work', text: 'Frontend / UI freelance and product collaboration from Los Angeles.' },
];

const skills = {
  frontend: ['React', 'TypeScript', 'JavaScript', 'Vite', 'CSS', 'Motion'],
  graphics: ['WebGL', 'ogl', 'Shaders', '3D CSS', 'Ripple / distortion'],
  other: ['Python', 'FastAPI', 'Swift / iOS', 'Bazel', 'Node', 'UI design'],
};

const socials = [
  { label: 'GitHub', href: 'https://github.com/b-1-o', note: '@b-1-o' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/b1o/', note: 'b1o' },
  { label: 'Fiverr', href: 'https://www.fiverr.com/webbio/', note: 'webbio' },
  { label: 'Contra', href: 'https://contra.com/erik_868bxnxk', note: 'Erik' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@psycho_b1o', note: '@psycho_b1o' },
  { label: 'Instagram', href: 'https://www.instagram.com/__._saint', note: '@__._saint' },
  { label: 'Telegram', href: 'https://t.me/blood_on_music', note: 'blood_on_music' },
];

function ProjectPanel({ project, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="project-panel-backdrop"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section className="project-panel hud" role="dialog" aria-modal="true" aria-label={project.name}>
        <div className="project-panel-top">
          <span className="hud-copy">PROJECT / {project.id}</span>
          <button type="button" className="panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <span className="work-kind">{project.kind}</span>
        <h3>{project.name}</h3>
        <p>{project.blurb}</p>
        {project.detail ? <p className="panel-detail">{project.detail}</p> : null}
        <div className="work-stack">
          {project.stack.map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="project-panel-actions">
          <a className="panel-btn" href={project.repo} target="_blank" rel="noreferrer">
            REPOSITORY
          </a>
          {project.site ? (
            <a className="panel-btn panel-btn-solid" href={project.site} target="_blank" rel="noreferrer">
              LIVE SITE
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function App() {
  const [time, setTime] = useState(() => new Date());
  const audioRef = useRef({});
  const [openProject, setOpenProject] = useState(null);
  const [rippleReady, setRippleReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setRippleReady(true), 120);
    return () => clearTimeout(id);
  }, []);

  const playSfx = useCallback(type => {
    const src = SFX[type];
    if (!src) return Promise.resolve(null);

    let audio = audioRef.current[type];
    if (!audio) {
      audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = type === 'click' ? 0.85 : 0.72;
      audioRef.current[type] = audio;
    }

    if (type === 'click' || (!audio.paused && audio.currentTime > 0.02)) {
      const clone = new Audio(src);
      clone.volume = audio.volume;
      const result = clone.play();
      return result && typeof result.then === 'function'
        ? result.then(() => clone).catch(() => null)
        : Promise.resolve(clone);
    }

    try {
      audio.currentTime = 0;
    } catch {
      /* ignore */
    }
    const result = audio.play();
    return result && typeof result.then === 'function'
      ? result.then(() => audio).catch(() => null)
      : Promise.resolve(audio);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let mx = 50;
    let my = 50;
    let raf = 0;

    const flush = () => {
      raf = 0;
      root.style.setProperty('--mx', mx + '%');
      root.style.setProperty('--my', my + '%');
    };

    const onPointerMove = event => {
      mx = (event.clientX / window.innerWidth) * 100;
      my = (event.clientY / window.innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    const onClick = event => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest('[data-refresh]')) return;

      const anchor = target.closest('a[href]');
      const href = anchor?.getAttribute('href') || '';
      if (href.startsWith('#') && href.length > 1) {
        playSfx('navigation');
        return;
      }

      if (
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('[data-project]')
      ) {
        playSfx('click');
      }
    };

    const onInvalid = () => playSfx('error');
    const onError = () => playSfx('error');
    const onUnhandledRejection = () => playSfx('error');

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('click', onClick, true);
    document.addEventListener('invalid', onInvalid, true);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('invalid', onInvalid, true);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, [playSfx]);

  const refreshPage = async event => {
    event.preventDefault();
    event.stopPropagation();
    const audio = await playSfx('refresh');
    const duration = audio && Number.isFinite(audio.duration) ? audio.duration : 0;
    const wait = Math.min(Math.max(duration * 1000, 420), 1100);
    window.setTimeout(() => window.location.reload(), wait);
  };

  const openPanel = project => {
    playSfx('click');
    setOpenProject(project);
  };

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <main className="page">
      <div className="visual-stage" aria-hidden="true">
        {rippleReady ? (
          <RippleDistortion
            src={pageBg}
            brushSize={65}
            strength={0.09}
            swirl={0.65}
            rings={2.5}
            grayscale
            spacing={1}
            tint="#8300ff"
            quality="low"
            spread={4}
            fade={2}
            dispersion={0}
            glint={0}
            tintAmount={0.1}
            highlightColor="#ffffff"
            trigger="hover"
            clickStrength={1.5}
            enabled
          />
        ) : (
          <div className="static-bg" style={{ backgroundImage: `url(${pageBg})` }} />
        )}
        <div className="image-dimmer" />
        <div className="pointer-halo" />
        <div className="vignette" />
      </div>

      <header className="topbar hud">
        <a className="brand" href="#home" aria-label="b-1-o home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>b-1-o</span>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <a href="#home">HOME</a>
          <a href="#about">ABOUT</a>
          <a href="#work">WORK</a>
          <a href="#services">SERVICES</a>
          <a href="#connect">CONNECT</a>
        </nav>

        <button type="button" className="refresh-button" data-refresh onClick={refreshPage} aria-label="Refresh page">
          <span className="refresh-glyph">↻</span>
          REFRESH
        </button>
      </header>

      <section id="home" className="hero-copy">
        <div className="system-code hud-copy">
          <span>SYS.B1O</span>
          <span>LA / FRONTEND</span>
          <span>{formattedTime}</span>
        </div>

        <p className="eyebrow">ERIK · B-1-O · FRONTEND DEVELOPER & UI DESIGNER</p>

        <h1>
          Interfaces that
          <br />
          <span>feel alive.</span>
        </h1>

        <p className="intro">
          I design and build modern React & TypeScript surfaces — atmospheric web experiences,
          product UIs and tools with motion, depth and quiet detail. Based in Los Angeles.
          Open for freelance on Fiverr and Contra.
        </p>

        <div className="hero-actions">
          <a href="#work" className="enter-link">
            <span>VIEW WORK</span>
            <span className="enter-glyph">↘</span>
          </a>
          <a href="#connect" className="enter-link enter-link-ghost">
            <span>HIRE ME</span>
            <span className="enter-glyph">→</span>
          </a>
        </div>

        <div className="hero-stats hud-copy">
          <div><strong>12+</strong><span>PUBLIC PROJECTS</span></div>
          <div><strong>REACT</strong><span>PRIMARY STACK</span></div>
          <div><strong>LA</strong><span>BASED</span></div>
        </div>
      </section>

      <aside className="surface-hud hud-copy">
        <div className="surface-index">01 / SURFACE</div>
        <div className="surface-copy">
          <span className="crosshair" />
          MOVE YOUR CURSOR
          <small>RIPPLE DISTORTION · REACT BITS</small>
        </div>
      </aside>

      <section id="about" className="about-section hud">
        <div className="about-label">02 / ABOUT</div>
        <div>
          <h2>Erik.<br /><span>Frontend & UI.</span></h2>
          <p>
            I ship immersive web experiences, music tools, iOS experiments and local productivity systems.
            Clean TypeScript, deliberate motion, low-light aesthetics. The same visual grammar runs through
            fog, forest, music and this surface — interaction as atmosphere, not decoration.
          </p>
          <p className="about-extra">
            Outside the browser: Python tooling (biohub, agents), Swift/iOS (Biogram) and product UIs
            for real service flows. Available for focused freelance builds and longer product collaboration.
          </p>
        </div>
        <div className="about-meta">
          <span>REACT / TS</span>
          <span>WEBGL · CSS</span>
          <span>SWIFT · PYTHON</span>
          <span>FIVERR · CONTRA</span>
        </div>
      </section>

      <section className="skills-section" aria-label="Skills">
        <div className="skills-label hud-copy">03 / SKILLS</div>
        <div className="skills-grid">
          <div className="skills-block hud">
            <h4>Frontend</h4>
            <ul className="skills-list">
              {skills.frontend.map(s => (
                <li key={s} className="skill-chip">{s}</li>
              ))}
            </ul>
          </div>
          <div className="skills-block hud">
            <h4>Graphics</h4>
            <ul className="skills-list">
              {skills.graphics.map(s => (
                <li key={s} className="skill-chip">{s}</li>
              ))}
            </ul>
          </div>
          <div className="skills-block hud">
            <h4>Systems</h4>
            <ul className="skills-list">
              {skills.other.map(s => (
                <li key={s} className="skill-chip">{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="work" className="work-section">
        <div className="work-head">
          <span className="hud-copy work-kicker">04 / SELECTED WORK</span>
          <h2>Projects</h2>
          <p>Click any card for a mini panel — repository and live site when available.</p>
        </div>
        <div className="work-grid">
          {projects.map(p => (
            <button
              key={p.id}
              type="button"
              className="work-card hud"
              data-project
              onClick={() => openPanel(p)}
              aria-label={`Open ${p.name}`}
            >
              <div className="work-card-top">
                <span className="work-id">{p.id}</span>
                <span className="work-kind">{p.kind}</span>
              </div>
              <h3>{p.name}</h3>
              <p>{p.blurb}</p>
              <div className="work-stack">
                {p.stack.slice(0, 3).map(t => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="work-open-hint">CLICK TO OPEN</div>
            </button>
          ))}
        </div>
      </section>

      <section id="services" className="services-section">
        <div className="work-head">
          <span className="hud-copy work-kicker">05 / SERVICES</span>
          <h2>What I build</h2>
          <p>Product surfaces, immersive pages and frontend systems — shipped with care.</p>
        </div>
        <div className="services-grid">
          {services.map(s => (
            <article key={s.title} className="service-card hud">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="timeline-section">
        <div className="work-head">
          <span className="hud-copy work-kicker">06 / PATH</span>
          <h2>Timeline</h2>
        </div>
        <ol className="timeline-list">
          {timeline.map(t => (
            <li key={t.year} className="timeline-item hud">
              <span className="timeline-year">{t.year}</span>
              <div>
                <strong>{t.title}</strong>
                <p>{t.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="connect" className="connect-section hud">
        <div className="connect-label">07 / CONNECT</div>
        <div>
          <h2>Find me<br /><span>online.</span></h2>
          <p>
            Open to freelance and product work. Reach out on Fiverr, Contra, LinkedIn
            or GitHub — or message directly on Telegram.
          </p>
        </div>
        <ul className="social-list">
          {socials.map(s => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer">
                <span>{s.label}</span>
                <small>{s.note}</small>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="footer hud-copy">
        <span>B-1-O / ERIK</span>
        <span>LA · 2026</span>
        <span>REACT BITS · RIPPLE</span>
      </footer>

      {openProject ? (
        <ProjectPanel project={openProject} onClose={() => setOpenProject(null)} />
      ) : null}
    </main>
  );
}

export default App;

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
    blurb: 'Local-first music player with YouTube search, playlists, queue and atmosphere.',
    stack: ['React', 'TypeScript', 'YouTube API'],
    repo: 'https://github.com/b-1-o/music',
    site: 'https://b-1-o.github.io/music/',
  },
  {
    id: '02',
    name: 'heaven',
    kind: 'WEB · TOOLING',
    blurb: 'Developer command center — launch workflows, tools and environments from one surface.',
    stack: ['TypeScript', 'React', 'Vite'],
    repo: 'https://github.com/b-1-o/heaven',
    site: 'https://b-1-o.github.io/heaven/',
  },
  {
    id: '03',
    name: 'fog',
    kind: 'WEB · INTERACTION',
    blurb: 'Layered depth and a draggable 3D carousel — visual grammar for atmospheric UIs.',
    stack: ['React', '3D CSS', 'Motion'],
    repo: 'https://github.com/b-1-o/fog',
    site: 'https://b-1-o.github.io/fog/',
  },
  {
    id: '04',
    name: 'forest',
    kind: 'WEB · EXPERIENCE',
    blurb: 'Immersive forest portfolio experiment with motion and environmental mood.',
    stack: ['React', 'TypeScript', 'CSS'],
    repo: 'https://github.com/b-1-o/forest',
    site: 'https://b-1-o.github.io/forest/',
  },
  {
    id: '05',
    name: 'biohub',
    kind: 'LINUX · PRODUCTIVITY',
    blurb: 'Local Linux command center for apps, URL groups and repeatable workflows.',
    stack: ['Python', 'FastAPI', 'PySide6'],
    repo: 'https://github.com/b-1-o/biohub',
  },
  {
    id: '06',
    name: 'Biogram',
    kind: 'IOS · MESSAGING',
    blurb: 'Native iOS Telegram client work — builds, signing, Bazel and Telegram architecture.',
    stack: ['Swift', 'iOS', 'Bazel'],
    repo: 'https://github.com/b-1-o/Biogram-iOS-26',
  },
  {
    id: '07',
    name: 's1eep',
    kind: 'WEB · SURFACE',
    blurb: 'Quiet digital room with pointer-driven water distortion and low-light HUD.',
    stack: ['React', 'WebGL', 'ogl'],
    repo: 'https://github.com/b-1-o/s1eep',
    site: 'https://b-1-o.github.io/s1eep/',
  },
  {
    id: '08',
    name: 'barber',
    kind: 'WEB · PRODUCT',
    blurb: 'Barbershop product surface — booking-minded UI in TypeScript.',
    stack: ['TypeScript', 'React'],
    repo: 'https://github.com/b-1-o/barber',
  },
];

const skills = [
  'React', 'TypeScript', 'JavaScript', 'CSS', 'Vite',
  'WebGL / shaders', 'Python', 'Swift / iOS', 'Node', 'UI design',
];

const socials = [
  { label: 'GitHub', href: 'https://github.com/b-1-o' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/b1o/' },
  { label: 'Fiverr', href: 'https://www.fiverr.com/webbio/' },
  { label: 'Contra', href: 'https://contra.com/erik_868bxnxk' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@psycho_b1o' },
  { label: 'Instagram', href: 'https://www.instagram.com/__._saint' },
  { label: 'Telegram', href: 'https://t.me/blood_on_music' },
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
    const id = window.requestAnimationFrame(() => setRippleReady(true));
    return () => cancelAnimationFrame(id);
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

    const onPointerMove = event => {
      root.style.setProperty('--mx', (event.clientX / window.innerWidth) * 100 + '%');
      root.style.setProperty('--my', (event.clientY / window.innerHeight) * 100 + '%');
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
            spacing={12}
            tint="#8300ff"
            quality="low"
            spread={4}
            fade={2.2}
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

        <p className="eyebrow">ERIK · B-1-O · FRONTEND DEVELOPER</p>

        <h1>
          Interfaces that
          <br />
          <span>feel alive.</span>
        </h1>

        <p className="intro">
          I build modern React & TypeScript surfaces — atmospheric web experiences,
          product UIs, and tools with motion, depth and quiet detail.
        </p>

        <div className="hero-actions">
          <a href="#work" className="enter-link">
            <span>VIEW WORK</span>
            <span className="enter-glyph">↘</span>
          </a>
          <a href="#connect" className="enter-link enter-link-ghost">
            <span>CONNECT</span>
            <span className="enter-glyph">→</span>
          </a>
        </div>
      </section>

      <aside className="surface-hud hud-copy">
        <div className="surface-index">01 / SURFACE</div>
        <div className="surface-copy">
          <span className="crosshair" />
          MOVE YOUR CURSOR
          <small>THE IMAGE BENDS WITH YOU</small>
        </div>
      </aside>

      <section id="about" className="about-section hud">
        <div className="about-label">02 / ABOUT</div>
        <div>
          <h2>Erik.<br /><span>Frontend & UI.</span></h2>
          <p>
            Based in Los Angeles. I design and ship immersive web experiences,
            music tools, iOS experiments and local productivity systems.
            Clean TypeScript, deliberate motion, low-light aesthetics.
          </p>
        </div>
        <div className="about-meta">
          <span>REACT / TS</span>
          <span>WEBGL · CSS</span>
          <span>SWIFT · PYTHON</span>
        </div>
      </section>

      <section className="skills-section" aria-label="Skills">
        <div className="skills-label hud-copy">03 / SKILLS</div>
        <ul className="skills-list">
          {skills.map(s => (
            <li key={s} className="skill-chip hud">{s}</li>
          ))}
        </ul>
      </section>

      <section id="work" className="work-section">
        <div className="work-head">
          <span className="hud-copy work-kicker">04 / SELECTED WORK</span>
          <h2>Projects</h2>
          <p>Click a project to open its panel — repo and live site.</p>
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
                {p.stack.map(t => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="work-open-hint">CLICK TO OPEN</div>
            </button>
          ))}
        </div>
      </section>

      <section id="connect" className="connect-section hud">
        <div className="connect-label">05 / CONNECT</div>
        <div>
          <h2>Find me<br /><span>online.</span></h2>
          <p>Open to freelance and product work — Fiverr, Contra, or direct.</p>
        </div>
        <ul className="social-list">
          {socials.map(s => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="footer hud-copy">
        <span>B-1-O / ERIK</span>
        <span>LA · 2026</span>
        <span>BUILT WITH REACT</span>
      </footer>

      {openProject ? (
        <ProjectPanel project={openProject} onClose={() => setOpenProject(null)} />
      ) : null}
    </main>
  );
}

export default App;

import { useEffect, useRef, useState } from 'react';
import RippleDistortion from './RippleDistortion';

const ASSET_BASE = import.meta.env.BASE_URL;

const SFX = {
  click: `${ASSET_BASE}assets/Cough_Nothing_Phone_2_Stock_Notification-649463-mobiles24.mp3`,
  navigation: `${ASSET_BASE}assets/Squiggle_Nothing_Phone_1_Stock_Notification-645458-mobiles24.mp3`,
  refresh: `${ASSET_BASE}assets/Bulb_One_Nothing_Phone_2_Stock_Notification-649453-mobiles24.mp3`,
  error: `${ASSET_BASE}assets/Lonba_Nothing_Phone_2_Stock_Notification-649461-mobiles24.mp3`,
};

const notes = [
  ['01', 'SLOW DOWN', 'release the day'],
  ['02', 'BREATHE IN', 'four counts, easy'],
  ['03', 'LET GO', 'nothing needs fixing'],
];

const rays = [
  'M 42 104 L 28 -8',
  'M 48 104 L 39 -8',
  'M 54 104 L 50 -8',
  'M 60 104 L 63 -8',
  'M 66 104 L 76 -8',
  'M 36 104 L 16 18',
  'M 72 104 L 90 16',
];

function App() {
  const [time, setTime] = useState(() => new Date());
  const audioRef = useRef({});

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const playSfx = useRef(type => {
    const src = SFX[type];
    if (!src) return;

    let audio = audioRef.current[type];
    if (!audio) {
      audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = 0.62;
      audioRef.current[type] = audio;
    }

    audio.currentTime = 0;
    const result = audio.play();
    if (result && typeof result.catch === 'function') result.catch(() => {});
  }).current;

  useEffect(() => {
    const root = document.documentElement;

    const onPointerMove = event => {
      root.style.setProperty('--mx', (event.clientX / window.innerWidth) * 100 + '%');
      root.style.setProperty('--my', (event.clientY / window.innerHeight) * 100 + '%');
    };

    const onClick = event => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const refresh = target.closest('[data-refresh]');
      if (refresh) {
        playSfx('refresh');
        return;
      }

      const anchor = target.closest('a[href]');
      const href = anchor?.getAttribute('href') || '';
      if (href.startsWith('#') && href.length > 1) {
        playSfx('navigation');
        return;
      }

      const button = target.closest('button,[role="button"]');
      if (button) playSfx('click');
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

  const refreshPage = () => {
    window.setTimeout(() => window.location.reload(), 120);
  };

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <main className="page">
      <div className="visual-stage" aria-hidden="true">
        <RippleDistortion
          src={`${ASSET_BASE}assets/page.png`}
          brushSize={65}
          strength={0.09}
          swirl={0.65}
          rings={2.5}
          grayscale
          spread={5}
          fade={3}
          spacing={1}
          dispersion={0}
          glint={0}
          tint="#8300ff"
          tintAmount={0.1}
          highlightColor="#ffffff"
          trigger="hover"
          clickStrength={2}
          quality="high"
          enabled
        />
        <div className="image-dimmer" />
        <div className="pointer-halo" />
        <div className="beam-field" aria-hidden="true">
          <span className="beam beam-a" />
          <span className="beam beam-b" />
          <span className="beam beam-c" />
          <span className="beam beam-d" />
          <span className="beam beam-e" />
        </div>
        <div className="ray-field">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="rayBlur"><feGaussianBlur stdDeviation="0.35" /></filter>
              <linearGradient id="rayGradient" x1="0" y1="1" x2="0.5" y2="0">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="35%" stopColor="white" stopOpacity="0.75" />
                <stop offset="68%" stopColor="white" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#d7c2ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g className="rays-soft" filter="url(#rayBlur)">
              {rays.map(path => <path key={path} d={path} pathLength="1" />)}
            </g>
          </svg>
        </div>
        <div className="light-sweep" />
        <div className="grain" />
        <div className="vignette" />
      </div>

      <header className="topbar hud">
        <a className="brand" href="#home" aria-label="s1eep home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>s1eep</span>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <a href="#home">HOME</a>
          <a href="#about">ABOUT</a>
          <a href="#notes">NOTES</a>
        </nav>

        <button className="refresh-button" data-refresh onClick={refreshPage} aria-label="Refresh page">
          <span className="refresh-glyph">↻</span>
          REFRESH
        </button>
      </header>

      <section id="home" className="hero-copy">
        <div className="system-code hud-copy">
          <span>SYS.S1EEP</span>
          <span>23° / QUIET</span>
          <span>{formattedTime}</span>
        </div>

        <p className="eyebrow">DIGITAL SLEEP ENVIRONMENT</p>

        <h1>
          Nothing to do.
          <br />
          <span>Nowhere to be.</span>
        </h1>

        <p className="intro">
          A quiet digital room for the hours when the world gets too loud.
          Move slowly. The surface remembers.
        </p>

        <a href="#about" className="enter-link">
          <span>ENTER THE QUIET</span>
          <span className="enter-glyph">↘</span>
        </a>
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
          <h2>One image.<br /><span>One quiet system.</span></h2>
          <p>
            The surface is alive: pointer movement leaves water-like displacement,
            while slow glyph-inspired light moves across the same background.
            Nothing sits outside the scene.
          </p>
        </div>
        <div className="about-meta">
          <span>RIPPLE / HIGH</span>
          <span>GLASS / LOW LIGHT</span>
          <span>SFX / NOTHING</span>
        </div>
      </section>

      <section id="notes" className="notes">
        {notes.map(([index, title, subtitle]) => (
          <article className="note hud" key={index}>
            <span className="note-index">{index}</span>
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </article>
        ))}
      </section>

      <footer className="footer hud-copy">
        <span>DESIGNED FOR LOW LIGHT</span>
        <span>S1—EP / 2026</span>
        <span>NO NOTIFICATIONS</span>
      </footer>
    </main>
  );
}

export default App;

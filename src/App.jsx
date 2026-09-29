import { useEffect, useRef, useState } from 'react';
import RippleDistortion from './RippleDistortion';

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
  const [soundOn, setSoundOn] = useState(false);
  const [time, setTime] = useState(() => new Date());
  const audioRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const onMove = event => {
      root.style.setProperty('--mx', (event.clientX / window.innerWidth) * 100 + '%');
      root.style.setProperty('--my', (event.clientY / window.innerHeight) * 100 + '%');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const master = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const oscillator = ctx.createOscillator();

      master.gain.value = 0;
      filter.type = 'lowpass';
      filter.frequency.value = 850;
      filter.Q.value = 0.5;
      oscillator.type = 'sine';
      oscillator.frequency.value = 174;

      oscillator.connect(filter).connect(master).connect(ctx.destination);
      oscillator.start();

      audioRef.current = { ctx, master };
    }

    const audio = audioRef.current;

    if (soundOn) {
      audio.master.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.45);
      setSoundOn(false);
    } else {
      audio.ctx.resume();
      audio.master.gain.setTargetAtTime(0.025, audio.ctx.currentTime, 0.8);
      setSoundOn(true);
    }
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
          src="/hero.jpg"
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
              <filter id="rayBlur">
                <feGaussianBlur stdDeviation="0.35" />
              </filter>
              <linearGradient id="rayGradient" x1="0" y1="1" x2="0.5" y2="0">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="35%" stopColor="white" stopOpacity="0.75" />
                <stop offset="68%" stopColor="#ffffff" stopOpacity="0.22" />
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
        <a className="brand" href="#top" aria-label="s1eep home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>s1eep</span>
        </a>

        <div className="topbar-center">
          <span className="status-dot" />
          <span>LOW LIGHT / 01</span>
          <span className="separator" />
          <span>INTERACTIVE SURFACE</span>
        </div>

        <button className={'sound ' + (soundOn ? 'active' : '')} onClick={toggleSound}>
          <span className="sound-bars"><i /><i /><i /><i /></span>
          {soundOn ? 'SOUND ON' : 'SOUND OFF'}
        </button>
      </header>

      <section id="top" className="hero-copy">
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

        <a href="#notes" className="enter-link">
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

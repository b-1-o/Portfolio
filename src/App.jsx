import { useEffect, useRef, useState } from 'react';
import RippleDistortion from './RippleDistortion';

const sleepNotes = ['slow down', 'breathe in', 'let go', 'drift'];

function App() {
  const [soundOn, setSoundOn] = useState(false);
  const [time, setTime] = useState(() => new Date());
  const audioRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 0.018;
      master.connect(ctx.destination);

      const oscillator = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      oscillator.type = 'sine';
      oscillator.frequency.value = 174;
      filter.type = 'lowpass';
      filter.frequency.value = 700;
      oscillator.connect(filter).connect(master);
      oscillator.start();
      audioRef.current = { ctx, master, oscillator };
    }

    const audio = audioRef.current;
    if (soundOn) {
      audio.master.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.4);
      setSoundOn(false);
    } else {
      audio.ctx.resume();
      audio.master.gain.setTargetAtTime(0.018, audio.ctx.currentTime, 0.6);
      setSoundOn(true);
    }
  };

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="noise" />

      <nav className="nav glass">
        <a className="brand" href="#top" aria-label="s1eep home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>s1eep</span>
        </a>
        <div className="nav-meta">
          <span className="live-dot" /> NIGHT MODE / 01
          <button className={`sound ${soundOn ? 'active' : ''}`} onClick={toggleSound} aria-label="Toggle ambient sound">
            <span className="sound-bars"><i /><i /><i /><i /></span>
            {soundOn ? 'SOUND ON' : 'SOUND OFF'}
          </button>
        </div>
      </nav>

      <section id="top" className="hero" aria-label="s1eep experience">
        <div className="hero-copy">
          <div className="system-line"><span>SYS</span><span>23° / QUIET</span><span>{formattedTime}</span></div>
          <p className="eyebrow">digital sleep environment</p>
          <h1>Nothing to do.<br /><span>Nowhere to be.</span></h1>
          <p className="intro">A quiet digital room for the hours when the world gets too loud. Move slowly. The surface remembers.</p>
          <div className="hero-actions">
            <a href="#surface" className="primary-button">ENTER THE QUIET <span>↘</span></a>
            <span className="microcopy">headphones optional · lights low</span>
          </div>
        </div>

        <div id="surface" className="ripple-frame glass">
          <RippleDistortion
            src="/hero.jpg"
            brushSize={65}
            strength={0.09}
            swirl={0.65}
            rings={2.5}
            grayscale
            spacing={1}
            tint="#8300ff"
            tintAmount={0.08}
            glint={0.7}
            highlightColor="#ffffff"
            quality="high"
          />
          <div className="surface-top"><span>01 / SURFACE</span><span>MOVE YOUR CURSOR</span></div>
          <div className="surface-bottom"><span>THE IMAGE BENDS WITH YOU</span><span className="corner-code">S1—EP / 26</span></div>
          <div className="scanline" />
        </div>
      </section>

      <section className="info-grid" aria-label="sleep notes">
        {sleepNotes.map((note, index) => (
          <article className="note glass" key={note}>
            <span>0{index + 1}</span>
            <strong>{note}</strong>
            <small>{index === 0 ? 'release the day' : index === 1 ? 'four counts, easy' : index === 2 ? 'nothing needs fixing' : 'stay a little longer'}</small>
          </article>
        ))}
      </section>

      <footer className="footer">
        <span>DESIGNED FOR LOW LIGHT</span>
        <span>© S1EEP / 2026</span>
        <span>NO NOTIFICATIONS</span>
      </footer>
    </main>
  );
}

export default App;

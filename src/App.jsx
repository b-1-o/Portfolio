import RippleDistortion from './RippleDistortion';

export default function App() {
  return (
    <main className="page">
      <div className="backdrop" aria-hidden="true" />
      <section className="hero" aria-label="Ripple distortion demo">
        <div className="hero-copy">
          <p className="eyebrow">s1eep / interactive canvas</p>
          <h1>Ripple the image.</h1>
          <p className="intro">
            Move your pointer across the surface and watch the image bend like water.
          </p>
        </div>

        <div className="ripple-frame">
          <RippleDistortion
            src="/hero.jpg"
            brushSize={65}
            strength={0.09}
            swirl={0.65}
            rings={2.5}
            grayscale
            spacing={1}
            tint="#8300ff"
            quality="high"
          />
          <div className="frame-label">RIPPLE DISTORTION</div>
        </div>
      </section>
    </main>
  );
}

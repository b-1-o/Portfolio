import { useCallback, useEffect, useRef, useState } from 'react';
import './FlexCarousel.css';

/**
 * Lightweight FlexCarousel stand-in (JS-CSS).
 * Same public API as React Bits FlexCarousel for this project:
 * items, preset, intro, cardHeight, gap, squeeze, focusOnClick, captions, onSelect, captureWheel, autoplay
 * Uses CSS transforms only — no second WebGL context beside RippleDistortion.
 */
const FlexCarousel = ({
  items = [],
  cardHeight = 0.5,
  gap = 12,
  captions = true,
  focusOnClick = true,
  captureWheel = false,
  autoplay = false,
  interval = 4,
  onSelect,
  className = '',
  style,
}) => {
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ x: 0, startX: 0, scroll: 0, moved: false });
  const autoRef = useRef(null);

  const count = items.length;

  const scrollToIndex = useCallback((index, smooth = true) => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport || count === 0) return;
    const i = ((index % count) + count) % count;
    const card = track.children[i];
    if (!card) return;
    const left = card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
    viewport.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
    setActive(i);
  }, [count]);

  useEffect(() => {
    scrollToIndex(0, false);
  }, [scrollToIndex, count]);

  useEffect(() => {
    if (!autoplay || count < 2) return undefined;
    autoRef.current = window.setInterval(() => {
      setActive(a => {
        const next = (a + 1) % count;
        scrollToIndex(next);
        return next;
      });
    }, Math.max(2, interval) * 1000);
    return () => clearInterval(autoRef.current);
  }, [autoplay, interval, count, scrollToIndex]);

  const onPointerDown = e => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setDragging(true);
    drag.current = {
      x: e.clientX,
      startX: e.clientX,
      scroll: viewport.scrollLeft,
      moved: false,
    };
    viewport.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = e => {
    if (!dragging) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(e.clientX - drag.current.startX) > 6) drag.current.moved = true;
    viewport.scrollLeft = drag.current.scroll - dx;
  };

  const endDrag = e => {
    if (!dragging) return;
    setDragging(false);
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(track.children).forEach((card, i) => {
      const mid = card.offsetLeft + card.offsetWidth / 2;
      const d = Math.abs(mid - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    scrollToIndex(best);

    if (!drag.current.moved && focusOnClick) {
      onSelect?.(best, items[best]);
    }
  };

  const onWheel = e => {
    if (!captureWheel) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    viewport.scrollLeft += e.deltaY;
  };

  const heightPct = Math.round(Math.min(0.85, Math.max(0.35, cardHeight)) * 100);

  return (
    <div
      className={`flex-carousel ${className}`.trim()}
      style={style}
      data-dragging={dragging ? '' : undefined}
    >
      <div
        ref={viewportRef}
        className="flex-carousel__viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
      >
        <div
          ref={trackRef}
          className="flex-carousel__track"
          style={{ gap: `${gap}px`, ['--card-h']: `${heightPct}%` }}
        >
          {items.map((item, i) => (
            <button
              key={`${item.title || i}-${i}`}
              type="button"
              className={`flex-carousel__card${i === active ? ' is-active' : ''}`}
              onClick={() => {
                if (drag.current.moved) return;
                scrollToIndex(i);
                onSelect?.(i, item);
              }}
              aria-label={item.title || item.alt || `Item ${i + 1}`}
            >
              <div className="flex-carousel__media">
                <img src={item.src} alt={item.alt || item.title || ''} draggable={false} loading="lazy" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {captions && items[active] ? (
        <div className="flex-carousel__caption">
          <span className="flex-carousel__title">
            {items[active].title || items[active].alt}
            {items[active].subtitle ? (
              <span className="flex-carousel__subtitle">{items[active].subtitle}</span>
            ) : null}
          </span>
          <span className="flex-carousel__count">
            {String(active + 1).padStart(2, '0')}
            <span className="flex-carousel__slash"> / </span>
            {String(count).padStart(2, '0')}
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default FlexCarousel;

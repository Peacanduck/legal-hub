import { useEffect, useRef, type RefObject } from 'react';
import { prefersReducedMotion, watchVisibility } from '../hooks';
import { createEmber } from '../scenes/ember';
import { PillarHead, PillarShaft } from './Pixels';

const SIDES = ['left', 'right'] as const;

/** The columns' flames: the hero's flame on a smaller grid, as wide as the
 *  brazier at its belly. */
const GRID = { cols: 16, rows: 22 };

/** Scroll speed, in pixels a second, that would give a full stoke, and the
 *  most a scroll can give, so the fires flare but never roar. */
const DRAUGHT = 6000;
const MAX_LIFT = 0.6;

/**
 * Two stone columns, one in each margin, each with a live flame in a brazier
 * on top. They light as the hero scrolls away, go out if you scroll back up
 * to it, and burn taller the faster you scroll. A click on a flame stokes it,
 * as in the hero. Under reduced motion each flame is one still frame. CSS
 * hides the columns where the margins are too narrow for them, and the loop
 * stops while they are hidden.
 */
export const Pillars = ({ hero }: { hero: RefObject<HTMLElement | null> }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const heroEl = hero.current;
    if (!root || !heroEl) return;

    // Each flame starts at its own point in time, so the two never move in step.
    const fires = [...root.querySelectorAll<HTMLElement>('.pd-pillar-fire')].flatMap((box, i) => {
      const canvas = box.querySelector('canvas');
      const ember = canvas && createEmber(canvas, { ...GRID, phase: 20 + i * 37 });
      return ember ? [{ box, ember }] : [];
    });

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const fire = fires.find((f) => f.box === entry.target);
        fire?.ember.resize(
          entry.contentRect.width,
          entry.contentRect.height,
          Math.min(window.devicePixelRatio || 1, 2),
        );
      }
    });
    for (const { box, ember } of fires) {
      ro.observe(box);
      ember.settle();
    }

    // Lit once the hero's bottom edge is above the lowest 30% of the screen,
    // which is when section 01 starts coming up.
    const reduced = prefersReducedMotion();
    let lit = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === !lit) return;
        lit = !entry.isIntersecting;
        root.classList.toggle('is-lit', lit);
        if (lit && !reduced) fires.forEach((f) => f.ember.stoke());
      },
      { rootMargin: '-70% 0px 0px 0px' },
    );
    io.observe(heroEl);

    if (reduced) {
      return () => {
        io.disconnect();
        ro.disconnect();
      };
    }

    let lastY = window.scrollY;
    const stop = watchVisibility(root, (dt) => {
      const y = window.scrollY;
      const speed = dt > 0 ? Math.abs(y - lastY) / dt : 0;
      lastY = y;
      if (!lit) return;
      for (const { ember } of fires) {
        if (speed > 0) ember.lift(Math.min(MAX_LIFT, speed / DRAUGHT));
        ember.tick(dt);
      }
    });

    const unlisten = fires.map(({ box, ember }) => {
      const onDown = (e: PointerEvent) => {
        if (e.button === 0) ember.stoke();
      };
      box.addEventListener('pointerdown', onDown);
      return () => box.removeEventListener('pointerdown', onDown);
    });

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      unlisten.forEach((off) => off());
    };
  }, [hero]);

  return (
    <div className="pd-pillars" ref={rootRef} aria-hidden="true">
      {SIDES.map((side) => (
        <div key={side} className={`pd-pillar pd-pillar--${side}`}>
          <div className="pd-pillar-fire">
            <canvas className="pd-pillar-canvas" />
          </div>
          <PillarHead className="pd-pillar-head" />
          <div className="pd-pillar-shaft">
            <PillarShaft />
          </div>
        </div>
      ))}
    </div>
  );
};

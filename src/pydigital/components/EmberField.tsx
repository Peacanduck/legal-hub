import { useEffect, useRef, type RefObject } from 'react';
import { prefersReducedMotion, watchVisibility } from '../hooks';
import { createEmber } from '../scenes/ember';

/**
 * The hero's live flame. A mouse anywhere over `region` fans it away from
 * the pointer; a click or tap on it stokes it. Under reduced motion it is
 * one still frame of a flame that has been burning for a couple of seconds.
 */
export const EmberField = ({ region }: { region: RefObject<HTMLElement | null> }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const ember = createEmber(canvas);
    if (!ember) return;

    const ro = new ResizeObserver(([entry]) =>
      ember.resize(entry.contentRect.width, entry.contentRect.height, Math.min(window.devicePixelRatio || 1, 2)),
    );
    ro.observe(box);

    ember.settle();
    if (prefersReducedMotion()) return () => ro.disconnect();

    const stop = watchVisibility(box, (dt) => ember.tick(dt));

    // Touch has no hover to fan with, so only a mouse leans the flame. It
    // leans away from the pointer, hardest about half its width off to one
    // side and easing off with distance, so the whole hero is not a gale.
    const area = region.current ?? box;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = canvas.getBoundingClientRect();
      const d = (r.left + r.width / 2 - e.clientX) / r.width;
      ember.fan(d / (0.25 + d * d));
    };
    const onLeave = () => ember.fan(0);
    const onDown = (e: PointerEvent) => {
      if (e.button === 0) ember.stoke();
    };
    area.addEventListener('pointermove', onMove);
    area.addEventListener('pointerleave', onLeave);
    box.addEventListener('pointerdown', onDown);

    return () => {
      stop();
      ro.disconnect();
      area.removeEventListener('pointermove', onMove);
      area.removeEventListener('pointerleave', onLeave);
      box.removeEventListener('pointerdown', onDown);
    };
  }, [region]);

  return (
    <div className="pd-ember" ref={boxRef}>
      <canvas ref={canvasRef} className="pd-ember-canvas" aria-hidden="true" />
    </div>
  );
};

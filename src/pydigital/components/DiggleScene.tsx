import { useEffect, useRef } from 'react';
import { prefersReducedMotion, watchVisibility } from '../hooks';
import { createDig } from '../scenes/dig';

/** A Diggle Machine on a dive, with the game's depth readout in the corner. */
export const DiggleScene = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const depthRef = useRef<HTMLSpanElement>(null);
  const biomeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;

    // Written straight to the DOM: a React render per metre would be absurd.
    const dig = createDig(canvas, {
      depth: (metres, stratum) => {
        if (depthRef.current) depthRef.current.textContent = `${metres} m`;
        if (biomeRef.current) biomeRef.current.textContent = stratum;
      },
    });
    if (!dig) return;

    const ro = new ResizeObserver(([entry]) =>
      dig.resize(entry.contentRect.width, entry.contentRect.height, Math.min(window.devicePixelRatio || 1, 2)),
    );
    ro.observe(box);

    if (prefersReducedMotion()) {
      dig.loaded.then(() => dig.still());
      return () => ro.disconnect();
    }
    const stop = watchVisibility(box, dig.tick);
    return () => {
      stop();
      ro.disconnect();
    };
  }, []);

  return (
    <div className="pd-scene pd-scene--pixel" ref={boxRef}>
      <canvas ref={canvasRef} className="pd-scene-canvas" />
      <p className="pd-dig-readout" aria-hidden="true">
        <span ref={depthRef}>0 m</span>
        <span ref={biomeRef}>Surface</span>
      </p>
    </div>
  );
};

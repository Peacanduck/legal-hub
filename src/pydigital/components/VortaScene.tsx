import { useEffect, useRef } from 'react';
import { createDemo } from '../../vorta/game/demo';
import { NOCTURNE } from '../../vorta/game/skins';
import { prefersReducedMotion } from '../hooks';

// The Vorta page's own engine and autopilot (src/vorta/game), in attract
// mode only: playing it is what /vorta is for. Its floating "+2"s are drawn
// in this page's display face, since Vorta's is not loaded here.
const FONT = "'Bricolage Grotesque Variable', system-ui, sans-serif";

export const VortaScene = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const demo = createDemo(
      canvas,
      { skin: NOCTURNE, fieldFraction: 0.44, reducedMotion: prefersReducedMotion(), font: FONT },
      {},
    );
    if (!demo) return;

    const ro = new ResizeObserver(([entry]) => demo.resize(entry.contentRect.width, entry.contentRect.height));
    ro.observe(box);
    const io = new IntersectionObserver(([entry]) => demo.setVisible(entry.isIntersecting), { threshold: 0.02 });
    io.observe(box);

    return () => {
      ro.disconnect();
      io.disconnect();
      demo.destroy();
    };
  }, []);

  return (
    <div className="pd-scene" ref={boxRef}>
      <canvas ref={canvasRef} className="pd-scene-canvas" />
    </div>
  );
};

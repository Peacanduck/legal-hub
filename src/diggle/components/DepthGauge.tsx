import { useEffect, useState, type CSSProperties } from 'react';

// The page is a mine shaft: every section declares the depth band it
// covers (data-depth="from-to") and a name. The gauge reads the section
// under the viewport's upper third and interpolates within it, so it
// reads 120–240 m while you're actually in the Permafrost.
export const DepthGauge = () => {
  const [reading, setReading] = useState({ depth: 0, label: 'Surface', accent: '', progress: 0 });

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-depth]'));
    if (sections.length === 0) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const probe = window.innerHeight * 0.4;
      let current = sections[0];
      for (const s of sections) if (s.getBoundingClientRect().top <= probe) current = s;

      const [from, to] = (current.dataset.depth ?? '0-0').split('-').map(Number);
      const rect = current.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (probe - rect.top) / Math.max(rect.height, 1)));
      const max = document.documentElement.scrollHeight - window.innerHeight;

      setReading({
        depth: Math.round(from + (to - from) * t),
        label: current.dataset.biome ?? '',
        accent: current.dataset.accent ?? '',
        progress: max > 0 ? Math.min(1, window.scrollY / max) : 0,
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="dg-gauge"
      aria-hidden="true"
      style={reading.accent ? ({ '--dg-gauge-accent': `var(${reading.accent})` } as CSSProperties) : undefined}
    >
      <span className="dg-gauge-label">Depth</span>
      <span className="dg-gauge-track">
        <span className="dg-gauge-bit" style={{ top: `${reading.progress * 100}%` }} />
      </span>
      <span className="dg-gauge-read">{reading.depth}m</span>
      <span className="dg-gauge-biome">{reading.label}</span>
    </div>
  );
};

import { useEffect, useRef } from 'react';
import { CONFIG } from '../game/config';

const R = 84;
const C = 2 * Math.PI * R;

// A scripted chain: banks arrive, the multiplier climbs, then nothing comes
// and the window runs out. Times in seconds; the loop restarts at LOOP.
const SCRIPT: { at: number; base: number }[] = [
  { at: 0.5, base: CONFIG.scorePerGap },
  { at: 1.6, base: CONFIG.scorePerMote },
  { at: 2.6, base: CONFIG.scorePerGap },
  { at: 3.3, base: CONFIG.scorePerMote },
  { at: 3.9, base: CONFIG.scorePerMote },
  { at: 5.2, base: CONFIG.scorePerGap },
  { at: 6.5, base: CONFIG.scorePerGap },
  { at: 7.4, base: CONFIG.scorePerMote },
];
const LOOP = 7.4 + CONFIG.comboDecaySeconds + 1.6;
/** Where a still frame sits under reduced motion: mid-chain, gauge full. */
const STILL = 6.7;

/** The chain at time t, replayed from the script by the game's own rules. */
const chainAt = (t: number) => {
  let combo = 0;
  let last = -Infinity;
  for (const bank of SCRIPT) {
    if (bank.at > t) break;
    if (bank.at - last > CONFIG.comboDecaySeconds) combo = 0;
    combo++;
    last = bank.at;
  }
  const left = CONFIG.comboDecaySeconds - (t - last);
  if (left <= 0) return { combo: 0, fraction: 0, broken: t - last - CONFIG.comboDecaySeconds };
  return { combo, fraction: left / CONFIG.comboDecaySeconds, broken: -1 };
};

const multiplier = (combo: number) => Math.min(1 + combo * CONFIG.comboMultiplierStep, CONFIG.comboMultiplierMax);

/**
 * The HUD's combo gauge at poster size, running a scripted chain. Decorative:
 * the section's copy says everything it shows.
 */
export const ComboDemo = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const multRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const popsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const arc = arcRef.current;
    const multEl = multRef.current;
    const countEl = countRef.current;
    const pops = popsRef.current;
    if (!root || !arc || !multEl || !countEl || !pops) return;

    const render = (t: number) => {
      const { combo, fraction, broken } = chainAt(t);
      arc.style.strokeDashoffset = String(C * (1 - fraction));
      multEl.textContent = `${multiplier(combo).toFixed(1)}x`;
      countEl.textContent = combo > 0 ? `Chain of ${combo}` : broken >= 0 && broken < 1.2 ? 'Chain broken' : 'Waiting';
      root.toggleAttribute('data-urgent', combo > 0 && fraction < 0.33);
      root.toggleAttribute('data-broken', combo === 0 && broken >= 0 && broken < 1.2);
    };

    const pop = (text: string) => {
      const el = document.createElement('span');
      el.className = 'vt-combo-pop';
      el.textContent = text;
      el.style.setProperty('--x', `${Math.round(Math.random() * 120 - 60)}px`);
      el.addEventListener('animationend', () => el.remove());
      pops.appendChild(el);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      render(STILL);
      return;
    }

    let raf = 0;
    let started = 0;
    let lastT = 0;
    let visible = false;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!started) started = now;
      const t = ((now - started) / 1000) % LOOP;
      // Pops for every bank crossed since the last frame (none on a wrap).
      if (t > lastT) {
        for (const bank of SCRIPT) {
          if (bank.at > lastT && bank.at <= t) {
            const before = chainAt(bank.at - 1e-6).combo;
            pop(`+${Math.round(bank.base * multiplier(before))}`);
          }
        }
      }
      lastT = t;
      render(t);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        started = 0;
        lastT = 0;
        raf = requestAnimationFrame(frame);
      } else if (!visible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(root);
    render(0);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className="vt-combo" aria-hidden="true">
      <svg viewBox="0 0 200 200" className="vt-combo-ring">
        <circle className="vt-combo-track" cx="100" cy="100" r={R} />
        <circle ref={arcRef} className="vt-combo-arc" cx="100" cy="100" r={R} strokeDasharray={C} strokeDashoffset={C} />
      </svg>
      <div className="vt-combo-readout">
        <span ref={multRef} className="vt-combo-mult">
          1.0x
        </span>
        <span ref={countRef} className="vt-combo-count">
          Waiting
        </span>
      </div>
      <div ref={popsRef} className="vt-combo-pops" />
    </div>
  );
};

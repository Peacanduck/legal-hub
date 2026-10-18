import { showAutopilot } from './autopilot';
import { CONFIG } from './config';
import { createRng } from './math';
import { createPainter } from './painter';
import { GameState } from './state';
import type { Skin } from './skins';

// The loop behind a playfield on the page: an attract run flown by the
// autopilot until someone taps, then their own run. Plain TypeScript so the
// React side only wires events and the HUD.

/** The attract run starts this far into the difficulty curve, so the very
 *  first rings already spin rather than sitting still. */
const ATTRACT_FROM = 8;
/** Simulated before the first paint, so the field is never empty on load. */
const ATTRACT_PREROLL = 6;
/** Then it fades out and starts over, before the curve turns frantic. */
const ATTRACT_UNTIL = 72;
const BEST_KEY = 'vorta-demo-best';

export type DemoMode = 'attract' | 'player';

export interface DemoListener {
  /** Every painted frame. Read what the HUD needs straight off the state. */
  frame?: (state: GameState, mode: DemoMode) => void;
  /** A visitor's run has ended and its death animation has played out. */
  over?: (score: number, previousBest: number) => void;
}

const seed = () => Math.floor(Math.random() * 2 ** 32);

const attractRun = () => {
  const s = new GameState(createRng(seed()));
  s.start();
  s.elapsed = ATTRACT_FROM;
  for (let t = 0; t < ATTRACT_PREROLL; t += CONFIG.fixedStep) s.update(CONFIG.fixedStep, showAutopilot);
  return s;
};

export const readBest = () => {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writeBest = (best: number) => {
  try {
    window.localStorage.setItem(BEST_KEY, String(best));
  } catch {
    // Private mode or blocked storage: the best simply lasts this visit.
  }
};

export const createDemo = (
  canvas: HTMLCanvasElement,
  options: { skin: Skin; fieldFraction: number; reducedMotion: boolean; font: string },
  listener: DemoListener,
) => {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return null;
  const painter = createPainter(ctx);

  let skin = options.skin;
  let mode: DemoMode = 'attract';
  let state = attractRun();
  let best = readBest();
  let reported = false;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let onScreen = false;

  // A fade to the backdrop colour and back, for restarts and hand-overs.
  let fade = 0;
  let fadeDir = 0;

  const draw = () => {
    if (w === 0 || h === 0) return;
    painter.paint(w, h, state, skin, {
      fieldFraction: options.fieldFraction,
      motion: !options.reducedMotion,
      dpr,
      font: options.font,
    });
    if (fade > 0) {
      const c = skin.backgroundOuter;
      ctx.fillStyle = `rgba(${(c >>> 16) & 0xff},${(c >>> 8) & 0xff},${c & 0xff},${fade.toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
    }
    listener.frame?.(state, mode);
  };

  const tick = (dt: number) => {
    if (mode === 'attract') {
      state.update(dt, showAutopilot);
      if (fadeDir === 0 && (state.elapsed > ATTRACT_UNTIL || state.phase === 'dead')) fadeDir = 1;
    } else {
      state.update(dt);
      if (state.phase === 'dead' && !reported) {
        reported = true;
        const previous = best;
        if (state.score > best) {
          best = state.score;
          writeBest(best);
        }
        listener.over?.(state.score, previous);
      }
    }

    if (fadeDir === 1) {
      fade = Math.min(1, fade + dt / 0.5);
      if (fade >= 1) {
        state = attractRun();
        fadeDir = -1;
      }
    } else if (fadeDir === -1) {
      fade = Math.max(0, fade - dt / 0.7);
      if (fade === 0) fadeDir = 0;
    }
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    tick(dt);
    draw();
  };

  // Runs only while on screen and in a visible tab. Under reduced motion the
  // attract run is a still frame; a run the visitor starts still plays.
  const sync = () => {
    const animate = onScreen && !document.hidden && (mode === 'player' || !options.reducedMotion);
    if (animate && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!animate && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    if (!raf) draw();
  };

  document.addEventListener('visibilitychange', sync);

  return {
    resize(cssW: number, cssH: number) {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cssW;
      h = cssH;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    },
    setVisible(visible: boolean) {
      onScreen = visible;
      sync();
    },
    setSkin(next: Skin) {
      skin = next;
      if (!raf) draw();
    },
    /** Hands the field to the visitor: a fresh run, started. */
    play() {
      mode = 'player';
      state = new GameState(createRng(seed()));
      state.start();
      reported = false;
      fade = 0.65;
      fadeDir = -1;
      sync();
    },
    /** The one input. False when there is no run to steer. */
    reverse() {
      if (mode !== 'player' || state.phase !== 'playing') return false;
      state.reverse();
      return true;
    },
    /** Back to the autopilot. */
    attract() {
      mode = 'attract';
      state = attractRun();
      fade = 1;
      fadeDir = -1;
      sync();
    },
    get best() {
      return best;
    },
    destroy() {
      document.removeEventListener('visibilitychange', sync);
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
};

export type Demo = NonNullable<ReturnType<typeof createDemo>>;

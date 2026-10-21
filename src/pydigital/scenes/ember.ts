// The hero's flame: the mark, alight. A teardrop of heat, hottest at its
// base, with value noise rising through it so its edges lick and its tip
// flickers. It is drawn on a coarse grid of separate pixels, like the mark,
// and throws sparks that climb a pixel at a time. The fire columns burn the
// same flame on a smaller grid. Plain TypeScript, so the React side only
// wires up size and input.

/** The hero's grid. Lengths given in cells below are cells of this grid. */
const HERO_COLS = 30;
const HERO_ROWS = 42;
/** Fixed simulation rate. Pixel fire looks best a little under full speed. */
const STEP = 1 / 30;
const LEVELS = 40;

// Heat to colour. The fringe is translucent red rather than dark, so the
// edges glow out into the page instead of reading as soot.
const STOPS: [at: number, rgba: [number, number, number, number]][] = [
  [0, [190, 44, 12, 0.28]],
  [0.2, [214, 58, 18, 0.7]],
  [0.36, [232, 74, 28, 1]],
  [0.54, [255, 106, 43, 1]],
  [0.7, [255, 160, 71, 1]],
  [0.86, [255, 216, 138, 1]],
  [1, [255, 247, 230, 1]],
];

const PALETTE = Array.from({ length: LEVELS }, (_, i) => {
  const t = i / (LEVELS - 1);
  let k = 1;
  while (k < STOPS.length - 1 && STOPS[k][0] < t) k++;
  const [t0, a] = STOPS[k - 1];
  const [t1, b] = STOPS[k];
  const f = (t - t0) / (t1 - t0 || 1);
  const c = a.map((v, j) => v + (b[j] - v) * f);
  return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${c[3].toFixed(3)})`;
});

// 3D value noise: a hashed lattice, smoothly interpolated. Plenty for a grid
// this coarse, and a fraction of the code of simplex.
const PERM = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let seed = 0x2f6b9c1d;
  for (let i = 255; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return Uint8Array.from([...p, ...p]);
})();

const lattice = (x: number, y: number, z: number) => PERM[(PERM[(PERM[x & 255] + y) & 255] + z) & 255] / 255;
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const noise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  const w = smooth(z - zi);
  const plane = (z0: number) =>
    lerp(
      lerp(lattice(xi, yi, z0), lattice(xi + 1, yi, z0), u),
      lerp(lattice(xi, yi + 1, z0), lattice(xi + 1, yi + 1, z0), u),
      v,
    );
  return lerp(plane(zi), plane(zi + 1), w);
};

const fbm = (x: number, y: number, z: number) =>
  noise(x, y, z) * 0.62 + noise(x * 2.1, y * 2.1, z * 1.7) * 0.28 + noise(x * 4.3, y * 4.3, z * 2.9) * 0.1;

/** The flame's shape. Tuned by eye, on the hero's grid. */
const P = {
  /** Half-width at the widest point, as a fraction of the grid. */
  width: 0.38,
  /** Where the flame is widest, as a fraction of its height. */
  belly: 0.22,
  /** How much of the grid's height the flame reaches, before the noise,
   *  and how sharply it narrows on the way up. */
  height: 0.94,
  taper: 1.3,
  /** How hard the noise eats into the flame, and how fast it rises. */
  bite: 0.95,
  rise: 2.6,
  /** Noise scale across and up the flame: low, so it moves in tongues, not grain. */
  grain: 0.13,
  /** How far the tip sways on its own, and how much it writhes. */
  sway: 3,
  writhe: 1.6,
  /** Chance of a spark leaving the tip each step. */
  sparks: 0.22,
};

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  phase: number;
}

export interface EmberOptions {
  /** The grid. A smaller one is the same flame, scaled down: the sway and
   *  the sparks shrink with it, and the noise keeps its size relative to
   *  the flame, so the tongues do too. */
  cols?: number;
  rows?: number;
  /** Seconds into the flame's life to start at, so two flames differ. */
  phase?: number;
}

export const createEmber = (
  canvas: HTMLCanvasElement,
  { cols = HERO_COLS, rows = HERO_ROWS, phase = 0 }: EmberOptions = {},
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const heat = new Uint8Array(cols * rows);
  const sparks: Spark[] = [];
  const centre = (cols - 1) / 2;
  const k = cols / HERO_COLS;
  const sway = P.sway * k;
  const writhe = P.writhe * k;
  const grain = P.grain / k;

  let wind = 0;
  let windTarget = 0;
  let stoke = 0;
  let clock = phase;
  let pending = 0;

  // Device pixels: the grid snaps to whole pixels so every cell is crisp.
  let cell = 0;
  let gap = 0;
  let ox = 0;
  let oy = 0;

  /** The flame's axis at height `v` (0 at the base, 1 at the top): it sways
   *  by itself, and leans with the wind, most at the tip. */
  const axis = (v: number) =>
    centre +
    (noise(clock * 0.6, v * 1.5, 7.3) - 0.5) * 2 * sway * v * v +
    (noise(v * 4 - clock * 2.5, clock * 0.3, 3.1) - 0.5) * 2 * writhe * v +
    wind * Math.pow(v, 1.4) * cols * 0.22;

  /** Half-width at height `v`: a rounded base swelling to the belly, then a
   *  long taper to the tip. */
  const halfWidth = (v: number, tall: number) => {
    const top = Math.max(0, 1 - v / tall);
    const base = Math.min(1, (v + 0.06) / (P.belly + 0.06));
    return cols * P.width * Math.sqrt(base) * Math.pow(top, P.taper);
  };

  const burn = () => {
    const tall = P.height * (1 + stoke * 0.18);
    const z = clock * 0.9;
    for (let y = 0; y < rows; y++) {
      const v = (rows - 1 - y) / (rows - 1);
      const a = axis(v);
      const hw = halfWidth(v, tall);
      for (let x = 0; x < cols; x++) {
        if (hw <= 0.01) {
          heat[y * cols + x] = 0;
          continue;
        }
        const u = (x - a) / hw;
        const body = 1 - u * u;
        // Hotter low and in the middle, cooler up and out.
        let f = body * (1.05 - v * 0.75) * (1 + stoke * 0.3);
        // The noise barely touches the core and tears at the edges and tip.
        const n = fbm(x * grain, y * grain * 0.8 + clock * P.rise, z);
        f -= (n - 0.4) * P.bite * (0.1 + v * 1.3) * (0.55 + Math.abs(u) * 0.9);
        heat[y * cols + x] = f <= 0.1 ? 0 : Math.min(LEVELS - 1, Math.round(f * (LEVELS - 1)));
      }
    }
  };

  /** The highest row still burning near the axis: where sparks leave from. */
  const tip = () => {
    for (let y = 0; y < rows; y++) {
      const v = (rows - 1 - y) / (rows - 1);
      const x = Math.min(cols - 1, Math.max(0, Math.round(axis(v))));
      if (heat[y * cols + x] > LEVELS * 0.3) return y;
    }
    return rows - 1;
  };

  const emit = (count: number) => {
    const y0 = tip();
    const v = (rows - 1 - y0) / (rows - 1);
    for (let i = 0; i < count; i++) {
      sparks.push({
        x: axis(v) + (Math.random() - 0.5) * 5 * k,
        y: y0 + 2 * k + Math.random() * 6 * k,
        vx: (wind * 5 + (Math.random() - 0.5) * 3) * k,
        vy: -(8 + Math.random() * 10) * (1 + stoke * 0.7) * k,
        age: 0,
        life: 0.8 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
      });
    }
  };

  const step = () => {
    clock += STEP;
    wind += (windTarget - wind) * 0.08;
    stoke *= 0.95;
    burn();
    if (Math.random() < P.sparks + stoke * 0.5) emit(1);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.age += STEP;
      s.vy *= 0.985;
      s.x += (s.vx + Math.sin(s.age * 5 + s.phase) * 2.4 * k + wind * 4 * k) * STEP;
      s.y += s.vy * STEP;
      if (s.age >= s.life || s.y < -1) sparks.splice(i, 1);
    }
  };

  const draw = () => {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    if (cell === 0) return;

    // The light it throws, breathing with the flame.
    const flicker = 0.88 + (noise(clock * 3, 1.7, 2.1) - 0.5) * 0.3 + stoke * 0.3;
    const gx = ox + (axis(0.25) + 0.5) * cell;
    const gy = oy + rows * 0.74 * cell;
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, cell * cols * 0.72);
    glow.addColorStop(0, `rgba(255,106,43,${(0.24 * flicker).toFixed(3)})`);
    glow.addColorStop(0.42, `rgba(255,80,30,${(0.08 * flicker).toFixed(3)})`);
    glow.addColorStop(1, 'rgba(255,80,30,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // One fill per heat level: forty fills a frame, not a thousand.
    const size = cell - gap;
    for (let level = 1; level < LEVELS; level++) {
      let any = false;
      ctx.beginPath();
      for (let i = 0; i < heat.length; i++) {
        if (heat[i] !== level) continue;
        any = true;
        ctx.rect(ox + (i % cols) * cell, oy + ((i / cols) | 0) * cell, size, size);
      }
      if (any) {
        ctx.fillStyle = PALETTE[level];
        ctx.fill();
      }
    }

    // Sparks snap to the grid, so they jump a pixel at a time like the rest.
    for (const s of sparks) {
      const t = 1 - s.age / s.life;
      const x = Math.round(s.x);
      const y = Math.round(s.y);
      if (x < 0 || x >= cols || y < 0 || y >= rows || heat[y * cols + x] > 0) continue;
      ctx.globalAlpha = Math.min(1, t * 1.8);
      ctx.fillStyle = PALETTE[Math.round((LEVELS - 1) * (0.5 + 0.45 * t))];
      ctx.fillRect(ox + x * cell, oy + y * cell, size, size);
    }
    ctx.globalAlpha = 1;
  };

  return {
    /** CSS size of the box, and the device pixel ratio to draw at. */
    resize(cssW: number, cssH: number, dpr: number) {
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      cell = Math.floor(Math.min(canvas.width / cols, canvas.height / rows));
      gap = cell >= 6 ? Math.max(1, Math.round(cell * 0.12)) : 0;
      ox = Math.round((canvas.width - cell * cols) / 2);
      oy = canvas.height - cell * rows;
      draw();
    },
    /** Advances by real seconds, in fixed steps, and repaints when it moves. */
    tick(dt: number) {
      pending = Math.min(pending + dt, STEP * 4);
      let moved = false;
      while (pending >= STEP) {
        pending -= STEP;
        step();
        moved = true;
      }
      if (moved) draw();
    },
    /** A frame of a flame that is already lit, for the first paint. */
    settle() {
      for (let i = 0; i < 40; i++) step();
      draw();
    },
    /** -1 to 1: which way to lean, as if blown from the other side. */
    fan(target: number) {
      windTarget = Math.max(-1, Math.min(1, target));
    },
    /** A tap: the flame flares and throws a handful of sparks. */
    stoke() {
      stoke = 1;
      emit(12);
    },
    /** 0 to 1: a flare without the burst of sparks, for a draught that keeps
     *  blowing. It dies down as a stoke does. */
    lift(amount: number) {
      stoke = Math.max(stoke, Math.min(1, amount));
    },
  };
};

// lib/core/math_utils.dart, ported. Angles are "fraction of a lap" maths
// throughout, so tau rather than 2π.

export const TAU = Math.PI * 2;

/** Wraps any angle into [0, tau). Dart's % is Euclidean; JS's is not. */
export const normalizeAngle = (a: number) => {
  const r = a % TAU;
  return r < 0 ? r + TAU : r;
};

/** Signed shortest rotation from `from` to `to`, in (-π, π]. */
export const angleDelta = (from: number, to: number) => {
  let d = normalizeAngle(to - from);
  if (d > Math.PI) d -= TAU;
  return d;
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export const invLerp = (a: number, b: number, v: number) =>
  Math.abs(b - a) < 1e-9 ? 0 : clamp((v - a) / (b - a), 0, 1);

export const easeOutCubic = (t: number) => {
  const u = 1 - t;
  return 1 - u * u * u;
};

/** Exponential smoothing that stays frame-rate independent. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(target, current, Math.exp(-lambda * dt));

/** Small seeded PRNG (mulberry32). Seeded so the fairness check can replay runs. */
export const createRng = (seed: number) => {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { next, bool: () => next() < 0.5 };
};

export type Rng = ReturnType<typeof createRng>;

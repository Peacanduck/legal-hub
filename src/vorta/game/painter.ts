import { CONFIG } from './config';
import { TAU, clamp, easeOutCubic, invLerp, lerp, normalizeAngle } from './math';
import { lifeT, type GameState, type Ring, type Tint } from './state';
import type { Skin } from './skins';

// lib/render/game_painter.dart on a 2D canvas. Layer order, sizes, alphas and
// speeds are the game's. The one deliberate difference is bloom: Flutter
// blurs with a mask filter, and canvas blur (`filter`, `shadowBlur`) is slow
// or missing on exactly the phones this page should run well on, so glows are
// radial gradients and stacked translucent strokes instead.

interface Rgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

const rgb = (argb: number): Rgb => ({
  a: ((argb >>> 24) & 0xff) / 255,
  r: (argb >>> 16) & 0xff,
  g: (argb >>> 8) & 0xff,
  b: argb & 0xff,
});

const WHITE: Rgb = { r: 255, g: 255, b: 255, a: 1 };

const mix = (x: Rgb, y: Rgb, t: number): Rgb => ({
  r: lerp(x.r, y.r, t),
  g: lerp(x.g, y.g, t),
  b: lerp(x.b, y.b, t),
  a: lerp(x.a, y.a, t),
});

const css = (c: Rgb, alpha = c.a) =>
  `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${clamp(alpha, 0, 1).toFixed(3)})`;

interface Palette {
  bgInner: Rgb;
  bgOuter: Rgb;
  player: Rgb;
  playerGlow: Rgb;
  ring: Rgb;
  ringGlow: Rgb;
  accent: Rgb;
  danger: Rgb;
  core: Rgb;
  grid: Rgb;
}

const palettes = new Map<string, Palette>();

const paletteOf = (skin: Skin): Palette => {
  let p = palettes.get(skin.id);
  if (!p) {
    p = {
      bgInner: rgb(skin.backgroundInner),
      bgOuter: rgb(skin.backgroundOuter),
      player: rgb(skin.player),
      playerGlow: rgb(skin.playerGlow),
      ring: rgb(skin.ring),
      ringGlow: rgb(skin.ringGlow),
      accent: rgb(skin.accent),
      danger: rgb(skin.danger),
      core: rgb(skin.core),
      grid: rgb(skin.grid),
    };
    palettes.set(skin.id, p);
  }
  return p;
};

const tint = (p: Palette, t: Tint) => (t === 0 ? p.player : t === 1 ? p.accent : p.danger);

/** The solid segments between a ring's gaps, in absolute angles. */
const solidArcs = (ring: Ring) => {
  const gaps = ring.gaps
    .map((g) => ({ start: normalizeAngle(ring.rotation + g.center - g.halfWidth), width: g.halfWidth * 2 }))
    .sort((a, b) => a.start - b.start);
  const arcs: [start: number, sweep: number][] = [];
  for (let i = 0; i < gaps.length; i++) {
    const from = gaps[i].start + gaps[i].width;
    // A single gap wraps the whole way round, which normalizeAngle collapses
    // to ~0, so the full complement is restored explicitly.
    const sweep = gaps.length === 1 ? TAU - gaps[0].width : normalizeAngle(gaps[(i + 1) % gaps.length].start - from);
    if (sweep > 0.005) arcs.push([from, sweep]);
  }
  return arcs;
};

export interface PaintOptions {
  /** Field radius as a fraction of the shorter side. The game uses 0.46. */
  fieldFraction: number;
  /** False under prefers-reduced-motion: no shake, no flash. */
  motion: boolean;
  /** Device pixel ratio, for the few effects canvas does not scale. */
  dpr: number;
  font: string;
}

/** One painter per canvas: it caches the frame-invariant gradients. */
export const createPainter = (ctx: CanvasRenderingContext2D) => {
  let cacheKey = '';
  let background: CanvasGradient | null = null;
  let vignette: CanvasGradient | null = null;

  const glowDisc = (x: number, y: number, radius: number, sigma: number, c: Rgb, alpha: number) => {
    if (alpha <= 0.005 || radius <= 0) return;
    const outer = radius + sigma * 2;
    const g = ctx.createRadialGradient(x, y, 0, x, y, outer);
    g.addColorStop(0, css(c, alpha));
    g.addColorStop(Math.max(0, radius - sigma) / outer, css(c, alpha * 0.9));
    g.addColorStop(radius / outer, css(c, alpha * 0.5));
    g.addColorStop(1, css(c, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, outer, 0, TAU);
    ctx.fill();
  };

  const strokeArcs = (
    cx: number,
    cy: number,
    r: number,
    arcs: [number, number][],
    width: number,
    style: string,
  ) => {
    ctx.lineWidth = width;
    ctx.strokeStyle = style;
    ctx.beginPath();
    for (const [start, sweep] of arcs) {
      ctx.moveTo(cx + Math.cos(start) * r, cy + Math.sin(start) * r);
      ctx.arc(cx, cy, r, start, start + sweep);
    }
    ctx.stroke();
  };

  const paint = (w: number, h: number, state: GameState, skin: Skin, opts: PaintOptions) => {
    const p = paletteOf(skin);
    const scale = Math.min(w, h) * opts.fieldFraction;
    const R = (v: number) => v * scale;
    const t = state.ambientTime;

    // Shake: two out-of-phase sines, which read as chaos without the
    // frame-to-frame jitter of noise. The backdrop stays on the true centre.
    let cx = w / 2;
    let cy = h / 2;
    if (opts.motion && state.shake > 0.001) {
      const mag = R(0.028) * state.shake;
      cx += Math.sin(t * 97) * mag;
      cy += Math.cos(t * 79.3) * mag;
    }

    const key = `${w}x${h}:${skin.id}`;
    if (key !== cacheKey) {
      cacheKey = key;
      const longest = Math.max(w, h);
      background = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, longest * 0.75);
      background.addColorStop(0, css(p.bgInner));
      background.addColorStop(1, css(p.bgOuter));
      vignette = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, longest * 0.62);
      vignette.addColorStop(0.55, css(p.bgOuter, 0));
      vignette.addColorStop(1, css(p.bgOuter, 0.72));
    }

    ctx.fillStyle = background!;
    ctx.fillRect(0, 0, w, h);
    ctx.lineCap = 'butt';

    // Polar grid, the spokes slowly turning.
    ctx.strokeStyle = css(p.grid);
    ctx.lineWidth = Math.max(1, R(0.0025));
    ctx.beginPath();
    for (let i = 1; i <= 6; i++) {
      const r = R(0.22 * i);
      ctx.moveTo(cx + r, cy);
      ctx.arc(cx, cy, r, 0, TAU);
    }
    const inner = R(0.16);
    const outer = R(1.5);
    for (let i = 0; i < 12; i++) {
      const a = (TAU / 12) * i + t * 0.045;
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    }
    ctx.stroke();

    // The dashed orbit the player rides: where every ring will meet you.
    {
      const r = R(CONFIG.playerOrbitRadius);
      const step = TAU / 72;
      const sweep = step * 0.55;
      const rot = t * 0.12;
      ctx.strokeStyle = css(p.player, 0.18);
      ctx.lineWidth = Math.max(1, R(0.004));
      ctx.beginPath();
      for (let i = 0; i < 72; i++) {
        const a = rot + step * i;
        ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.arc(cx, cy, r, a, a + sweep);
      }
      ctx.stroke();
    }

    // Core.
    {
      const pulse = state.corePulse;
      const breathe = 1 + Math.sin(t * 1.8) * 0.035;
      const r = R(CONFIG.coreRadius) * breathe * (1 + pulse * 0.22);
      glowDisc(cx, cy, r * 2.4, r * 0.9, p.core, 0.16 + pulse * 0.28);
      const body = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      body.addColorStop(0, css(mix(p.bgOuter, p.core, 0.35)));
      body.addColorStop(1, css(p.core));
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = css(mix(p.core, WHITE, 0.55 + pulse * 0.35), 0.8);
      ctx.lineWidth = Math.max(1.5, R(0.006));
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = Math.max(1, R(0.0035));
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const rr = r * (0.44 + i * 0.18);
        const start = t * (0.6 + i * 0.35) * (i % 2 === 0 ? 1 : -1) + i * 2.1;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, start, start + 1.15);
        ctx.stroke();
      }
    }

    // Shockwaves.
    ctx.lineCap = 'butt';
    for (const s of state.shockwaves) {
      const st = lifeT(s);
      const alpha = (1 - st) * 0.55;
      if (alpha <= 0.01) continue;
      const c = tint(p, s.tint);
      const width = R(s.thickness) * (1 - st * 0.6);
      ctx.beginPath();
      ctx.arc(cx, cy, R(s.radius), 0, TAU);
      ctx.strokeStyle = css(c, alpha * 0.3);
      ctx.lineWidth = width + R(0.012) * 2;
      ctx.stroke();
      ctx.strokeStyle = css(c, alpha * 0.7);
      ctx.lineWidth = width;
      ctx.stroke();
    }

    // Rings.
    ctx.lineCap = 'round';
    for (const ring of state.rings) {
      const r = R(ring.radius);
      if (r <= 1) continue;
      // Fade in from off-field, dim once passed: attention stays on the next one.
      const alpha = ring.resolved ? 0.3 : easeOutCubic(invLerp(CONFIG.ringSpawnRadius, 1.05, ring.radius));
      if (alpha <= 0.01) continue;
      const proximity = 1 - clamp(Math.abs(ring.radius - CONFIG.playerOrbitRadius) / 0.5, 0, 1);
      const base = ring.resolved ? p.ring : mix(p.ring, p.danger, proximity * 0.45);
      const stroke = R(ring.thickness);
      const arcs = solidArcs(ring);

      const glow = mix(p.ringGlow, p.danger, proximity * 0.5);
      strokeArcs(cx, cy, r, arcs, stroke * 3.6, css(glow, alpha * 0.06));
      strokeArcs(cx, cy, r, arcs, stroke * 2.7, css(glow, alpha * 0.1));
      strokeArcs(cx, cy, r, arcs, stroke * 1.9, css(glow, alpha * 0.16));

      strokeArcs(cx, cy, r, arcs, stroke, css(base, alpha));
      // Lit inner edge: sells the arcs as solid objects.
      strokeArcs(cx, cy, r - stroke * 0.42, arcs, Math.max(1, stroke * 0.16), css(mix(base, WHITE, 0.6), alpha * 0.55));

      // Gap goalposts. Without them the eye has to find the absence of a thing.
      ctx.strokeStyle = css(p.accent, alpha * 0.75);
      ctx.lineWidth = Math.max(1, R(0.004));
      ctx.beginPath();
      for (const g of ring.gaps) {
        for (const side of [-1, 1]) {
          const a = ring.rotation + g.center + g.halfWidth * side;
          const c = Math.cos(a);
          const s = Math.sin(a);
          ctx.moveTo(cx + c * (r - stroke * 0.8), cy + s * (r - stroke * 0.8));
          ctx.lineTo(cx + c * (r + stroke * 0.8), cy + s * (r + stroke * 0.8));
        }
      }
      ctx.stroke();

      if (ring.passFlash > 0.01) {
        const f = ring.passFlash;
        const start = ring.rotation + ring.passAngle - 0.5;
        const width = stroke * (1 + f * 1.4);
        strokeArcs(cx, cy, r, [[start, 1]], width + stroke * f * 2, css(p.accent, f * 0.3));
        strokeArcs(cx, cy, r, [[start, 1]], width, css(p.accent, f * 0.75));
      }
    }

    // Motes: four-point stars, which read as "valuable" where a dot does not.
    for (const m of state.motes) {
      const alpha = clamp(1 - m.collectAnim, 0, 1);
      if (alpha <= 0.01) continue;
      const x = cx + Math.cos(m.angle) * R(m.radius);
      const y = cy + Math.sin(m.angle) * R(m.radius);
      const r = R(CONFIG.moteRadius) * (1 + m.collectAnim * 1.8);
      const spin = t * 2.2 + m.angle * 3;
      const pulse = 1 + Math.sin(t * 5 + m.angle) * 0.12;
      glowDisc(x, y, r * 2.6 * pulse, r * 1.1, p.accent, 0.3 * alpha);
      ctx.fillStyle = css(p.accent, alpha);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = spin + (Math.PI / 4) * i;
        const rad = i % 2 === 0 ? r * 1.5 * pulse : r * 0.55;
        if (i === 0) ctx.moveTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
        else ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = css(WHITE, alpha * 0.95);
      ctx.beginPath();
      ctx.arc(x, y, r * 0.42, 0, TAU);
      ctx.fill();
    }

    for (const q of state.particles) {
      const qt = lifeT(q);
      const alpha = (1 - qt) * (1 - qt);
      if (alpha <= 0.01) continue;
      ctx.fillStyle = css(tint(p, q.tint), alpha);
      ctx.beginPath();
      ctx.arc(cx + R(q.x), cy + R(q.y), R(q.size) * (1 - qt * 0.55), 0, TAU);
      ctx.fill();
    }

    // Player. Replaced by debris once dead.
    if (state.phase !== 'dying' && state.phase !== 'dead') {
      const orbitR = R(CONFIG.playerOrbitRadius);
      const r = R(CONFIG.playerRadius);
      const n = state.trail.length;
      for (let i = 0; i < n; i++) {
        const f = i / n;
        const a = state.trail[i];
        ctx.fillStyle = css(p.playerGlow, f * f * 0.42 * skin.trailIntensity);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * orbitR, cy + Math.sin(a) * orbitR, r * (0.25 + f * 0.7), 0, TAU);
        ctx.fill();
      }

      const x = cx + R(state.playerX);
      const y = cy + R(state.playerY);
      const flick = state.reverseAnim;
      glowDisc(x, y, r * (3 + flick * 1.6), r * 1.5, p.playerGlow, 0.34 + flick * 0.3);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(state.playerAngle + (state.playerDir > 0 ? 1 : -1) * (Math.PI / 2));
      // Squash along the direction of travel on a reversal: a little
      // anticipation makes the flip feel physical.
      ctx.scale(1 + flick * 0.35, 1 - flick * 0.22);
      ctx.fillStyle = css(p.player);
      ctx.beginPath();
      switch (skin.shape) {
        case 'orb':
          ctx.arc(0, 0, r, 0, TAU);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath();
          ctx.arc(-r * 0.22, -r * 0.22, r * 0.34, 0, TAU);
          ctx.fill();
          break;
        case 'dart':
          ctx.moveTo(r * 1.5, 0);
          ctx.lineTo(-r * 0.9, r * 0.95);
          ctx.lineTo(-r * 0.4, 0);
          ctx.lineTo(-r * 0.9, -r * 0.95);
          ctx.closePath();
          ctx.fill();
          break;
        case 'diamond':
          ctx.moveTo(r * 1.35, 0);
          ctx.lineTo(0, r);
          ctx.lineTo(-r * 1.35, 0);
          ctx.lineTo(0, -r);
          ctx.closePath();
          ctx.fill();
          break;
        case 'blade':
          ctx.moveTo(r * 1.8, 0);
          ctx.quadraticCurveTo(0, r * 0.85, -r * 1.3, 0);
          ctx.quadraticCurveTo(0, -r * 0.85, r * 1.8, 0);
          ctx.closePath();
          ctx.fill();
          break;
        case 'ring':
          ctx.strokeStyle = css(p.player);
          ctx.lineWidth = r * 0.55;
          ctx.arc(0, 0, r * 0.85, 0, TAU);
          ctx.stroke();
          break;
      }
      ctx.restore();
    }

    // Floating "+2" and "CLOSE!".
    if (state.floaters.length > 0) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const f of state.floaters) {
        const ft = lifeT(f);
        const alpha = clamp(1 - ft * ft, 0, 1);
        if (alpha <= 0.01) continue;
        ctx.font = `800 ${R(0.075) * f.scale * (1 + ft * 0.25)}px ${opts.font}`;
        ctx.shadowColor = css(p.bgOuter, alpha * 0.8);
        ctx.shadowBlur = 6 * opts.dpr;
        ctx.fillStyle = css(tint(p, f.tint), alpha);
        ctx.fillText(f.text, cx + R(f.x), cy + R(f.y));
      }
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }

    ctx.fillStyle = vignette!;
    ctx.fillRect(0, 0, w, h);

    if (opts.motion && state.flash > 0.01) {
      ctx.fillStyle = css(mix(p.accent, WHITE, 0.6), state.flash * 0.5);
      ctx.fillRect(0, 0, w, h);
    }
  };

  return { paint };
};

export type Painter = ReturnType<typeof createPainter>;

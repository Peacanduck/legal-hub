import {
  CONFIG,
  gapCountAt,
  gapHalfWidthAt,
  playerSpeedAt,
  progress,
  ringIntervalAt,
  ringSpeedAt,
  ringSpinAt,
} from './config';
import { TAU, angleDelta, clamp, damp, lerp, normalizeAngle, type Rng } from './math';

// lib/game/game_state.dart and entities.dart, ported. Coins, revives and the
// audio event queue are left out because the page has no shop, no ads and no
// sound; everything that decides whether a ring is fair, and when you die, is
// line for line.

export type Phase = 'ready' | 'playing' | 'dying' | 'dead';

/** 0 = player colour, 1 = accent, 2 = danger. Resolved by the skin. */
export type Tint = 0 | 1 | 2;

export interface Gap {
  center: number;
  halfWidth: number;
}

export interface Ring {
  radius: number;
  prevRadius: number;
  speed: number;
  rotation: number;
  spin: number;
  thickness: number;
  gaps: Gap[];
  resolved: boolean;
  alive: boolean;
  passFlash: number;
  passAngle: number;
}

export interface Mote {
  angle: number;
  radius: number;
  speed: number;
  spin: number;
  alive: boolean;
  collected: boolean;
  collectAnim: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  tint: Tint;
  drag: number;
  gravityToCore: number;
}

export interface Shockwave {
  radius: number;
  targetRadius: number;
  life: number;
  maxLife: number;
  tint: Tint;
  thickness: number;
}

export interface Floater {
  text: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  tint: Tint;
  scale: number;
}

/** Absolute angle of a gap centre `dt` seconds from now. */
export const gapAngleAt = (ring: Ring, index: number, dt: number) =>
  ring.rotation + ring.spin * dt + ring.gaps[index].center;

/** 0 at birth, 1 at death. */
export const lifeT = (e: { life: number; maxLife: number }) => 1 - clamp(e.life / e.maxLife, 0, 1);

/** Removes in place, so a 120 Hz step does not allocate five arrays. */
const prune = <T>(list: T[], keep: (item: T) => boolean) => {
  let w = 0;
  for (let r = 0; r < list.length; r++) {
    const item = list[r];
    if (keep(item)) list[w++] = item;
  }
  list.length = w;
};

export class GameState {
  phase: Phase = 'ready';
  /** Seconds of active play. Drives the whole difficulty curve. */
  elapsed = 0;
  /** Free-running clock for ambient motion; advances even when dead. */
  ambientTime = 0;
  private accumulator = 0;

  playerAngle = -Math.PI / 2;
  playerDir = 1;
  reverseAnim = 0;
  readonly trail: number[] = [];
  private trailTimer = 0;

  readonly rings: Ring[] = [];
  readonly motes: Mote[] = [];
  readonly particles: Particle[] = [];
  readonly shockwaves: Shockwave[] = [];
  readonly floaters: Floater[] = [];

  private spawnTimer = 0;
  // Where the player is expected to be, and when, after threading the most
  // recently spawned ring. See spawnRing for why this has to be tracked.
  private plannedAngle = 0;
  private plannedArrivalTime = -1;

  score = 0;
  combo = 0;
  bestCombo = 0;
  comboTimer = 0;
  gapsPassed = 0;
  motesCollected = 0;
  nearMisses = 0;

  shake = 0;
  flash = 0;
  private slowMoTimer = 0;
  private slowMoScale = 1;
  private freezeTimer = 0;
  deathTimer = 0;
  timeScale = 1;
  corePulse = 0;

  private readonly rng: Rng;

  constructor(rng: Rng) {
    this.rng = rng;
    this.plannedAngle = this.playerAngle;
  }

  get comboMultiplier() {
    return Math.min(1 + this.combo * CONFIG.comboMultiplierStep, CONFIG.comboMultiplierMax);
  }

  /** How much of the combo window is left, 0..1. */
  get comboFraction() {
    return this.combo <= 0 ? 0 : clamp(this.comboTimer / CONFIG.comboDecaySeconds, 0, 1);
  }

  get playerX() {
    return Math.cos(this.playerAngle) * CONFIG.playerOrbitRadius;
  }

  get playerY() {
    return Math.sin(this.playerAngle) * CONFIG.playerOrbitRadius;
  }

  get isRunning() {
    return this.phase === 'playing';
  }

  start() {
    if (this.phase !== 'ready') return;
    this.phase = 'playing';
    this.spawnTimer = 0.55; // brief grace before the first ring
    this.corePulse = 1;
    this.shockwaves.push({ radius: CONFIG.coreRadius, targetRadius: 1.3, life: 0.6, maxLife: 0.6, tint: 1, thickness: 0.02 });
  }

  /** The one input: flip orbital direction. The first tap starts the run. */
  reverse() {
    if (this.phase === 'ready') {
      this.start();
      return;
    }
    if (this.phase !== 'playing') return;
    this.playerDir = -this.playerDir;
    this.reverseAnim = 1;
    this.emitBurst(this.playerX, this.playerY, 6, 0.35, 0.28, 0, 0.008);
  }

  /**
   * Advances by `realDt` seconds of wall time on a fixed 120 Hz step, so the
   * physics are identical at any frame rate. `beforeStep` runs ahead of every
   * step, which is where a bot reads the field, exactly as the game's tests do.
   */
  update(realDt: number, beforeStep?: (state: GameState) => void) {
    const dt = clamp(realDt, 0, CONFIG.maxFrameTime);
    this.ambientTime += dt;

    // Freeze-frame and slow-mo are wall-clock effects.
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      this.timeScale = 0;
      this.updatePresentationOnly(dt);
      return;
    }
    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= dt;
      if (this.slowMoTimer <= 0) this.slowMoScale = 1;
    }
    this.timeScale = this.slowMoScale;
    this.accumulator += dt * this.timeScale;

    const h = CONFIG.fixedStep;
    let steps = 0;
    while (this.accumulator >= h && steps < 8) {
      beforeStep?.(this);
      this.step(h);
      this.accumulator -= h;
      steps++;
    }
    // Too far behind to catch up: drop the backlog rather than spiral.
    if (steps >= 8) this.accumulator = 0;
  }

  private updatePresentationOnly(dt: number) {
    this.flash = damp(this.flash, 0, 9, dt);
    this.shake = damp(this.shake, 0, 5, dt);
    for (const s of this.shockwaves) updateShockwave(s, dt);
    prune(this.shockwaves, (s) => s.life > 0);
    for (const p of this.particles) updateParticle(p, dt);
    prune(this.particles, (p) => p.life > 0);
  }

  private step(h: number) {
    this.reverseAnim = damp(this.reverseAnim, 0, 7, h);
    this.flash = damp(this.flash, 0, 9, h);
    this.shake = damp(this.shake, 0, 5, h);
    this.corePulse = damp(this.corePulse, 0, 4.5, h);

    for (const p of this.particles) updateParticle(p, h);
    prune(this.particles, (p) => p.life > 0);
    for (const s of this.shockwaves) updateShockwave(s, h);
    prune(this.shockwaves, (s) => s.life > 0);
    for (const f of this.floaters) {
      f.life -= h;
      f.y -= 0.14 * h;
    }
    prune(this.floaters, (f) => f.life > 0);
    for (const m of this.motes) {
      if (m.collected) m.collectAnim = Math.min(1, m.collectAnim + h * 6);
    }
    prune(this.motes, (m) => !(m.collected && m.collectAnim >= 1));

    switch (this.phase) {
      case 'ready':
        this.stepAttract(h);
        return;
      case 'dying':
        this.deathTimer += h;
        this.stepDeath(h);
        if (this.deathTimer >= CONFIG.deathAnimDuration) this.phase = 'dead';
        return;
      case 'dead':
        return;
      case 'playing':
        break;
    }

    this.elapsed += h;
    this.stepPlayer(h);
    this.stepRings(h);
    this.stepMotes(h);
    this.stepCombo(h);
    this.stepSpawning(h);
  }

  private stepAttract(h: number) {
    this.playerAngle = normalizeAngle(this.playerAngle + 0.9 * h);
    this.pushTrail(h);
    for (const m of this.motes) m.angle += m.spin * h;
  }

  private stepPlayer(h: number) {
    const speed = playerSpeedAt(this.elapsed);
    this.playerAngle = normalizeAngle(this.playerAngle + this.playerDir * speed * h);
    this.pushTrail(h);
  }

  private pushTrail(h: number) {
    this.trailTimer += h;
    const sampleEvery = 1 / 90;
    while (this.trailTimer >= sampleEvery) {
      this.trailTimer -= sampleEvery;
      this.trail.push(this.playerAngle);
      if (this.trail.length > 22) this.trail.shift();
    }
  }

  private stepRings(h: number) {
    const pr = CONFIG.playerOrbitRadius;
    for (const ring of this.rings) {
      ring.prevRadius = ring.radius;
      ring.radius -= ring.speed * h;
      ring.rotation = normalizeAngle(ring.rotation + ring.spin * h);
      ring.passFlash = damp(ring.passFlash, 0, 4, h);
      if (!ring.resolved && ring.prevRadius > pr && ring.radius <= pr) this.resolveCrossing(ring, h, pr);
      if (ring.radius <= CONFIG.ringDespawnRadius) ring.alive = false;
    }
    prune(this.rings, (r) => r.alive);
  }

  /**
   * Judges a ring at the exact instant it crosses the player's orbit, rewinding
   * both the ring and the player to the sub-step moment of the crossing.
   */
  private resolveCrossing(ring: Ring, h: number, pr: number) {
    ring.resolved = true;

    const travelled = ring.prevRadius - ring.radius;
    const f = travelled > 1e-9 ? clamp((ring.prevRadius - pr) / travelled, 0, 1) : 0;
    const rewind = h * (1 - f);
    const ringRotAtCross = ring.rotation - ring.spin * rewind;
    const playerAtCross = this.playerAngle - this.playerDir * playerSpeedAt(this.elapsed) * rewind;

    // 0 = dead centre of the nearest gap, 1 = exactly on its edge.
    let bestEdgeness = Infinity;
    let bestLocalAngle = 0;
    for (const gap of ring.gaps) {
      const d = Math.abs(angleDelta(playerAtCross, ringRotAtCross + gap.center));
      const edgeness = gap.halfWidth > 1e-6 ? d / gap.halfWidth : Infinity;
      if (edgeness < bestEdgeness) {
        bestEdgeness = edgeness;
        bestLocalAngle = gap.center;
      }
    }

    if (bestEdgeness > 1) {
      this.die(playerAtCross, ring);
      return;
    }

    ring.passFlash = 1;
    ring.passAngle = bestLocalAngle;
    this.gapsPassed++;
    this.bank(CONFIG.scorePerGap);
    this.shake += CONFIG.shakeOnPass;
    this.corePulse = 1;

    const px = Math.cos(playerAtCross) * pr;
    const py = Math.sin(playerAtCross) * pr;
    this.emitBurst(px, py, 10, 0.55, 0.4, 1, 0.007);

    if (bestEdgeness >= 1 - CONFIG.nearMissThreshold) {
      this.nearMisses++;
      this.score += CONFIG.nearMissBonus;
      this.shake += CONFIG.shakeOnNearMiss;
      this.slowMoTimer = CONFIG.nearMissSlowMoDuration;
      this.slowMoScale = CONFIG.nearMissSlowMoScale;
      this.flash = Math.max(this.flash, 0.25);
      this.floaters.push({
        text: 'CLOSE!',
        x: Math.cos(playerAtCross) * (pr + 0.1),
        y: Math.sin(playerAtCross) * (pr + 0.1),
        life: 0.75,
        maxLife: 0.75,
        tint: 2,
        scale: 1.15,
      });
      this.emitBurst(px, py, 14, 0.9, 0.5, 2, 0.009);
    }
  }

  private stepMotes(h: number) {
    const pr = CONFIG.playerOrbitRadius;
    for (const m of this.motes) {
      if (m.collected) continue;
      m.radius -= m.speed * h;
      m.angle = normalizeAngle(m.angle + m.spin * h);
      if (m.radius <= CONFIG.ringDespawnRadius) {
        m.alive = false;
        continue;
      }

      const dr = m.radius - pr;
      const arc = angleDelta(this.playerAngle, m.angle) * pr;
      if (Math.sqrt(dr * dr + arc * arc) <= CONFIG.moteCollectDistance) {
        const mx = Math.cos(m.angle) * m.radius;
        const my = Math.sin(m.angle) * m.radius;
        m.collected = true;
        this.motesCollected++;
        this.bank(CONFIG.scorePerMote);
        this.shake += CONFIG.shakeOnMote;
        this.corePulse = 1;
        this.emitBurst(mx, my, 12, 0.5, 0.45, 1, 0.008);
        this.floaters.push({
          text: `+${Math.round(CONFIG.scorePerMote * this.comboMultiplier)}`,
          x: mx,
          y: my,
          life: 0.6,
          maxLife: 0.6,
          tint: 1,
          scale: 1,
        });
      }
    }
    prune(this.motes, (m) => m.alive);
  }

  private stepCombo(h: number) {
    if (this.combo <= 0) return;
    this.comboTimer -= h;
    if (this.comboTimer <= 0) {
      this.combo = 0;
      this.comboTimer = 0;
    }
  }

  private stepSpawning(h: number) {
    this.spawnTimer -= h;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = ringIntervalAt(this.elapsed);
    this.spawnRing();
  }

  private stepDeath(h: number) {
    // Everything keeps drifting in, heavily damped: a slow collapse reads
    // better than an abrupt freeze.
    const slow = 0.18;
    for (const ring of this.rings) {
      ring.prevRadius = ring.radius;
      ring.radius -= ring.speed * slow * h;
      ring.rotation = normalizeAngle(ring.rotation + ring.spin * slow * h);
      ring.passFlash = damp(ring.passFlash, 0, 4, h);
      if (ring.radius <= CONFIG.ringDespawnRadius) ring.alive = false;
    }
    prune(this.rings, (r) => r.alive);
    for (const m of this.motes) m.radius -= m.speed * slow * h;
    prune(this.motes, (m) => m.radius > CONFIG.ringDespawnRadius);
  }

  /**
   * Spawns a ring that is guaranteed reachable — the fairness chain. Reach is
   * budgeted from the predicted position after the previous ring, not from
   * where the player is now, because by mid-game two rings are in the air at
   * once and the player is already committed to the first. The full reasoning
   * is on `_spawnRing` in the game; this is the same arithmetic.
   */
  private spawnRing() {
    const t = this.elapsed;
    const speed = ringSpeedAt(t);
    const spin = ringSpinAt(t) * (this.rng.bool() ? 1 : -1);
    const halfWidth = gapHalfWidthAt(t);

    const tArrive = (CONFIG.ringSpawnRadius - CONFIG.playerOrbitRadius) / Math.max(speed, 1e-4);
    const arrivalTime = this.elapsed + tArrive;
    const playerSpeed = playerSpeedAt(t);

    let anchorAngle: number;
    let availableTime: number;
    if (this.plannedArrivalTime > this.elapsed) {
      anchorAngle = this.plannedAngle;
      availableTime = Math.max(arrivalTime - this.plannedArrivalTime, 0.05);
    } else {
      anchorAngle = this.playerAngle;
      availableTime = tArrive;
    }

    const budget = Math.min(playerSpeed * availableTime * CONFIG.fairnessReachMargin, Math.PI);

    // Multi-gap rings cluster their openings, and shed gaps when the cluster
    // would eat more than its share of the reach budget.
    const spacing = CONFIG.gapSpacingFactor * halfWidth;
    let gapCount = gapCountAt(t);
    let spread = ((gapCount - 1) / 2) * spacing;
    while (gapCount > 1 && spread > budget * CONFIG.gapClusterBudgetShare) {
      gapCount--;
      spread = ((gapCount - 1) / 2) * spacing;
    }

    const usable = Math.max(0, budget - spread);
    const minFrac = lerp(0.05, 0.45, progress(t));
    const frac = minFrac + this.rng.next() * (1 - minFrac);
    const sign = this.rng.bool() ? 1 : -1;
    const desiredAbs = anchorAngle + sign * frac * usable;

    const gaps: Gap[] = [];
    for (let i = 0; i < gapCount; i++) {
      gaps.push({ center: normalizeAngle((i - (gapCount - 1) / 2) * spacing), halfWidth });
    }

    const ring: Ring = {
      radius: CONFIG.ringSpawnRadius,
      prevRadius: CONFIG.ringSpawnRadius,
      speed,
      rotation: normalizeAngle(desiredAbs - spin * tArrive),
      spin,
      thickness: CONFIG.ringThickness,
      gaps,
      resolved: false,
      alive: true,
      passFlash: 0,
      passAngle: 0,
    };
    this.rings.push(ring);

    this.plannedAngle = normalizeAngle(desiredAbs);
    this.plannedArrivalTime = arrivalTime;

    if (this.rng.next() < CONFIG.moteSpawnChance) this.spawnMote(ring, desiredAbs);
  }

  /** A mote deliberately off the safe line: points now against a clean exit. */
  private spawnMote(ring: Ring, safeAngle: number) {
    const spawnR = CONFIG.ringSpawnRadius - 0.22;
    const moteSpeed = ring.speed * CONFIG.moteSpeedFactor;
    const moteArrive = (spawnR - CONFIG.playerOrbitRadius) / Math.max(moteSpeed, 1e-4);
    const offset = (0.45 + this.rng.next() * 0.5) * (this.rng.bool() ? 1 : -1);
    const moteSpin = (this.rng.next() - 0.5) * 0.5;
    this.motes.push({
      angle: normalizeAngle(safeAngle + offset - moteSpin * moteArrive),
      radius: spawnR,
      speed: moteSpeed,
      spin: moteSpin,
      alive: true,
      collected: false,
      collectAnim: 0,
    });
  }

  private bank(base: number) {
    this.score += Math.round(base * this.comboMultiplier);
    this.combo++;
    if (this.combo > this.bestCombo) this.bestCombo = this.combo;
    this.comboTimer = CONFIG.comboDecaySeconds;
  }

  private die(angleAtCross: number, killer: Ring) {
    this.phase = 'dying';
    this.deathTimer = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.shake = CONFIG.shakeOnDeath;
    this.flash = 1;
    this.freezeTimer = CONFIG.deathFreezeDuration;
    this.slowMoTimer = 0;
    this.slowMoScale = 1;

    const pr = CONFIG.playerOrbitRadius;
    const px = Math.cos(angleAtCross) * pr;
    const py = Math.sin(angleAtCross) * pr;
    this.emitBurst(px, py, 46, 1.5, 1.1, 2, 0.011);
    this.emitBurst(px, py, 22, 0.7, 1.4, 0, 0.008);
    this.shockwaves.push({ radius: pr, targetRadius: 1.6, life: 0.8, maxLife: 0.8, tint: 2, thickness: 0.035 });
    this.shockwaves.push({ radius: pr, targetRadius: CONFIG.coreRadius, life: 0.6, maxLife: 0.6, tint: 2, thickness: 0.02 });

    for (let i = 0; i < 16; i++) {
      const a = this.rng.next() * TAU;
      const life = 0.5 + this.rng.next() * 0.6;
      this.particles.push({
        x: Math.cos(a) * killer.radius,
        y: Math.sin(a) * killer.radius,
        vx: Math.cos(a) * 0.25 * this.rng.next(),
        vy: Math.sin(a) * 0.25 * this.rng.next(),
        life,
        maxLife: life,
        size: 0.006 + this.rng.next() * 0.006,
        tint: 2,
        drag: 2.2,
        gravityToCore: 0.5,
      });
    }
  }

  private emitBurst(x: number, y: number, count: number, speed: number, life: number, tint: Tint, size: number) {
    for (let i = 0; i < count; i++) {
      const a = this.rng.next() * TAU;
      const s = speed * (0.35 + this.rng.next() * 0.65);
      const l = life * (0.6 + this.rng.next() * 0.6);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: l,
        maxLife: l,
        size: size * (0.7 + this.rng.next() * 0.6),
        tint,
        drag: 2.2,
        gravityToCore: 0,
      });
    }
  }
}

const updateParticle = (p: Particle, dt: number) => {
  p.life -= dt;
  if (p.gravityToCore !== 0) {
    const d = Math.sqrt(p.x * p.x + p.y * p.y);
    if (d > 1e-4) {
      p.vx += (-p.x / d) * p.gravityToCore * dt;
      p.vy += (-p.y / d) * p.gravityToCore * dt;
    }
  }
  const f = Math.exp(-p.drag * dt);
  p.vx *= f;
  p.vy *= f;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
};

const updateShockwave = (s: Shockwave, dt: number) => {
  s.life -= dt;
  s.radius = lerp(s.radius, s.targetRadius, 1 - Math.exp(-6 * dt));
};

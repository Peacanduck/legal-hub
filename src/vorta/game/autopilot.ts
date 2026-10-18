import { CONFIG, playerSpeedAt } from './config';
import { angleDelta } from './math';
import { gapAngleAt, type GameState, type Ring } from './state';

interface Target {
  /** Absolute angle the chosen gap will be at when its ring arrives. */
  angle: number;
  /** Signed shortest travel from the player to it. */
  toGap: number;
  /** Seconds until its ring crosses the orbit. */
  time: number;
  halfWidth: number;
}

/**
 * Gap selection from test/autopilot.dart in the game: look one ring ahead and
 * prefer the gap that leaves a reachable line into the ring behind it. The
 * spawner's fairness guarantee is written against exactly this standard of
 * play, so both bots below share it.
 */
const pickTarget = (state: GameState): Target | null => {
  const orbitR = CONFIG.playerOrbitRadius;
  const speed = playerSpeedAt(state.elapsed);

  let first: Ring | null = null;
  let second: Ring | null = null;
  let tFirst = Infinity;
  let tSecond = Infinity;
  for (const ring of state.rings) {
    if (ring.resolved || ring.radius <= orbitR) continue;
    const t = (ring.radius - orbitR) / Math.max(ring.speed, 1e-6);
    if (t < tFirst) {
      second = first;
      tSecond = tFirst;
      first = ring;
      tFirst = t;
    } else if (t < tSecond) {
      second = ring;
      tSecond = t;
    }
  }
  if (!first) return null;

  let best: Target | null = null;
  let bestScore = Infinity;
  for (let i = 0; i < first.gaps.length; i++) {
    const gapAbs = gapAngleAt(first, i, tFirst);
    const toGap = angleDelta(state.playerAngle, gapAbs);
    let score = Math.abs(toGap);
    if (second) {
      const window = Math.max(tSecond - tFirst, 0);
      let followOn = Infinity;
      for (let j = 0; j < second.gaps.length; j++) {
        const d = Math.abs(angleDelta(gapAbs, gapAngleAt(second, j, tSecond)));
        followOn = Math.min(followOn, d + (d <= speed * window ? 0 : 100));
      }
      score = followOn;
    }
    if (Math.abs(toGap) > speed * tFirst) score += 1000;
    if (score < bestScore) {
      bestScore = score;
      best = { angle: gapAbs, toGap, time: tFirst, halfWidth: first.gaps[i].halfWidth };
    }
  }
  return best;
};

/**
 * The game's test autopilot, unchanged: bang-bang steering toward the target.
 * The page never shows it. It is here so the port can be checked the way the
 * game is — if it dies, a ring was unreachable and the spawner was mis-ported.
 */
export const testAutopilot = (state: GameState) => {
  if (!state.isRunning) return;
  const target = pickTarget(state);
  if (!target) return;
  const desired = target.toGap >= 0 ? 1 : -1;
  if (state.playerDir !== desired) state.reverse();
};

/**
 * The bot that plays the demo: the same target as the test autopilot, flown
 * differently. Bang-bang control holds a position by reversing on nearly every
 * step, which reads on screen as a vibrating dot. This one keeps flying while
 * it can still make the gap and only turns when it must, so it sweeps the
 * field the way a confident player does, and settles into a narrow swing for
 * the last moment before the ring arrives.
 */
export const showAutopilot = (state: GameState) => {
  if (!state.isRunning) return;
  const target = pickTarget(state);
  if (!target) return;

  const speed = playerSpeedAt(state.elapsed);
  const e = target.toGap;
  const away = e !== 0 && Math.sign(e) !== state.playerDir;
  const settle = 0.24;

  if (target.time <= settle) {
    if (away && Math.abs(e) > target.halfWidth * 0.45) state.reverse();
    return;
  }
  // Turning back now must still arrive with the settle time in hand.
  if (away && Math.abs(e) + 2 * speed * CONFIG.fixedStep > speed * (target.time - settle)) state.reverse();
};

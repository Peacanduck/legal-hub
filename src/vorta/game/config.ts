import { easeOutCubic, invLerp, lerp } from './math';

// lib/core/game_config.dart in the Vorta repo, number for number. The demo on
// the landing page is only worth showing because it *is* the game, so nothing
// here is retuned for the web: when a value changes in the game, copy it here,
// or the page is advertising a game that no longer exists.
//
// Distances are field units: the play field has radius 1 and the core sits at
// the origin. Nothing in the simulation knows about pixels.
export const CONFIG = {
  playerOrbitRadius: 0.46,
  playerRadius: 0.038,
  coreRadius: 0.11,
  ringSpawnRadius: 1.45,
  ringDespawnRadius: 0.055,
  ringThickness: 0.052,

  rampDuration: 150,
  playerSpeedStart: 2.15,
  playerSpeedEnd: 3.3,
  ringSpeedStart: 0.3,
  ringSpeedEnd: 0.78,
  ringIntervalStart: 1.7,
  ringIntervalEnd: 0.62,
  gapHalfWidthStart: 0.55,
  gapHalfWidthEnd: 0.27,
  ringSpinStart: 0,
  ringSpinEnd: 1.15,

  fairnessReachMargin: 0.78,
  gapSpacingFactor: 2.6,
  gapClusterBudgetShare: 0.5,

  moteRadius: 0.026,
  moteCollectDistance: 0.075,
  moteSpeedFactor: 0.72,
  moteSpawnChance: 0.55,
  comboDecaySeconds: 3.5,
  comboMultiplierStep: 0.1,
  comboMultiplierMax: 5,
  scorePerGap: 1,
  scorePerMote: 2,
  nearMissThreshold: 0.3,
  nearMissBonus: 3,

  shakeOnPass: 0.12,
  shakeOnMote: 0.08,
  shakeOnNearMiss: 0.35,
  shakeOnDeath: 1,
  nearMissSlowMoDuration: 0.22,
  nearMissSlowMoScale: 0.35,
  deathFreezeDuration: 0.1,
  deathAnimDuration: 0.9,

  fixedStep: 1 / 120,
  maxFrameTime: 0.25,
} as const;

export const progress = (elapsed: number) => invLerp(0, CONFIG.rampDuration, elapsed);

export const playerSpeedAt = (t: number) => lerp(CONFIG.playerSpeedStart, CONFIG.playerSpeedEnd, progress(t));

export const ringSpeedAt = (t: number) =>
  lerp(CONFIG.ringSpeedStart, CONFIG.ringSpeedEnd, easeOutCubic(progress(t)));

export const ringIntervalAt = (t: number) =>
  lerp(CONFIG.ringIntervalStart, CONFIG.ringIntervalEnd, easeOutCubic(progress(t)));

export const gapHalfWidthAt = (t: number) => lerp(CONFIG.gapHalfWidthStart, CONFIG.gapHalfWidthEnd, progress(t));

export const ringSpinAt = (t: number) => lerp(CONFIG.ringSpinStart, CONFIG.ringSpinEnd, progress(t));

/** Expected number of gaps per ring. Fewer gaps late means less margin. */
export const gapCountAt = (t: number) => {
  const p = progress(t);
  if (p < 0.18) return 3;
  if (p < 0.55) return 2;
  return 1;
};

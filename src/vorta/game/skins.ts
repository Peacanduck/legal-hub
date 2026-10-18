// The skin catalogue from lib/render/palette.dart, as 0xAARRGGBB like the
// game writes them, so a colour can be checked against the source by eye.
// Order is the shop's display order.

export type PlayerShape = 'orb' | 'dart' | 'diamond' | 'blade' | 'ring';

export interface Skin {
  id: string;
  name: string;
  description: string;
  /** How it is unlocked, for the picker. Prices stay in the store. */
  tier: 'Free' | 'Coins' | 'Premium';
  backgroundInner: number;
  backgroundOuter: number;
  player: number;
  playerGlow: number;
  ring: number;
  ringGlow: number;
  accent: number;
  danger: number;
  core: number;
  grid: number;
  shape: PlayerShape;
  /** UI text colour. Solar is a light skin, so white would vanish. */
  ink: number;
  trailIntensity: number;
}

const skin = (s: Omit<Skin, 'ink' | 'trailIntensity'> & Partial<Pick<Skin, 'ink' | 'trailIntensity'>>): Skin => ({
  ink: 0xffffffff,
  trailIntensity: 1,
  ...s,
});

export const SKINS: Skin[] = [
  skin({
    id: 'nocturne',
    name: 'Nocturne',
    description: 'Where it all begins.',
    tier: 'Free',
    backgroundInner: 0xff16143a,
    backgroundOuter: 0xff05040f,
    player: 0xff4de8ff,
    playerGlow: 0xff00b3ff,
    ring: 0xff8b6bff,
    ringGlow: 0xff5b3fe0,
    accent: 0xffffc53d,
    danger: 0xffff3d6e,
    core: 0xff6c5ce7,
    grid: 0x1a8b6bff,
    shape: 'orb',
  }),
  skin({
    id: 'ember',
    name: 'Ember',
    description: 'Burn a little brighter.',
    tier: 'Coins',
    backgroundInner: 0xff2a0f0a,
    backgroundOuter: 0xff0a0503,
    player: 0xffffb347,
    playerGlow: 0xffff6b1a,
    ring: 0xffe0452c,
    ringGlow: 0xff9b1b0c,
    accent: 0xffffe66d,
    danger: 0xffff1744,
    core: 0xffcc3311,
    grid: 0x1aff6b1a,
    shape: 'dart',
    trailIntensity: 1.3,
  }),
  skin({
    id: 'chlorophyll',
    name: 'Chlorophyll',
    description: 'Grown in the dark.',
    tier: 'Coins',
    backgroundInner: 0xff05231c,
    backgroundOuter: 0xff01100c,
    player: 0xff7cffb2,
    playerGlow: 0xff00e676,
    ring: 0xff1de9b6,
    ringGlow: 0xff00897b,
    accent: 0xffeeff41,
    danger: 0xffff5252,
    core: 0xff00bfa5,
    grid: 0x1a1de9b6,
    shape: 'diamond',
  }),
  skin({
    id: 'vaporwave',
    name: 'Vaporwave',
    description: 'Nostalgia for a decade that never happened.',
    tier: 'Coins',
    backgroundInner: 0xff2d1b4e,
    backgroundOuter: 0xff0d0619,
    player: 0xff00f5ff,
    playerGlow: 0xff00b8d4,
    ring: 0xffff6ec7,
    ringGlow: 0xffd500f9,
    accent: 0xfffff176,
    danger: 0xffff1744,
    core: 0xffab47bc,
    grid: 0x26ff6ec7,
    shape: 'blade',
    trailIntensity: 1.5,
  }),
  skin({
    id: 'monochrome',
    name: 'Monochrome',
    description: 'No colour. No excuses.',
    tier: 'Coins',
    backgroundInner: 0xff1a1a1a,
    backgroundOuter: 0xff000000,
    player: 0xffffffff,
    playerGlow: 0xffbdbdbd,
    ring: 0xff757575,
    ringGlow: 0xff424242,
    accent: 0xffffffff,
    danger: 0xffeeeeee,
    core: 0xff616161,
    grid: 0x14ffffff,
    shape: 'ring',
    trailIntensity: 0.7,
  }),
  skin({
    id: 'solar',
    name: 'Solar',
    description: 'Play in the daylight.',
    tier: 'Premium',
    backgroundInner: 0xfffff3e0,
    backgroundOuter: 0xffe8d5c4,
    player: 0xff1a237e,
    playerGlow: 0xff3f51b5,
    ring: 0xffe65100,
    ringGlow: 0xffff8f00,
    accent: 0xff00695c,
    danger: 0xffc62828,
    core: 0xffffb300,
    grid: 0x1a5d4037,
    shape: 'orb',
    ink: 0xff1a1524,
  }),
  skin({
    id: 'eclipse',
    name: 'Eclipse',
    description: 'The corona is the only light left.',
    tier: 'Premium',
    backgroundInner: 0xff1c1033,
    backgroundOuter: 0xff000000,
    player: 0xffffd54f,
    playerGlow: 0xffffa000,
    ring: 0xff311b92,
    ringGlow: 0xff7c4dff,
    accent: 0xffffffff,
    danger: 0xffff6d00,
    core: 0xff000000,
    grid: 0x1affd54f,
    shape: 'ring',
    trailIntensity: 1.2,
  }),
];

export const NOCTURNE = SKINS[0];

/** `#rrggbb` (alpha dropped), for CSS and SVG. */
export const hex = (argb: number) => `#${(argb & 0xffffff).toString(16).padStart(6, '0')}`;

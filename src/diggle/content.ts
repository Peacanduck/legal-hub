// Game facts shown on the Diggle page. Every number here is lifted from
// the game source so the page can't drift from what players get:
//   rarity shares  — collection curve, locked 2026-07-10
//   gear bonuses   — lib/game/systems/gear_system.dart GearBonusTable
//   strata         — lib/game/world/biome.dart
//   sprite rows    — lib/game/systems/gear_sprites.dart (generated)

export type RarityKey = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Rarity {
  key: RarityKey;
  label: string;
  share: number; // % of the collection, per slot
}

export const RARITIES: readonly Rarity[] = [
  { key: 'common', label: 'Common', share: 50 },
  { key: 'uncommon', label: 'Uncommon', share: 25 },
  { key: 'rare', label: 'Rare', share: 15 },
  { key: 'epic', label: 'Epic', share: 8 },
  { key: 'legendary', label: 'Legendary', share: 2 },
];

export type SlotKey = 'hull' | 'thruster' | 'fuelTank' | 'drill' | 'cargoHold';

export interface Slot {
  key: SlotKey;
  label: string;
  /** Side-view row in the gear sprite sheet; down view is row + 5. */
  row: number;
  stat: string;
  /** Bonus per rarity, common → legendary. */
  bonus: readonly string[];
  legendaryPerk: string;
  /** Part name per rarity. Common has two parts with identical stats. */
  parts: readonly string[];
}

export const SLOTS: readonly Slot[] = [
  {
    key: 'hull',
    label: 'Hull',
    row: 0,
    stat: 'Max hull',
    bonus: ['+5 HP', '+10 HP', '+18 HP', '+28 HP', '+40 HP'],
    legendaryPerk: 'Halves gas damage',
    parts: ['Standard Prospector or Rusty Hauler', 'Armored Vanguard', 'Cyber Scarab', 'Golden Behemoth', 'Ghost Stealth'],
  },
  {
    key: 'thruster',
    label: 'Thruster',
    row: 1,
    stat: 'Move & fly speed',
    bonus: ['+3%', '+6%', '+10%', '+15%', '+22%'],
    legendaryPerk: '+1 safe fall tile',
    parts: ['Ion Drive or Turbo Fan', 'Chemical Burner', 'Plasma Jet', 'Gravity Well', 'Quantum Glitch'],
  },
  {
    key: 'fuelTank',
    label: 'Fuel tank',
    row: 2,
    stat: 'Fuel capacity',
    bonus: ['+5%', '+8%', '+12%', '+18%', '+25%'],
    legendaryPerk: 'Refuels 10% cheaper',
    parts: ['Diesel Canister or Oil Drum', 'Hydrogen Cell', 'Nuclear Battery', 'Dark Matter Vial', 'Miniature Star'],
  },
  {
    key: 'drill',
    label: 'Drill',
    row: 3,
    stat: 'Dig speed',
    bonus: ['+3%', '+6%', '+10%', '+16%', '+25%'],
    legendaryPerk: 'Cuts the hardest rock without a bit upgrade',
    parts: ['Steel Augur or Iron Pike', 'Tungsten Breaker', 'Laser Bore', 'Sonic Pulverizer', 'Diamond Omni-Drill'],
  },
  {
    key: 'cargoHold',
    label: 'Cargo hold',
    row: 4,
    stat: 'Cargo slots',
    bonus: ['+2', '+4', '+7', '+10', '+15'],
    legendaryPerk: 'Sells ore 5% higher',
    parts: ['Standard Bin or Scrap Basket', 'Reinforced Crate', 'Ore Net', 'Cryo Pod', 'Dimensional Vault'],
  },
];

export type Loadout = Record<SlotKey, RarityKey>;

export const uniformLoadout = (rarity: RarityKey): Loadout => ({
  hull: rarity,
  thruster: rarity,
  fuelTank: rarity,
  drill: rarity,
  cargoHold: rarity,
});

/** Painter's order — the same one the game and the reveal compositor use. */
export const DRAW_ORDER: readonly SlotKey[] = ['hull', 'fuelTank', 'thruster', 'drill', 'cargoHold'];

export const slotByKey = (key: SlotKey): Slot => SLOTS.find((s) => s.key === key)!;

/** Index into /diggle/tile-strip.png — cut from the game's TerrainSpriteSheet. */
export const TILE = {
  coal: 0, copper: 1, silver: 2, gold: 3, sapphire: 4, emerald: 5,
  ruby: 6, diamond: 7, dirt: 8, rock: 9, lava: 10, gas: 11,
} as const;

export type TileName = keyof typeof TILE;

export const ORES: readonly TileName[] = [
  'coal', 'copper', 'silver', 'gold', 'sapphire', 'emerald', 'ruby', 'diamond',
];

export interface Stratum {
  id: string;
  name: string;
  from: number;
  to: number | null;
  accent: string; // CSS custom property name
  texture: string;
  body: string;
  facts: readonly string[];
  ores: readonly TileName[];
}

export const STRATA: readonly Stratum[] = [
  {
    id: 'topsoil',
    name: 'Topsoil',
    from: 0,
    to: 120,
    accent: '--dg-topsoil',
    texture: '/diggle/tile-dirt.png',
    body: 'Loose dirt and starter seams, with open shafts running most of the way down. Fast going — this is where you learn what the fuel gauge really means.',
    facts: ['Coal and copper close to the surface', 'Three natural shafts for a quick descent', 'Nothing down here wants you dead yet'],
    ores: ['coal', 'copper'],
  },
  {
    id: 'permafrost',
    name: 'Permafrost',
    from: 120,
    to: 240,
    accent: '--dg-perma',
    texture: '/diggle/tile-rock.png',
    body: 'The ground freezes solid and the caves open up. Silver and gold run richer here — and so do the gas pockets waiting in the dark for a drill bit.',
    facts: ['Frozen dirt: slower to cut', 'Silver ×1.5 and gold ×1.4', 'Gas pockets, and the first buried ruin'],
    ores: ['silver', 'gold'],
  },
  {
    id: 'crystal',
    name: 'Crystal Caverns',
    from: 240,
    to: 360,
    accent: '--dg-crystal',
    texture: '/diggle/tile-diamond.png',
    body: 'Violet cave systems, unstable rock and the densest ruins in the world. It is the best artifact hunting in the game, and the easiest place to fall a very long way.',
    facts: ['Cave-dense — huge voids, long drops', 'Sapphire and emerald ×1.5', 'Three ruins per stratum'],
    ores: ['sapphire', 'emerald'],
  },
  {
    id: 'magma',
    name: 'Magma Core',
    from: 360,
    to: null,
    accent: '--dg-magma',
    texture: '/diggle/tile-lava.png',
    body: 'No shafts and no easy way back. Magma rock, lava everywhere, unstable ground underneath. Ruby and diamond live down here, which is the only reason anyone comes.',
    facts: ['Lava ×1.8, unstable rock ×1.5', 'Ruby ×1.3 and diamond ×1.2', 'Zero shafts — dig your own way out'],
    ores: ['ruby', 'diamond'],
  },
];

export interface LegendaryPart {
  slot: SlotKey;
  name: string;
  motion: string;
}

// Animation notes from the Phase B1b commit that hand-authored these five.
export const LEGENDARY_FIVE: readonly LegendaryPart[] = [
  {
    slot: 'hull',
    name: 'Ghost Stealth',
    motion: 'A different set of pixels de-rezzes every frame, so the hull phases in and out while a shimmer sweeps under the cockpit.',
  },
  {
    slot: 'thruster',
    name: 'Quantum Glitch',
    motion: 'Four cube layouts cycle through the spectrum, and a phantom cube blinks out of existence on alternate frames.',
  },
  {
    slot: 'fuelTank',
    name: 'Miniature Star',
    motion: 'One pulse beat, with a single orbital pixel walking the four cardinals around the core.',
  },
  {
    slot: 'drill',
    name: 'Diamond Omni-Drill',
    motion: 'A sparkle rides the cone collar-to-tip while a counter-sparkle runs the underside the other way.',
  },
  {
    slot: 'cargoHold',
    name: 'Dimensional Vault',
    motion: 'The portal mouth breathes open and shut while two fragments orbit it half a cycle apart.',
  },
];

export const UPGRADES: readonly { name: string; body: string }[] = [
  { name: 'Drill bit', body: 'Cuts faster and opens rock tiers you simply cannot get through otherwise.' },
  { name: 'Engine', body: 'Movement and thrust — the difference between escaping a collapse and not.' },
  { name: 'Cooling', body: 'Fuel efficiency. Turns a 200 m round trip into a 300 m one.' },
  { name: 'Hull armour', body: 'More HP, for the fall you were always going to take eventually.' },
  { name: 'Fuel tank', body: 'Raw capacity. The most boring upgrade, and often the correct one.' },
  { name: 'Cargo bay', body: 'Haul more per trip, so the deep runs are worth making.' },
];

export const FAQ: readonly { q: string; a: string }[] = [
  {
    q: 'Do I need a machine to play?',
    a: 'No. Diggle is free on the Solana dApp Store and every player starts with the starter rig. A Diggle Machine is gear for a game you can already play.',
  },
  {
    q: 'What does a machine do before the reveal?',
    a: 'Every machine mints as a sealed crate. With the holding wallet connected in-game, it gives +25% XP and points from your next run. At reveal it becomes five parts that equip in the Hangar and render on your drill.',
  },
  {
    q: 'When is the reveal?',
    a: 'When all 10,000 machines are minted. The mapping from mint order to parts was generated in advance, and its hash is published in the candy machine’s on-chain settings so the reveal can be checked against it.',
  },
  {
    q: 'Does gear make the weekly challenge pay-to-win?',
    a: 'No. The weekly challenge runs on a standardized loadout: no gear, no prestige perks. Everyone digs with the same rig.',
  },
  {
    q: 'How many can I mint?',
    a: 'The candy machine enforces a per-wallet limit. The mint console reads it from chain and shows how many your wallet has left.',
  },
  {
    q: 'Which wallets work?',
    a: 'Phantom, Solflare and Backpack in a desktop browser. On a Seeker or Saga, open this page in Chrome and connect with any Mobile Wallet Adapter wallet, including Seed Vault.',
  },
];

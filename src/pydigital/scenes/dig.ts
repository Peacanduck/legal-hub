import { DRAW_ORDER, RARITIES, STRATA, TILE, slotByKey, type Loadout, type Stratum } from '../../diggle/content';

// A Diggle Machine drilling straight down through the four strata, drawn
// from the game's own sheets the way the Diggle page draws them: 32px tiles
// cut from /diggle/tile-strip.png, and the machine as five gear layers from
// /diggle/gear-sheet.png in painter's order. The world is made up as it
// scrolls; nothing here is the game's map. Plain TypeScript, like Vorta's.

const SPRITE = 32;
/** Depth per tile row. The real strata are 120 m deep; this keeps a dive short. */
const METRES_PER_ROW = 6;
const ROWS_PER_SECOND = 2.6;
/** Where the dive ends and fades back to the surface. */
const BOTTOM_METRES = 450;
/** The drill's height on screen, as a fraction from the top. */
const ANCHOR = 0.36;
/** Seconds parked on the surface before each dive. */
const PARKED = 0.9;
/** The digging band from drill_anim.dart: 14 fps over four frames. */
const DIG_FPS = 14;

const LOADOUT: Loadout = {
  hull: 'epic',
  thruster: 'rare',
  fuelTank: 'legendary',
  drill: 'legendary',
  cargoHold: 'rare',
};

const EMPTY = -1;

// Rough colours per tile for the chips that fly off the bit.
const CHIP: Record<number, string> = {
  [TILE.dirt]: '#8a5a32',
  [TILE.rock]: '#5d5f72',
  [TILE.lava]: '#ff6a1a',
  [TILE.coal]: '#3a3a44',
  [TILE.copper]: '#d98a4a',
  [TILE.silver]: '#d8dde6',
  [TILE.gold]: '#ffd34d',
  [TILE.sapphire]: '#4f8bff',
  [TILE.emerald]: '#3ddc84',
  [TILE.ruby]: '#ff4d6d',
  [TILE.diamond]: '#9ef0ff',
};

/** Each stratum's light, over its rock. The colours are the Diggle page's. */
const TINT: Record<string, string> = {
  topsoil: 'rgba(201,139,75,0.10)',
  permafrost: 'rgba(127,184,232,0.16)',
  crystal: 'rgba(157,78,221,0.22)',
  magma: 'rgba(255,69,0,0.16)',
};

const stratumAt = (metres: number): Stratum =>
  STRATA.find((s) => metres >= s.from && (s.to === null || metres < s.to)) ?? STRATA[STRATA.length - 1];

// mulberry32: small and seedable. Each dive gets a fresh seed, and a row is
// kept once it is made, so the world holds still while it scrolls past.
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

interface Chip {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  colour: string;
}

export interface DigListener {
  /** The depth readout, whenever the whole metre changes. */
  depth?: (metres: number, stratum: string) => void;
}

export const createDig = (canvas: HTMLCanvasElement, listener: DigListener) => {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return null;

  const tiles = new Image();
  const gear = new Image();
  tiles.src = '/diggle/tile-strip.png';
  gear.src = '/diggle/gear-sheet.png';
  let ready = false;
  const loaded = Promise.all([tiles.decode(), gear.decode()]).then(
    () => {
      ready = true;
    },
    () => undefined,
  );

  // The world, one row of tile indices at a time, made on first sight.
  let rows = new Map<number, Int8Array>();
  let random = rng(1);
  let columns = 9;
  let shaft = 4;

  // The machine's centre, in rows below the surface. Its bit is half a row
  // lower, and every row above the bit has been cut out of the shaft.
  let depthRows = 0;
  let parked = 0;
  let frameClock = 0;
  let fade = 0;
  let fadeDir = 0;
  let shownMetre = -1;
  const chips: Chip[] = [];

  let w = 0;
  let h = 0;
  let tile = 64;

  const row = (r: number) => {
    let cells = rows.get(r);
    if (cells) return cells;
    cells = new Int8Array(columns);
    const s = stratumAt(r * METRES_PER_ROW);
    const caves = s.id === 'crystal' ? 0.16 : s.id === 'magma' ? 0.04 : 0.06;
    for (let c = 0; c < columns; c++) {
      const roll = random();
      if (r > 1 && roll < caves && c !== shaft) cells[c] = EMPTY;
      else if (s.id === 'magma' && roll < caves + 0.14) cells[c] = TILE.lava;
      else if (r > 0 && roll > 0.88) cells[c] = TILE[s.ores[Math.floor(random() * s.ores.length)]];
      else cells[c] = s.id === 'topsoil' ? TILE.dirt : TILE.rock;
    }
    rows.set(r, cells);
    return cells;
  };

  const reset = () => {
    rows = new Map();
    random = rng((Math.random() * 2 ** 31) | 0);
    depthRows = -0.5; // sitting on the surface
    parked = PARKED;
    chips.length = 0;
    shownMetre = -1;
  };

  const bit = (d: number) => Math.floor(d + 0.5);

  const drawTile = (index: number, x: number, y: number) => {
    ctx.drawImage(tiles, index * SPRITE, 0, SPRITE, SPRITE, x, y, tile, tile);
  };

  const draw = () => {
    if (w === 0) return;
    ctx.imageSmoothingEnabled = false;

    const anchorY = Math.round(h * ANCHOR);
    const camera = depthRows * tile - anchorY; // world px at the top edge
    const left = Math.round((w - columns * tile) / 2);

    // The shaft's colour, and the sky above the surface while it is in view.
    ctx.fillStyle = '#0b0b14';
    ctx.fillRect(0, 0, w, h);
    if (camera < 0) {
      const sky = ctx.createLinearGradient(0, 0, 0, -camera);
      sky.addColorStop(0, '#120f24');
      sky.addColorStop(1, '#2a2140');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, -camera);
    }

    if (ready) {
      const first = Math.max(0, Math.floor(camera / tile));
      const last = Math.floor((camera + h) / tile);
      const dug = bit(depthRows);
      for (let r = first; r <= last; r++) {
        const y = Math.round(r * tile - camera);
        const cells = row(r);
        const s = stratumAt(r * METRES_PER_ROW);
        for (let c = 0; c < columns; c++) {
          const x = left + c * tile;
          const v = c === shaft && r < dug ? EMPTY : cells[c];
          if (v === EMPTY) continue;
          // Ore sits in its stratum's rock, as it does in the game.
          if (v < TILE.dirt) drawTile(s.id === 'topsoil' ? TILE.dirt : TILE.rock, x, y);
          drawTile(v, x, y);
        }
        ctx.fillStyle = TINT[s.id] ?? 'transparent';
        ctx.fillRect(0, y, w, tile);
      }

      // The machine: five layers, nose down, rattling as it cuts.
      const frame = Math.floor(frameClock * DIG_FPS) % 4;
      const shake = parked > 0 ? 0 : Math.round(Math.sin(frameClock * 90) * tile * 0.02);
      const mx = left + shaft * tile + shake;
      const my = Math.round(depthRows * tile - camera - tile * 0.5);
      for (const slot of DRAW_ORDER) {
        const rarity = RARITIES.findIndex((r) => r.key === LOADOUT[slot]);
        const sx = (rarity * 4 + frame) * SPRITE;
        const sy = (slotByKey(slot).row + 5) * SPRITE;
        ctx.drawImage(gear, sx, sy, SPRITE, SPRITE, mx, my, tile, tile);
      }

      for (const chip of chips) {
        const t = 1 - chip.age / chip.life;
        ctx.globalAlpha = t;
        ctx.fillStyle = chip.colour;
        const size = Math.max(2, Math.round(tile / 10));
        ctx.fillRect(Math.round(chip.x), Math.round(chip.y - camera), size, size);
      }
      ctx.globalAlpha = 1;
    }

    // A headlamp: the dark closes in everywhere the machine is not.
    const lx = left + shaft * tile + tile / 2;
    const ly = anchorY + tile * 0.4;
    const lamp = ctx.createRadialGradient(lx, ly, tile * 0.5, lx, ly, Math.max(w, h) * 0.7);
    lamp.addColorStop(0, 'rgba(8,8,16,0)');
    lamp.addColorStop(0.3, 'rgba(8,8,16,0.3)');
    lamp.addColorStop(0.7, 'rgba(8,8,16,0.78)');
    lamp.addColorStop(1, 'rgba(8,8,16,0.94)');
    ctx.fillStyle = lamp;
    ctx.fillRect(0, 0, w, h);

    if (fade > 0) {
      ctx.fillStyle = `rgba(11,11,20,${fade.toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
    }
  };

  const report = () => {
    const metres = Math.max(0, Math.floor(depthRows * METRES_PER_ROW));
    if (metres === shownMetre) return;
    shownMetre = metres;
    listener.depth?.(metres, depthRows < 0 ? 'Surface' : stratumAt(metres).name);
  };

  const tick = (dt: number) => {
    if (!ready) return;
    frameClock += dt;
    const before = bit(depthRows);
    if (parked > 0) parked -= dt;
    else depthRows += ROWS_PER_SECOND * dt;
    const now = bit(depthRows);

    // Breaking into a new tile throws chips of whatever it was made of.
    for (let r = Math.max(0, before); r < now; r++) {
      const v = row(r)[shaft];
      const colour = CHIP[v] ?? CHIP[TILE.dirt];
      const ore = v >= 0 && v < TILE.dirt;
      for (let i = 0; i < (ore ? 14 : 5); i++) {
        chips.push({
          x: (w - columns * tile) / 2 + shaft * tile + tile * (0.2 + Math.random() * 0.6),
          y: r * tile + tile * 0.4,
          vx: (Math.random() - 0.5) * tile * (ore ? 7 : 4),
          vy: -(0.5 + Math.random()) * tile * (ore ? 5 : 3),
          age: 0,
          life: 0.4 + Math.random() * (ore ? 0.7 : 0.35),
          colour,
        });
      }
    }
    for (let i = chips.length - 1; i >= 0; i--) {
      const c = chips[i];
      c.age += dt;
      c.vy += tile * 14 * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      if (c.age >= c.life) chips.splice(i, 1);
    }
    // Keep only the rows still near the screen.
    if (rows.size > 64) {
      for (const key of rows.keys()) if (key < now - 16) rows.delete(key);
    }

    if (fadeDir === 0 && depthRows * METRES_PER_ROW > BOTTOM_METRES) fadeDir = 1;
    if (fadeDir === 1) {
      fade = Math.min(1, fade + dt / 0.6);
      if (fade >= 1) {
        reset();
        fadeDir = -1;
      }
    } else if (fadeDir === -1) {
      fade = Math.max(0, fade - dt / 0.8);
      if (fade === 0) fadeDir = 0;
    }

    report();
    draw();
  };

  reset();

  return {
    loaded,
    resize(cssW: number, cssH: number, dpr: number) {
      w = Math.max(1, Math.round(cssW * dpr));
      h = Math.max(1, Math.round(cssH * dpr));
      canvas.width = w;
      canvas.height = h;
      // Whole-number scales only, or the pixel art smears. Five or six
      // columns across, never fewer than two pixels per art pixel.
      tile = SPRITE * Math.max(2, Math.round(w / (SPRITE * 5.5)));
      // An odd count, so the shaft runs down the middle column.
      const fit = Math.ceil(w / tile) + 2;
      const next = fit % 2 === 0 ? fit + 1 : fit;
      if (next !== columns) {
        columns = next;
        shaft = (columns - 1) / 2;
        rows = new Map();
      }
      draw();
    },
    tick,
    /** A still: partway through the Crystal Caverns, for reduced motion. */
    still() {
      depthRows = 280 / METRES_PER_ROW;
      report();
      draw();
    },
  };
};

import type { CSSProperties } from 'react';
import {
  DRAW_ORDER,
  RARITIES,
  TILE,
  slotByKey,
  type Loadout,
  type RarityKey,
  type SlotKey,
  type TileName,
} from '../content';

// These render straight from the game's own sprite sheets, the same way
// drill_component.dart does: five 32px slot layers stacked in painter's
// order, frames stepped by CSS. Nothing here is re-drawn for the web.

/** Playback band, mirroring lib/game/systems/drill_anim.dart: the action
 *  picks the rate and how many frames it may use. Idle and falling clamp
 *  to frames 0-1, where the thruster plume is shortest. */
export interface AnimBand {
  fps: number;
  frames: 2 | 4;
}

const bandVars = (band?: AnimBand) =>
  band ? { '--dur': `${(band.frames / band.fps).toFixed(3)}s`, '--frames': band.frames } : {};

/** CSS custom properties aren't in React's style type. */
const vars = (v: Record<string, string | number | undefined>) => v as CSSProperties;

const rarityIndex = (rarity: RarityKey) => RARITIES.findIndex((r) => r.key === rarity);

export const Machine = ({
  loadout,
  scale,
  label,
  down = false,
  focus,
  band,
}: {
  loadout: Loadout;
  /** Pixel scale. Omit to let CSS pick it per breakpoint. */
  scale?: number;
  label: string;
  down?: boolean;
  /** Light one slot and ghost the rest. */
  focus?: SlotKey;
  band?: AnimBand;
}) => (
  <div
    className="dg-machine"
    style={vars({ ...(scale ? { '--s': scale } : {}), ...bandVars(band) })}
    role="img"
    aria-label={label}
  >
    {DRAW_ORDER.map((slot) => (
      <span
        key={slot}
        aria-hidden="true"
        className={`dg-sprite dg-sprite--gear${focus && focus !== slot ? ' is-ghost' : ''}`}
        style={vars({
          '--col': rarityIndex(loadout[slot]) * 4,
          '--row': slotByKey(slot).row + (down ? 5 : 0),
        })}
      />
    ))}
  </div>
);

/** The free machine every player starts with — deliberately scruffier than Common. */
export const StarterRig = ({
  scale,
  label,
  down = false,
  band,
}: {
  scale?: number;
  label: string;
  down?: boolean;
  band?: AnimBand;
}) => (
  <div
    className="dg-machine"
    style={vars({ ...(scale ? { '--s': scale } : {}), ...bandVars(band) })}
    role="img"
    aria-label={label}
  >
    <span
      aria-hidden="true"
      className="dg-sprite dg-sprite--base"
      style={vars({ '--col': 0, '--row': down ? 1 : 0 })}
    />
  </div>
);

/** One 32px tile cut from the game's terrain sheet. */
export const Tile = ({ name, size = 32 }: { name: TileName; size?: number }) => (
  <span
    className="dg-tile"
    role="img"
    aria-label={name}
    style={vars({ '--t': TILE[name], '--ts': `${size}px` })}
  />
);

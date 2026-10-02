import { useState } from 'react';
import {
  LEGENDARY_FIVE,
  RARITIES,
  SLOTS,
  slotByKey,
  uniformLoadout,
  type Loadout,
  type RarityKey,
  type SlotKey,
} from '../content';
import { Machine, StarterRig } from './Sprites';

const rarityIndex = (r: RarityKey) => RARITIES.findIndex((x) => x.key === r);

// Rolls a machine with the collection's real per-slot odds, 50/25/15/8/2.
const rollRarity = (): RarityKey => {
  let n = Math.random() * 100;
  for (const r of RARITIES) {
    if ((n -= r.share) < 0) return r.key;
  }
  return 'common';
};

const rollLoadout = (): Loadout => ({
  hull: rollRarity(),
  thruster: rollRarity(),
  fuelTank: rollRarity(),
  drill: rollRarity(),
  cargoHold: rollRarity(),
});

export const Hangar = () => {
  const [loadout, setLoadout] = useState<Loadout>({
    hull: 'rare',
    thruster: 'epic',
    fuelTank: 'uncommon',
    drill: 'legendary',
    cargoHold: 'common',
  });
  const [starter, setStarter] = useState(false);
  const [down, setDown] = useState(false);

  const setSlot = (slot: SlotKey, rarity: RarityKey) => {
    setStarter(false);
    setLoadout((l) => ({ ...l, [slot]: rarity }));
  };

  return (
    <div className="dg-hangar">
      <div className="dg-hangar-stage">
        <div className="dg-hangar-toggles">
          <div className="dg-seg" role="group" aria-label="Machine">
            <button type="button" aria-pressed={starter} onClick={() => setStarter(true)}>
              Starter rig
            </button>
            <button type="button" aria-pressed={!starter} onClick={() => setStarter(false)}>
              Diggle Machine
            </button>
          </div>
          <div className="dg-seg" role="group" aria-label="View">
            <button type="button" aria-pressed={!down} onClick={() => setDown(false)}>
              Side
            </button>
            <button type="button" aria-pressed={down} onClick={() => setDown(true)}>
              Drilling down
            </button>
          </div>
        </div>

        <div className={`dg-hangar-bay${down ? ' is-down' : ''}`}>
          {starter ? (
            <StarterRig down={down} label="The free starter rig" />
          ) : (
            <Machine
              loadout={loadout}
              down={down}
              label={`Diggle Machine: ${SLOTS.map((s) => `${RARITIES[rarityIndex(loadout[s.key])].label} ${s.label}`).join(', ')}`}
            />
          )}
        </div>

        <div className="dg-hangar-actions">
          <button type="button" className="dg-btn dg-btn--primary" onClick={() => { setStarter(false); setLoadout(rollLoadout()); }}>
            Roll a machine
          </button>
          <button type="button" className="dg-btn dg-btn--ghost" onClick={() => { setStarter(false); setLoadout(uniformLoadout('legendary')); }}>
            All Legendary
          </button>
        </div>
        <p className="dg-fine">
          Rendered live from the game&rsquo;s own sprite sheet. Rolls use the real odds; your machine&rsquo;s actual
          parts stay sealed until reveal.
        </p>
      </div>

      <div className="dg-slots">
        {SLOTS.map((slot) => {
          const ri = rarityIndex(loadout[slot.key]);
          const rarity = RARITIES[ri];
          return (
            <fieldset key={slot.key} className={`dg-slot${starter ? ' is-muted' : ''}`}>
              <legend className="dg-slot-label">
                <span>{slot.label}</span>
                <span className="dg-slot-part" data-rarity={starter ? undefined : rarity.key}>
                  {starter ? 'Starter part' : slot.parts[ri]}
                </span>
              </legend>
              <div className="dg-chips">
                {RARITIES.map((r) => (
                  <label key={r.key} className="dg-chip" data-rarity={r.key}>
                    <input
                      type="radio"
                      name={`slot-${slot.key}`}
                      checked={!starter && loadout[slot.key] === r.key}
                      onChange={() => setSlot(slot.key, r.key)}
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
              <p className="dg-slot-bonus">
                <span className="dg-slot-stat">{slot.stat}</span>
                <strong>{starter ? '—' : slot.bonus[ri]}</strong>
                {!starter && rarity.key === 'legendary' && <em>{slot.legendaryPerk}</em>}
              </p>
            </fieldset>
          );
        })}
        {starter && (
          <p className="dg-fine">
            The starter rig carries no gear bonuses, and it&rsquo;s drawn deliberately scruffier than Common &mdash;
            any Diggle Machine is a visible upgrade.
          </p>
        )}
      </div>
    </div>
  );
};

export const LegendaryFive = () => (
  <ul className="dg-legend-grid">
    {LEGENDARY_FIVE.map((part) => {
      const slot = slotByKey(part.slot);
      return (
        <li key={part.name} className="dg-legend-card dg-reveal">
          <div className="dg-legend-art">
            <Machine
              loadout={uniformLoadout('legendary')}
              focus={part.slot}
              label={`${part.name}, the legendary ${slot.label.toLowerCase()}`}
            />
          </div>
          <p className="dg-pixel dg-legend-slot">{slot.label}</p>
          <h3 className="dg-legend-name">{part.name}</h3>
          <p className="dg-legend-motion">{part.motion}</p>
          <p className="dg-legend-stat">
            <strong>
              {slot.stat} {slot.bonus[4]}
            </strong>
            <span>{slot.legendaryPerk}</span>
          </p>
        </li>
      );
    })}
  </ul>
);

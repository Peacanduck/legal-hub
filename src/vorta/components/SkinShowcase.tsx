import { useState, type CSSProperties, type ReactNode } from 'react';
import { NOCTURNE, SKINS, hex } from '../game/skins';
import { SkinEmblem } from './Art';
import { Playfield } from './Playfield';

/** Every skin, applied live to a field the autopilot is flying. `head` sits
 *  beside the porthole on wide screens and above it on narrow ones. */
export const SkinShowcase = ({ head }: { head: ReactNode }) => {
  const [skin, setSkin] = useState(NOCTURNE);

  return (
    <div
      className="vt-skins"
      style={{ '--vt-skin-glow': hex(skin.playerGlow), '--vt-skin-ring': hex(skin.ringGlow) } as CSSProperties}
    >
      <div className="vt-skins-head vt-reveal">{head}</div>
      <div className="vt-porthole vt-reveal">
        <Playfield skin={skin} label={`The playfield in the ${skin.name} skin, flown by the autopilot`} fieldFraction={0.5} />
      </div>
      <div className="vt-skin-list vt-reveal" role="group" aria-label="Choose a skin">
        {SKINS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="vt-skin"
            aria-pressed={s.id === skin.id}
            onClick={() => setSkin(s)}
          >
            <SkinEmblem skin={s} />
            <span className="vt-skin-text">
              <strong>{s.name}</strong>
              <span>{s.description}</span>
            </span>
            <span className="vt-skin-tier" data-tier={s.tier}>
              {s.tier}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

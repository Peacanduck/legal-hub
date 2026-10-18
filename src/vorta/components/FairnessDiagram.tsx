// The spawner's guarantee as a diagram: the player's reach along the orbit by
// the time a ring arrives, and the ring's gap placed inside it.

const C = 220;
const ORBIT = 100;
const RING = 176;
const PLAYER = -116;
const REACH = 62;
const GAP = -78;
const GAP_HALF = 15;

const rad = (deg: number) => (deg * Math.PI) / 180;
const at = (r: number, deg: number) => [C + r * Math.cos(rad(deg)), C + r * Math.sin(rad(deg))] as const;
const pt = (r: number, deg: number) => at(r, deg).map((v) => v.toFixed(2)).join(' ');

/** An SVG arc path, clockwise from `from` to `to` degrees. */
const arc = (r: number, from: number, to: number) => {
  const sweep = (((to - from) % 360) + 360) % 360;
  return `M${pt(r, from)}A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${pt(r, to)}`;
};

export const FairnessDiagram = () => {
  const [px, py] = at(ORBIT, PLAYER);
  const [tx, ty] = at(ORBIT, GAP);
  const reachFrom = PLAYER - REACH;
  const reachTo = PLAYER + REACH;

  return (
    <figure className="vt-diagram">
      <svg viewBox="0 0 440 440" role="img" aria-labelledby="vt-diagram-caption">
        <g className="vt-diagram-grid">
          {[60, 140, 210].map((r) => (
            <circle key={r} cx={C} cy={C} r={r} />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={at(34, i * 30)[0]} y1={at(34, i * 30)[1]} x2={at(214, i * 30)[0]} y2={at(214, i * 30)[1]} />
          ))}
        </g>

        {/* The reach sector, projected out to the incoming ring. */}
        <path
          className="vt-diagram-sector"
          d={`M${C} ${C}L${pt(RING + 24, reachFrom)}A${RING + 24} ${RING + 24} 0 0 1 ${pt(RING + 24, reachTo)}Z`}
        />
        <line className="vt-diagram-edge" x1={C} y1={C} x2={at(RING + 24, reachFrom)[0]} y2={at(RING + 24, reachFrom)[1]} />
        <line className="vt-diagram-edge" x1={C} y1={C} x2={at(RING + 24, reachTo)[0]} y2={at(RING + 24, reachTo)[1]} />

        <circle className="vt-diagram-orbit" cx={C} cy={C} r={ORBIT} />
        <path className="vt-diagram-reach" d={arc(ORBIT, reachFrom, reachTo)} />

        {/* The incoming ring, its gap inside the sector, goalposts in gold. */}
        <path className="vt-diagram-ring" d={arc(RING, GAP + GAP_HALF, GAP - GAP_HALF + 360)} />
        {[GAP - GAP_HALF, GAP + GAP_HALF].map((deg) => (
          <line
            key={deg}
            className="vt-diagram-post"
            x1={at(RING - 12, deg)[0]}
            y1={at(RING - 12, deg)[1]}
            x2={at(RING + 12, deg)[0]}
            y2={at(RING + 12, deg)[1]}
          />
        ))}
        <path className="vt-diagram-path" d={`M${pt(RING - 18, GAP)}L${pt(ORBIT + 14, GAP)}`} markerEnd="url(#vt-diagram-arrow)" />
        <defs>
          <marker id="vt-diagram-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M1 1L9 5L1 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </marker>
        </defs>
        <circle className="vt-diagram-target" cx={tx} cy={ty} r="6" />

        <circle className="vt-diagram-core" cx={C} cy={C} r="24" />
        <circle className="vt-diagram-player-glow" cx={px} cy={py} r="18" />
        <circle className="vt-diagram-player" cx={px} cy={py} r="8" />
      </svg>
      <figcaption id="vt-diagram-caption" className="vt-legend">
        <span>
          <i className="vt-legend-key vt-legend-key--reach" aria-hidden="true" />
          How far you can travel before the ring arrives
        </span>
        <span>
          <i className="vt-legend-key vt-legend-key--gap" aria-hidden="true" />
          Where its gap is placed to meet you
        </span>
      </figcaption>
    </figure>
  );
};

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { prefersReducedMotion } from '../hooks';

// An illustration of a Solignition loan, in Solignition's own colours: not
// the protocol, which lives at solignition.xyz. Every step is one its site
// describes ("how it works" and "aligned incentives"), and the window is
// captioned as an illustration. Loans alternate between being repaid and
// lapsing, since the lapse is half of how the protocol stays solvent.

type StepId = 'idle' | 'upload' | 'loan' | 'deploy' | 'repay' | 'claim' | 'expire' | 'reclaim' | 'out';

interface Step {
  id: StepId;
  ms: number;
  /** The numbered title in the middle, and the line along the bottom. */
  title?: string;
  line?: string;
}

const OPENING: Step[] = [
  { id: 'idle', ms: 500 },
  { id: 'upload', ms: 1900, title: 'upload bytecode', line: 'drop your .so file. the protocol quotes rent + fees.' },
  { id: 'loan', ms: 2100, title: 'request loan', line: 'one transaction. the pool fronts the sol.' },
  { id: 'deploy', ms: 2000, title: 'deploy', line: 'the program ships. its authority is held by the protocol pda.' },
];

const SCENARIOS: Step[][] = [
  [
    ...OPENING,
    { id: 'repay', ms: 2100, title: 'repay', line: 'principal + interest, any time before expiry.' },
    { id: 'claim', ms: 3400, title: 'claim authority', line: 'authority moves to your wallet, atomically.' },
    { id: 'out', ms: 450 },
  ],
  [
    ...OPENING,
    { id: 'expire', ms: 2100, title: 'term ends', line: 'unpaid at expiry, plus a 24-hour grace period.' },
    { id: 'reclaim', ms: 3400, title: 'default', line: 'the protocol closes the program and repays lenders.' },
    { id: 'out', ms: 450 },
  ],
];

type NodeId = 'pool' | 'program' | 'builder' | 'pda';
type Point = { x: number; y: number };

/**
 * The diagram in viewBox units. Wide windows get room for every label; a
 * phone's window gets a tighter grid with the names only, and the status
 * line underneath does the explaining.
 */
const layout = (compact: boolean) => {
  const W = compact ? 360 : 560;
  const H = compact ? 320 : 360;
  const node = compact ? { w: 150, h: 62 } : { w: 176, h: 88 };
  const pad = compact ? 12 : 26;
  const at: Record<NodeId, Point> = {
    pool: { x: pad, y: pad },
    program: { x: W - pad - node.w, y: pad },
    builder: { x: pad, y: H - pad - node.h },
    pda: { x: W - pad - node.w, y: H - pad - node.h },
  };
  const mid = (k: NodeId) => ({ x: at[k].x + node.w / 2, y: at[k].y + node.h / 2 });
  const right = (k: NodeId) => ({ x: at[k].x + node.w, y: mid(k).y });
  const left = (k: NodeId) => ({ x: at[k].x, y: mid(k).y });
  const top = (k: NodeId) => ({ x: mid(k).x, y: at[k].y });
  const bottom = (k: NodeId) => ({ x: mid(k).x, y: at[k].y + node.h });
  const tag = (k: NodeId) => ({ x: at[k].x + (node.w - 104) / 2, y: at[k].y - 15 });
  return {
    compact,
    W,
    H,
    node,
    at,
    centre: { x: W / 2, y: H / 2 },
    // Where SOL travels: [from, to].
    edges: {
      loan: [right('pool'), left('program')],
      reclaim: [left('program'), right('pool')],
      repay: [top('builder'), bottom('pool')],
    } satisfies Record<string, [Point, Point]>,
    wires: {
      loan: [right('pool'), left('program')],
      authority: [bottom('program'), top('pda')],
      repay: [top('builder'), bottom('pool')],
      handover: [left('pda'), right('builder')],
    } satisfies Record<string, [Point, Point]>,
    badge: { pda: tag('pda'), builder: tag('builder') },
    labels: {
      pool: 'lp pool',
      program: compact ? 'program' : 'your program',
      builder: compact ? 'builder' : 'builder wallet',
      pda: 'protocol pda',
    } satisfies Record<NodeId, string>,
  };
};

type Layout = ReturnType<typeof layout>;

const at = (p: Point, name: string) => ({ [`--${name}x`]: `${p.x}px`, [`--${name}y`]: `${p.y}px` });

/** Three SOL packets along one edge, staggered. Keyed per step, so each run
 *  of the CSS animation starts from the beginning. */
const Packets = ({ from, to }: { from: Point; to: Point }) => (
  <g className="pd-sol-packets" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <rect
        key={i}
        className="pd-sol-packet"
        x={-4}
        y={-4}
        width={8}
        height={8}
        style={{ ...at(from, 'a'), ...at(to, 'b'), '--d': `${i * 0.22}s` } as CSSProperties}
      />
    ))}
  </g>
);

const Node = ({
  L,
  k,
  sub,
  on,
  done,
  dim,
  children,
}: {
  L: Layout;
  k: NodeId;
  sub: string;
  on?: boolean;
  done?: boolean;
  dim?: boolean;
  children?: ReactNode;
}) => (
  <g
    className="pd-sol-node"
    transform={`translate(${L.at[k].x} ${L.at[k].y})`}
    data-on={on ? '' : undefined}
    data-done={done ? '' : undefined}
    data-dim={dim ? '' : undefined}
  >
    <rect className="pd-sol-node-box" width={L.node.w} height={L.node.h} rx={L.compact ? 12 : 14} />
    <text className="pd-sol-node-label" x={L.compact ? 14 : 18} y={37}>
      {L.labels[k]}
    </text>
    {!L.compact && (
      <text className="pd-sol-node-sub" x={18} y={61}>
        {sub}
      </text>
    )}
    {children}
  </g>
);

/** Solignition's mark: a ring open at the top, a spark dropping into it. */
const Ring = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <g transform={`translate(${x} ${y}) scale(${size / 256})`} className="pd-sol-ring">
    <path d="M152 70.7 A64 64 0 1 1 104 70.7" fill="none" strokeWidth="18" strokeLinecap="round" />
    <path d="M128 38 L141 96 L128 122 L115 96 Z" />
  </g>
);

const wire = ([a, b]: [Point, Point]) => `M${a.x} ${a.y} L${b.x} ${b.y}`;

export const SolignitionScene = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [reduced] = useState(prefersReducedMotion);
  const [visible, setVisible] = useState(false);
  const [compact, setCompact] = useState(false);
  // Under reduced motion: a repaid loan, finished, holding still.
  const [pos, setPos] = useState(() => ({ scenario: 0, step: reduced ? SCENARIOS[0].length - 2 : 0 }));

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 480));
    ro.observe(box);
    if (reduced) return () => ro.disconnect();
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    io.observe(box);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced]);

  useEffect(() => {
    if (!visible || reduced) return;
    const id = window.setTimeout(() => {
      setPos(({ scenario, step }) =>
        step + 1 < SCENARIOS[scenario].length
          ? { scenario, step: step + 1 }
          : { scenario: (scenario + 1) % SCENARIOS.length, step: 0 },
      );
    }, SCENARIOS[pos.scenario][pos.step].ms);
    return () => window.clearTimeout(id);
  }, [pos, visible, reduced]);

  const L = layout(compact);
  const steps = SCENARIOS[pos.scenario];
  const step = steps[pos.step];
  const reached = (id: StepId) => {
    const i = steps.findIndex((s) => s.id === id);
    return i !== -1 && i <= pos.step;
  };
  const now = (id: StepId) => step.id === id;

  const numbered = steps.filter((s) => s.title);
  const shown = step.title ? step : [...numbered].reverse().find((s) => reached(s.id));

  const deployed = reached('deploy') && !reached('reclaim');
  const badge = reached('claim') ? 'builder' : deployed ? 'pda' : null;

  return (
    <div
      className="pd-scene pd-sol"
      ref={boxRef}
      data-step={step.id}
      role="img"
      aria-label="Illustration of a Solignition loan: the lending pool fronts the rent and fees to deploy a program, the protocol's PDA holds its upgrade authority during the loan, and repaying moves the authority to the builder's wallet. If the loan lapses, the protocol closes the program and returns the rent to lenders."
    >
      <svg className="pd-sol-diagram" viewBox={`0 0 ${L.W} ${L.H}`} aria-hidden="true">
        {/* The four paths, lit while something travels them. */}
        <g className="pd-sol-edges">
          <path d={wire(L.wires.loan)} data-on={now('loan') || now('reclaim') ? '' : undefined} />
          <path d={wire(L.wires.authority)} data-on={badge === 'pda' ? '' : undefined} />
          <path d={wire(L.wires.repay)} data-on={now('repay') ? '' : undefined} />
          <path d={wire(L.wires.handover)} data-on={now('claim') ? '' : undefined} />
        </g>
        {!L.compact && (
          <g className="pd-sol-edge-labels">
            <text x={L.centre.x} y={L.wires.loan[0].y - 12} textAnchor="middle">
              {reached('reclaim') ? 'rent, reclaimed' : 'rent + fees'}
            </text>
            <text x={L.wires.authority[0].x + 12} y={L.centre.y + 4}>
              authority
            </text>
            <text x={L.wires.repay[0].x - 12} y={L.centre.y + 4} textAnchor="end">
              repay
            </text>
            <text x={L.centre.x} y={L.wires.handover[0].y + 22} textAnchor="middle">
              on repay
            </text>
          </g>
        )}

        <Node L={L} k="pool" sub="sol from lenders" on={now('loan') || now('repay') || now('reclaim')} />
        <Node
          L={L}
          k="program"
          sub={reached('reclaim') ? 'closed, rent returned' : deployed ? 'deployed, upgradeable' : 'not deployed yet'}
          on={now('deploy')}
          done={deployed}
          dim={reached('reclaim')}
        />
        <Node
          L={L}
          k="builder"
          sub={reached('claim') ? 'holds the authority' : reached('expire') ? 'let the term run out' : 'borrows, then repays'}
          on={now('upload') || now('repay') || now('claim')}
          done={reached('claim')}
          dim={reached('expire')}
        />
        <Node L={L} k="pda" sub="no keys, no multi-sig" on={now('deploy') || now('expire') || now('reclaim')}>
          {L.compact ? (
            <Ring x={L.node.w - 26} y={8} size={18} />
          ) : (
            <Ring x={L.node.w - 38} y={17} size={26} />
          )}
        </Node>

        {/* The upgrade authority, carried as a tag between owners. */}
        <g
          className="pd-sol-badge"
          data-shown={badge ? '' : undefined}
          style={at(L.badge[badge ?? 'pda'], 'p') as CSSProperties}
        >
          <rect width={104} height={26} rx={13} />
          <text x={52} y={17.5} textAnchor="middle">
            authority
          </text>
        </g>

        {now('loan') && <Packets key={`${pos.scenario}-loan`} from={L.edges.loan[0]} to={L.edges.loan[1]} />}
        {now('repay') && <Packets key={`${pos.scenario}-repay`} from={L.edges.repay[0]} to={L.edges.repay[1]} />}
        {now('reclaim') && (
          <Packets key={`${pos.scenario}-reclaim`} from={L.edges.reclaim[0]} to={L.edges.reclaim[1]} />
        )}

        {/* The step, in the middle of it all. */}
        <g className="pd-sol-step" key={shown?.id ?? 'none'}>
          {shown && (
            <>
              <text className="pd-sol-step-number" x={L.centre.x} y={L.centre.y + 2} textAnchor="middle">
                {String(numbered.indexOf(shown) + 1).padStart(2, '0')}
              </text>
              <text className="pd-sol-step-title" x={L.centre.x} y={L.centre.y + 26} textAnchor="middle">
                {shown.title}
              </text>
            </>
          )}
        </g>
      </svg>

      <p className="pd-sol-line" aria-hidden="true">
        <span className="pd-sol-prompt">{'//'}</span> {shown?.line ?? 'waiting for a deploy'}
        {shown && <span className="pd-sol-caret" />}
      </p>
    </div>
  );
};

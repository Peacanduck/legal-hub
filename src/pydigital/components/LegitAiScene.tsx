import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../hooks';

// An illustration of a LegitAi risk check, not the app: the messages, the
// warning signs and the scores are written for this page, which is why its
// window is captioned as an illustration. The phone number is in the range
// reserved for fiction (555-01xx), and the link's .example domain cannot
// resolve.

interface Segment {
  text: string;
  /** Index into `signs`, for text the check flags. */
  sign?: number;
}

interface Scenario {
  from: string;
  initial: string;
  messages: Segment[][];
  signs: string[];
  score: number;
  verdict: 'scam' | 'safe';
  headline: string;
  note: string;
}

const SCENARIOS: Scenario[] = [
  {
    from: '+1 202 555 0142',
    initial: '#',
    messages: [
      [
        { text: 'Your parcel could not be delivered. A ' },
        { text: '$1.99 redelivery fee', sign: 0 },
        { text: ' is outstanding.' },
      ],
      [
        { text: 'Pay ' },
        { text: 'within 2 hours', sign: 1 },
        { text: ' or it will be returned: ' },
        { text: 'parcel-redelivery.example/pay', sign: 2 },
      ],
    ],
    signs: ['Asks for a payment', 'Pressure to act fast', 'Link to an unknown site'],
    score: 94,
    verdict: 'scam',
    headline: 'Likely scam',
    note: 'Don’t tap the link or reply.',
  },
  {
    from: 'Sam',
    initial: 'S',
    messages: [[{ text: 'Landed! Grabbing my bag now.' }], [{ text: 'See you at arrivals in 20.' }]],
    signs: [],
    score: 3,
    verdict: 'safe',
    headline: 'Looks safe',
    note: 'No warning signs found.',
  },
];

type Step =
  | { kind: 'empty' }
  | { kind: 'typing'; message: number }
  | { kind: 'message'; message: number }
  | { kind: 'scan' }
  | { kind: 'sign'; sign: number }
  | { kind: 'verdict' }
  | { kind: 'out' };

const timeline = (s: Scenario) => {
  const steps: [Step, number][] = [[{ kind: 'empty' }, 500]];
  s.messages.forEach((_, i) => {
    steps.push([{ kind: 'typing', message: i }, 650]);
    steps.push([{ kind: 'message', message: i }, 650]);
  });
  steps.push([{ kind: 'scan' }, 1400]);
  s.signs.forEach((_, i) => steps.push([{ kind: 'sign', sign: i }, 480]));
  steps.push([{ kind: 'verdict' }, 4200]);
  steps.push([{ kind: 'out' }, 450]);
  return steps;
};

const TIMELINES = SCENARIOS.map(timeline);

/** Counts up to `to` once it is shown. */
const Score = ({ to, run }: { to: number; run: boolean }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!run) {
      el.textContent = String(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);
  return <span ref={ref}>{to}</span>;
};

export const LegitAiScene = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [reduced] = useState(prefersReducedMotion);
  const [visible, setVisible] = useState(false);
  const [at, setAt] = useState(() => ({ scenario: 0, step: reduced ? TIMELINES[0].length - 2 : 0 }));

  useEffect(() => {
    const box = boxRef.current;
    if (!box || reduced) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    io.observe(box);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!visible || reduced) return;
    const [, ms] = TIMELINES[at.scenario][at.step];
    const id = window.setTimeout(() => {
      setAt(({ scenario, step }) =>
        step + 1 < TIMELINES[scenario].length
          ? { scenario, step: step + 1 }
          : { scenario: (scenario + 1) % SCENARIOS.length, step: 0 },
      );
    }, ms);
    return () => window.clearTimeout(id);
  }, [at, visible, reduced]);

  const s = SCENARIOS[at.scenario];
  const steps = TIMELINES[at.scenario];
  const [step] = steps[at.step];
  /** True once the timeline has got as far as the first step matching `is`. */
  const past = (is: (x: Step) => boolean) => {
    const i = steps.findIndex(([x]) => is(x));
    return i !== -1 && i <= at.step;
  };

  const shown = (i: number) => past((x) => x.kind === 'message' && x.message === i);
  const flagged = (i: number) => past((x) => x.kind === 'sign' && x.sign === i);
  const scanned = past((x) => x.kind === 'scan');
  const done = past((x) => x.kind === 'verdict');
  const found = s.signs.filter((_, i) => flagged(i)).length;

  const status = done
    ? s.headline
    : scanned
      ? found
        ? `Checking… ${found} found`
        : 'Checking…'
      : 'Waiting for a message';

  return (
    <div
      className="pd-scene pd-scan"
      ref={boxRef}
      data-step={step.kind}
      data-verdict={done ? s.verdict : undefined}
      role="img"
      aria-label="Illustration of a LegitAi risk check: a text demanding a parcel fee is rated a likely scam, with its warning signs listed, and a message from a friend is rated safe."
    >
      <div className="pd-scan-chat" aria-hidden="true">
        <div className="pd-scan-head">
          <span className="pd-scan-avatar">{s.initial}</span>
          <span className="pd-scan-from">
            <strong>{s.from}</strong>
            <small>Text message</small>
          </span>
        </div>
        <ol className="pd-scan-thread">
          {s.messages.map((m, i) => (
            <li key={`${at.scenario}-${i}`} className="pd-scan-bubble" data-shown={shown(i) ? '' : undefined}>
              {m.map((seg, j) =>
                seg.sign === undefined ? (
                  <span key={j}>{seg.text}</span>
                ) : (
                  <mark key={j} data-on={flagged(seg.sign) ? '' : undefined}>
                    {seg.text}
                    <sup>{seg.sign + 1}</sup>
                  </mark>
                ),
              )}
            </li>
          ))}
          <li className="pd-scan-typing" data-shown={step.kind === 'typing' ? '' : undefined}>
            <span />
            <span />
            <span />
          </li>
        </ol>
        <span className="pd-scan-beam" />
      </div>

      <div className="pd-scan-card" aria-hidden="true">
        <p className="pd-scan-kicker">
          <span className="pd-scan-pulse" />
          Risk check
        </p>
        <p className="pd-scan-score">
          {done ? <Score key={at.scenario} to={s.score} run={!reduced} /> : '--'}
          <small>%</small>
        </p>
        <p className="pd-scan-status">{status}</p>
        <span className="pd-scan-meter">
          <span style={{ width: done ? `${Math.max(4, s.score)}%` : '0%' }} />
        </span>
        <ul className="pd-scan-signs">
          {s.signs.map((sign, i) => (
            <li key={sign} data-on={flagged(i) ? '' : undefined}>
              <b>{i + 1}</b>
              {sign}
            </li>
          ))}
        </ul>
        <p className="pd-scan-note" data-on={done ? '' : undefined}>
          {s.note}
        </p>
      </div>
    </div>
  );
};

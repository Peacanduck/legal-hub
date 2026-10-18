import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { createDemo, type Demo, type DemoMode } from '../game/demo';
import { hex, type Skin } from '../game/skins';
import type { GameState } from '../game/state';

const FONT = "'Unbounded Variable', 'Unbounded', system-ui, sans-serif";
const GAUGE_R = 26;
const GAUGE_C = 2 * Math.PI * GAUGE_R;
const KEYS = new Set([' ', 'Enter', 'ArrowLeft', 'ArrowRight']);

type View = 'attract' | 'playing' | 'over';

const overLine = (score: number, previous: number) => {
  if (score > previous) return previous > 0 ? `Previous best ${previous}` : 'Now beat it';
  return previous > 0 ? `Best ${previous}` : 'Thread a gap to score';
};

/**
 * A live Vorta playfield. The autopilot flies it until a visitor taps; an
 * `interactive` one then hands them their own run, with the game's HUD.
 *
 * The first tap is a click, so a scroll that happens to start on the field
 * never starts a game. Once a run is live, reversals fire on pointer-down for
 * the same reason the game uses onTapDown: a click lands a beat late.
 */
export const Playfield = ({
  skin,
  label,
  interactive = false,
  hud = false,
  fieldFraction = 0.46,
  storeHref,
}: {
  skin: Skin;
  label: string;
  interactive?: boolean;
  hud?: boolean;
  fieldFraction?: number;
  storeHref?: string;
}) => {
  const screenRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const gaugeRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const multRef = useRef<HTMLSpanElement>(null);
  const comboRef = useRef<HTMLSpanElement>(null);

  const demoRef = useRef<Demo | null>(null);
  const skinRef = useRef(skin);
  const viewRef = useRef<View>('attract');
  const coachRef = useRef(false);
  const reversedRef = useRef(false);

  const [view, setViewState] = useState<View>('attract');
  const [coach, setCoachState] = useState(false);
  const [result, setResult] = useState({ score: 0, previous: 0 });
  const [announce, setAnnounce] = useState('');

  const setView = useCallback((next: View) => {
    viewRef.current = next;
    setViewState(next);
  }, []);

  const setCoach = useCallback((next: boolean) => {
    if (coachRef.current === next) return;
    coachRef.current = next;
    setCoachState(next);
  }, []);

  useEffect(() => {
    const screen = screenRef.current;
    const canvas = canvasRef.current;
    if (!screen || !canvas) return;

    // The HUD is written straight to the DOM, and only when a value changes:
    // re-rendering React sixty times a second for a score would be absurd.
    const shown = { score: -1, tag: '', combo: -1, dash: -1, urgent: false };
    const frame = (state: GameState, mode: DemoMode) => {
      if (mode === 'player') {
        setCoach(!reversedRef.current && state.phase === 'playing' && state.elapsed < 5);
      }
      const scoreEl = scoreRef.current;
      const tagEl = tagRef.current;
      const gauge = gaugeRef.current;
      const arc = arcRef.current;
      const multEl = multRef.current;
      const comboEl = comboRef.current;
      if (!scoreEl || !tagEl || !gauge || !arc || !multEl || !comboEl) return;

      if (state.score !== shown.score) {
        shown.score = state.score;
        scoreEl.textContent = String(state.score);
      }
      const best = demoRef.current?.best ?? 0;
      const beating = mode === 'player' && best > 0 && state.score > best;
      const tag = mode === 'attract' ? 'Autopilot' : beating ? 'New best' : best > 0 ? `Best ${best}` : 'First run';
      if (tag !== shown.tag) {
        shown.tag = tag;
        tagEl.textContent = tag;
        screen.toggleAttribute('data-beating', beating);
      }
      if (state.combo !== shown.combo) {
        shown.combo = state.combo;
        comboEl.textContent = String(state.combo);
        multEl.textContent = `${state.comboMultiplier.toFixed(1)}x`;
        gauge.style.opacity = state.combo > 0 ? '1' : '0';
      }
      const dash = Math.round(GAUGE_C * (1 - state.comboFraction) * 10) / 10;
      if (dash !== shown.dash) {
        shown.dash = dash;
        arc.style.strokeDashoffset = String(dash);
      }
      const urgent = state.combo > 0 && state.comboFraction < 0.33;
      if (urgent !== shown.urgent) {
        shown.urgent = urgent;
        gauge.toggleAttribute('data-urgent', urgent);
      }
    };

    const demo = createDemo(
      canvas,
      {
        skin: skinRef.current,
        fieldFraction,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        font: FONT,
      },
      {
        frame,
        over: (score, previous) => {
          setResult({ score, previous });
          setView('over');
          setAnnounce(score > previous ? `New best: ${score}.` : `Run over. You scored ${score}.`);
        },
      },
    );
    if (!demo) return;
    demoRef.current = demo;

    const ro = new ResizeObserver(([entry]) => demo.resize(entry.contentRect.width, entry.contentRect.height));
    ro.observe(screen);
    const io = new IntersectionObserver(
      ([entry]) => {
        demo.setVisible(entry.isIntersecting);
        // A finished run that nobody is looking at goes back to the autopilot.
        if (!entry.isIntersecting && viewRef.current === 'over') {
          demo.attract();
          setView('attract');
        }
      },
      { threshold: 0.02 },
    );
    io.observe(screen);

    return () => {
      ro.disconnect();
      io.disconnect();
      demo.destroy();
      demoRef.current = null;
    };
  }, [fieldFraction, setCoach, setView]);

  useEffect(() => {
    skinRef.current = skin;
    demoRef.current?.setSkin(skin);
  }, [skin]);

  const start = useCallback(() => {
    const demo = demoRef.current;
    if (!demo) return;
    demo.play();
    setView('playing');
    setAnnounce('Run started. Press Space to reverse.');
  }, [setView]);

  const onClick = () => {
    if (viewRef.current === 'attract') start();
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (viewRef.current !== 'playing' || e.button > 0) return;
    if (demoRef.current?.reverse()) {
      reversedRef.current = true;
      e.preventDefault();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!KEYS.has(e.key) || e.target !== e.currentTarget) return;
    e.preventDefault();
    if (e.repeat) return;
    if (viewRef.current === 'attract') start();
    else if (viewRef.current === 'playing' && demoRef.current?.reverse()) reversedRef.current = true;
  };

  const playAgain = (e: MouseEvent) => {
    e.stopPropagation();
    start();
  };

  const style = {
    '--pf-ink': hex(skin.ink),
    '--pf-accent': hex(skin.accent),
    '--pf-danger': hex(skin.danger),
    '--pf-glow': hex(skin.player),
  } as CSSProperties;

  return (
    <div
      ref={screenRef}
      className="vt-field"
      style={style}
      data-view={interactive ? view : undefined}
      role={interactive ? 'application' : 'img'}
      aria-roledescription={interactive ? 'game' : undefined}
      aria-label={label}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onPointerDown={interactive ? onPointerDown : undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
    >
      <canvas ref={canvasRef} className="vt-field-canvas" aria-hidden="true" />

      {hud && (
        <div className="vt-hud" aria-hidden="true">
          <div className="vt-hud-score">
            <span ref={scoreRef} className="vt-hud-value">
              0
            </span>
            <span ref={tagRef} className="vt-hud-tag">
              Autopilot
            </span>
          </div>
          <div ref={gaugeRef} className="vt-hud-gauge" style={{ opacity: 0 }}>
            <svg viewBox="0 0 64 64">
              <circle className="vt-hud-gauge-track" cx="32" cy="32" r={GAUGE_R} />
              <circle
                ref={arcRef}
                className="vt-hud-gauge-arc"
                cx="32"
                cy="32"
                r={GAUGE_R}
                strokeDasharray={GAUGE_C}
                strokeDashoffset={GAUGE_C}
              />
            </svg>
            <span ref={multRef} className="vt-hud-mult">
              1.0x
            </span>
            <span ref={comboRef} className="vt-hud-combo">
              0
            </span>
          </div>
        </div>
      )}

      {interactive && view === 'attract' && (
        <div className="vt-prompt" aria-hidden="true">
          <span className="vt-prompt-dot" />
          Tap to play
        </div>
      )}

      {interactive && view === 'playing' && coach && (
        <div className="vt-coach" aria-hidden="true">
          <strong>Tap to reverse</strong>
          <span>Anywhere on the screen. That is the whole game.</span>
        </div>
      )}

      {interactive && view === 'over' && (
        <div className="vt-over" data-best={result.score > result.previous ? '' : undefined}>
          <p className="vt-over-tag">{result.score > result.previous ? 'New best' : 'Run over'}</p>
          <p className="vt-over-score">{result.score}</p>
          <p className="vt-over-best">{overLine(result.score, result.previous)}</p>
          <div className="vt-over-actions">
            <button type="button" className="vt-btn vt-btn--solid vt-btn--sm" onClick={playAgain}>
              Play again
            </button>
            {storeHref && (
              <a className="vt-btn vt-btn--ghost vt-btn--sm" href={storeHref} onClick={(e) => e.stopPropagation()}>
                Get the full game
              </a>
            )}
          </div>
        </div>
      )}

      {interactive && (
        <p className="vt-sr" aria-live="polite">
          {announce}
        </p>
      )}
    </div>
  );
};

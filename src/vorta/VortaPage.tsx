import './theme';

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FeatureIcon, Mark, OrbitGrid, PillarGlyph, PlayBadge, Starfield } from './components/Art';
import { Footer, TopBar } from './components/Chrome';
import { ComboDemo } from './components/ComboDemo';
import { FairnessDiagram } from './components/FairnessDiagram';
import { Playfield } from './components/Playfield';
import { SkinShowcase } from './components/SkinShowcase';
import { usePageChrome, useReveal } from './components/hooks';
import { COMBO_STATS, FAIR_STATS, FAQ, FEATURES, LINKS, PILLARS } from './content';
import { NOCTURNE } from './game/skins';

export const VortaPage = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);
  usePageChrome('Vorta: Orbital Arcade');

  return (
    <div className="vt" ref={rootRef}>
      <a className="vt-skip" href="#main">
        Skip to content
      </a>

      <TopBar
        brandHref="#top"
        navLabel="Page"
        nav={
          <>
            <a href="#game">The game</a>
            <a href="#skins">Skins</a>
            <a href="#fair">Fair play</a>
            <a href="#faq">FAQ</a>
          </>
        }
        action={
          <a className="vt-btn vt-btn--pill" href={LINKS.play}>
            Get the game
          </a>
        }
      />

      <main id="main">
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="vt-hero" id="top">
          <div className="vt-hero-sky" aria-hidden="true">
            <Starfield />
          </div>
          <div className="vt-wrap vt-hero-layout">
            <div className="vt-hero-copy">
              <p className="vt-eyebrow">Orbital arcade for Android</p>
              <h1 className="vt-wordmark">
                Vorta<span className="vt-sr">: Orbital Arcade</span>
              </h1>
              <p className="vt-tagline">One tap to reverse. Thread the closing rings.</p>
              <p className="vt-lede">
                You orbit a glowing core while rings close in from the dark, each carrying a gap you have to find.
                Tap anywhere to reverse: that is the entire control scheme, and everything left to master.
              </p>
              <div className="vt-cta-row">
                <PlayBadge href={LINKS.play} />
                <a className="vt-btn vt-btn--ghost vt-mobile-only" href="#play">
                  Play the demo
                </a>
              </div>
              <ul className="vt-facts" aria-label="At a glance">
                <li>Free to play</li>
                <li>Plays offline</li>
                <li>No account</li>
              </ul>
            </div>

            <div className="vt-hero-device" id="play">
              <OrbitGrid />
              <div className="vt-phone">
                <div className="vt-phone-screen">
                  <Playfield
                    skin={NOCTURNE}
                    interactive
                    hud
                    storeHref={LINKS.play}
                    label="Playable Vorta demo. Press Space or tap to start, then to reverse."
                  />
                </div>
                <span className="vt-phone-island" aria-hidden="true" />
              </div>
              <p className="vt-device-caption">
                <span className="vt-live-dot" aria-hidden="true" />
                Live: the game&rsquo;s own rules, running in your browser
              </p>
            </div>
          </div>
        </section>

        {/* ── The loop ───────────────────────────────────────── */}
        <section className="vt-section" id="game">
          <div className="vt-wrap">
            <div className="vt-head vt-reveal">
              <p className="vt-eyebrow">The game</p>
              <h2 className="vt-h2">Tap. Reverse. Survive.</h2>
            </div>
            <ol className="vt-pillars">
              {PILLARS.map((p, i) => (
                <li key={p.title} className="vt-pillar vt-reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                  <PillarGlyph index={i} />
                  <span className="vt-pillar-index">0{i + 1}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Greed ──────────────────────────────────────────── */}
        <section className="vt-section vt-section--greed">
          <div className="vt-wrap vt-split">
            <div className="vt-reveal">
              <p className="vt-eyebrow vt-eyebrow--gold">The multiplier</p>
              <h2 className="vt-h2">Greed is the real difficulty.</h2>
              <p className="vt-body">
                Every gap you thread and every spark you grab feeds a multiplier, a tenth at a time. Sparks are worth
                double, and they never sit on the safe line. Let three and a half seconds pass without banking
                anything and the chain is gone.
              </p>
              <p className="vt-body">
                Playing it safe leaves points on the table. Chasing everything gets you killed. Your high score is a
                record of where you drew the line.
              </p>
              <dl className="vt-stats">
                {COMBO_STATS.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="vt-reveal">
              <ComboDemo />
            </div>
          </div>
        </section>

        {/* ── Skins ──────────────────────────────────────────── */}
        <section className="vt-section" id="skins">
          <div className="vt-wrap">
            <SkinShowcase
              head={
                <>
                  <p className="vt-eyebrow">Designed in the dark</p>
                  <h2 className="vt-h2">Seven ways to see it.</h2>
                  <p className="vt-body">
                    Every ring, spark and particle is drawn in code, sharp on any screen. A skin repaints all of it
                    at once, and changes the shape you fly.
                  </p>
                </>
              }
            />
          </div>
        </section>

        {/* ── Fair by construction ───────────────────────────── */}
        <section className="vt-section vt-section--fair" id="fair">
          <div className="vt-wrap vt-split">
            <div className="vt-reveal">
              <p className="vt-eyebrow">Fair by construction</p>
              <h2 className="vt-h2">If you die, it was you.</h2>
              <p className="vt-body">
                Random spawns kill players for reasons they could never have avoided. Vorta does not roll those dice.
                Before a ring appears, the game works out where you will be when it arrives and how far you can
                travel in the time between, then puts the opening inside that reach.
              </p>
              <ul className="vt-fair-stats">
                {FAIR_STATS.map((s) => (
                  <li key={s.value}>
                    <strong>{s.value}</strong>
                    <span>{s.body}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="vt-reveal">
              <FairnessDiagram />
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────── */}
        <section className="vt-section">
          <div className="vt-wrap">
            <div className="vt-head vt-reveal">
              <p className="vt-eyebrow">Built to be picked up</p>
              <h2 className="vt-h2">Under a minute, anywhere.</h2>
              <p className="vt-body">
                No tutorial to sit through and no timers to wait out. One tap starts a run, and the retry button is
                exactly where your thumb already is.
              </p>
            </div>
            <ul className="vt-features">
              {FEATURES.map((f, i) => (
                <li key={f.title} className="vt-feature vt-reveal" style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
                  <FeatureIcon name={f.icon} />
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section className="vt-section" id="faq">
          <div className="vt-wrap vt-narrow">
            <div className="vt-head vt-reveal">
              <p className="vt-eyebrow">FAQ</p>
              <h2 className="vt-h2">Before you play.</h2>
            </div>
            <div className="vt-faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>
                    {f.a}
                    {f.link && (
                      <>
                        {' '}
                        <Link to={f.link.href}>{f.link.label}</Link>.
                      </>
                    )}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final call ─────────────────────────────────────── */}
        <section className="vt-final">
          <div className="vt-final-rings" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="vt-wrap vt-final-inner vt-reveal">
            <Mark size={52} />
            <h2 className="vt-final-title">How long can you hold the line?</h2>
            <PlayBadge href={LINKS.play} className="vt-badge--lg" />
            <p className="vt-fine">Free on Google Play &middot; Contains ads &middot; In-app purchases</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

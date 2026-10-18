import './theme';

import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import type { AppData } from '../data/apps';
import { DiggleScene } from './components/DiggleScene';
import { EmberField } from './components/EmberField';
import { LegitAiScene } from './components/LegitAiScene';
import { Glyph, Mark } from './components/Pixels';
import { Footer, SmartLink, TopBar } from './components/Chrome';
import { VortaScene } from './components/VortaScene';
import {
  DOCS,
  PRINCIPLES,
  SHOWCASE,
  STUDIO_EMAIL,
  accentOf,
  appHref,
  docHref,
  shortName,
  type Scene,
  type Showcase,
} from './content';
import { usePageChrome, useReveal } from './hooks';

const SCENES: Record<Scene, ComponentType> = {
  vorta: VortaScene,
  diggle: DiggleScene,
  legitai: LegitAiScene,
};

const accent = (color: string) => ({ '--pd-accent': color }) as CSSProperties;

const appById = (id: string) => SHOWCASE.find((s) => s.app.id === id)?.app;

/** Community links the apps publish (src/data/apps.ts), named for their app. */
const COMMUNITY = SHOWCASE.flatMap(({ app }) => [
  ...(app.socials?.x ? [{ href: app.socials.x, label: `${shortName(app)} on X` }] : []),
  ...(app.socials?.discord ? [{ href: app.socials.discord, label: `${shortName(app)} on Discord` }] : []),
]);

export const PyDigitalPage = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  useReveal(rootRef);
  usePageChrome();

  return (
    <div className="pd" ref={rootRef}>
      <a className="pd-skip" href="#main">
        Skip to content
      </a>

      <TopBar />

      <main id="main">
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="pd-hero" id="top" ref={heroRef}>
          <div className="pd-hero-bg" aria-hidden="true" />
          <div className="pd-wrap pd-hero-layout">
            <div className="pd-hero-copy">
              <p className="pd-eyebrow">
                <span className="pd-hide-narrow">Py Digital&nbsp;&middot;&nbsp;</span>Independent games &amp; apps
              </p>
              <h1 className="pd-display">
                Small games, built all the way down
                <span className="pd-stop" aria-hidden="true" />
                <span className="pd-sr">.</span>
              </h1>
              <p className="pd-lede">
                We&rsquo;re an independent studio making games and apps for your phone. Each one starts from a single
                idea and gets built with care all the way through, from fairness checks you&rsquo;ll never notice to
                policies you can actually read.
              </p>
              <div className="pd-cta-row">
                <a className="pd-btn pd-btn--solid" href="#work">
                  See the work
                </a>
                <a className="pd-btn pd-btn--ghost" href={`mailto:${STUDIO_EMAIL}`}>
                  Get in touch
                </a>
              </div>
              <ul className="pd-facts" aria-label="Where our games are">
                <li>On Google Play</li>
                <li>On the Solana dApp Store</li>
              </ul>
            </div>

            <figure className="pd-hero-flame">
              <EmberField region={heroRef} />
              <figcaption className="pd-caption">
                <span className="pd-live" aria-hidden="true" />
                <span className="pd-if-hover">Live. Move your cursor to fan it, click to stoke it.</span>
                <span className="pd-if-touch">Live. Tap the fire to stoke it.</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ── The work ───────────────────────────────────────── */}
        <section className="pd-section" id="work">
          <div className="pd-wrap">
            <header className="pd-head pd-reveal">
              <p className="pd-eyebrow">
                <span className="pd-index">01</span>The work
              </p>
              <h2 className="pd-h2">Built here, running live.</h2>
              <p className="pd-body">
                Two games out now, and an app that spots scams. The game windows are live: Vorta plays by the
                game&rsquo;s own rules, flown by its autopilot, and Diggle digs with sprites cut from the game&rsquo;s
                own sheets.
              </p>
            </header>
            <div className="pd-works">
              {SHOWCASE.map((item, i) => (
                <Work key={item.app.id} item={item} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Principles ─────────────────────────────────────── */}
        <section className="pd-section pd-section--principles" id="principles">
          <div className="pd-wrap">
            <header className="pd-head pd-reveal">
              <p className="pd-eyebrow">
                <span className="pd-index">02</span>How we build
              </p>
              <h2 className="pd-h2">Three rules, every project.</h2>
              <p className="pd-body">
                Rules are easy to write down, so each one comes with where it shows up in what we&rsquo;ve shipped.
              </p>
            </header>
            <ol className="pd-principles">
              {PRINCIPLES.map((p, i) => (
                <li key={p.title} className="pd-principle pd-reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                  <Glyph name={p.glyph} />
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                  <ul className="pd-receipts" aria-label="Where it shows">
                    {p.receipts.map((r) => {
                      const app = appById(r.app);
                      return (
                        <li key={r.text} style={accent(accentOf(r.app))}>
                          <span className="pd-chip">{app ? shortName(app) : r.app}</span>
                          <span>{r.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Legal ──────────────────────────────────────────── */}
        <section className="pd-section" id="legal">
          <div className="pd-wrap">
            <header className="pd-head pd-reveal">
              <p className="pd-eyebrow">
                <span className="pd-index">03</span>Legal
              </p>
              <h2 className="pd-h2">Every policy, in plain sight.</h2>
              <p className="pd-body">
                The privacy policy, terms, license and copyright notice for everything we make, in one place and
                written to be read.
              </p>
            </header>
            <div className="pd-legal pd-reveal">
              <table className="pd-legal-table">
                <caption className="pd-sr">Legal documents for each project</caption>
                <thead>
                  <tr>
                    <th scope="col">Project</th>
                    {DOCS.map((d) => (
                      <th key={d.type} scope="col">
                        {d.label}
                      </th>
                    ))}
                    <th scope="col">Last updated</th>
                  </tr>
                </thead>
                <tbody>
                  {SHOWCASE.map(({ app }) => (
                    <tr key={app.id}>
                      <th scope="row">
                        <AppIcon app={app} />
                        <span className="pd-legal-app">
                          <strong>{app.name}</strong>
                          <small>{app.developerName}</small>
                        </span>
                      </th>
                      {DOCS.map((d) => (
                        <td key={d.type}>
                          <SmartLink className="pd-doc" to={docHref(app.id, d.type)}>
                            {d.label}
                            <span className="pd-sr">, {shortName(app)}</span>
                            <span className="pd-doc-arrow" aria-hidden="true">
                              &rarr;
                            </span>
                          </SmartLink>
                        </td>
                      ))}
                      <td className="pd-legal-date">
                        <span className="pd-legal-date-label">Updated </span>
                        {app.lastUpdated}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Contact ────────────────────────────────────────── */}
        <section className="pd-contact" id="contact">
          <div className="pd-contact-mark" aria-hidden="true">
            <Mark size={560} />
          </div>
          <div className="pd-wrap pd-contact-inner pd-reveal">
            <p className="pd-eyebrow">
              <span className="pd-index">04</span>Contact
            </p>
            <h2 className="pd-contact-title">Say hello.</h2>
            <p className="pd-body">Support, feedback, press or partnerships: one address reaches the studio.</p>
            <div className="pd-email-row">
              <a className="pd-email" href={`mailto:${STUDIO_EMAIL}`}>
                {STUDIO_EMAIL}
              </a>
              <CopyButton text={STUDIO_EMAIL} />
            </div>
            {COMMUNITY.length > 0 && (
              <ul className="pd-community" aria-label="Communities">
                {COMMUNITY.map((c) => (
                  <li key={c.href}>
                    <a href={c.href} target="_blank" rel="noreferrer">
                      {c.label}
                      <span className="pd-sr"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const Work = ({ item, index }: { item: Showcase; index: number }) => {
  const { app } = item;
  const Scene = item.scene ? SCENES[item.scene] : null;
  const name = shortName(app);

  return (
    <article className="pd-work pd-reveal" style={accent(item.accent)} aria-labelledby={`work-${app.id}`}>
      <div className="pd-window">
        {Scene ? <Scene /> : <Art app={app} />}
        {item.caption && (
          <p className="pd-window-chip">
            {item.live && <span className="pd-live" aria-hidden="true" />}
            {item.live ? 'Live: ' : ''}
            {item.caption}
          </p>
        )}
      </div>

      <div className="pd-work-copy">
        <p className="pd-work-meta">
          <span className="pd-index">{String(index + 1).padStart(2, '0')}</span>
          {item.kind}
          {item.platform && <span className="pd-work-platform">{item.platform}</span>}
        </p>
        <h3 className="pd-work-name" id={`work-${app.id}`}>
          {app.name}
        </h3>
        {item.tagline && <p className="pd-work-tagline">{item.tagline}</p>}
        {item.summary && <p className="pd-body">{item.summary}</p>}
        {item.stats.length > 0 && (
          <dl className="pd-stats">
            {item.stats.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="pd-work-actions">
          <SmartLink className="pd-btn pd-btn--solid" to={appHref(app.id)}>
            Visit {name}
          </SmartLink>
          {item.store && (
            <a className="pd-arrow-link" href={item.store.href} target="_blank" rel="noreferrer">
              {item.store.label}
              <span aria-hidden="true">&#8599;</span>
              <span className="pd-sr"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

/** The window for an app with no scene yet: its art, or its initial. */
const Art = ({ app }: { app: AppData }) => (
  <div className="pd-scene pd-art">
    {app.banner ? (
      <img src={app.banner} alt="" loading="lazy" decoding="async" />
    ) : app.logo ? (
      <img className="pd-art-logo" src={app.logo} alt="" loading="lazy" decoding="async" />
    ) : (
      <span className="pd-art-initial" aria-hidden="true">
        {app.name.charAt(0)}
      </span>
    )}
  </div>
);

const AppIcon = ({ app }: { app: AppData }) =>
  app.favicon ? (
    <img className="pd-app-icon" src={app.favicon} alt="" width={40} height={40} loading="lazy" decoding="async" />
  ) : (
    <span className="pd-app-icon pd-app-icon--initial" aria-hidden="true" style={accent(accentOf(app.id))}>
      {app.name.charAt(0)}
    </span>
  );

/** Copies the address, for anyone whose mail links open the wrong app. */
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const [supported] = useState(() => !!navigator.clipboard);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(id);
  }, [copied]);

  if (!supported) return null;
  return (
    <>
      <button
        type="button"
        className="pd-btn pd-btn--ghost pd-btn--sm"
        onClick={() =>
          navigator.clipboard.writeText(text).then(
            () => setCopied(true),
            () => undefined,
          )
        }
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <span className="pd-sr" aria-live="polite">
        {copied ? 'Email address copied.' : ''}
      </span>
    </>
  );
};

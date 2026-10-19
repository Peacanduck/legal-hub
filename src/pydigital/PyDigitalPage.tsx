import './theme';

import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import type { AppData } from '../data/apps';
import { DiggleScene } from './components/DiggleScene';
import { EmberField } from './components/EmberField';
import { LegitAiScene } from './components/LegitAiScene';
import { Glyph, Mark } from './components/Pixels';
import { Footer, SmartLink, TopBar } from './components/Chrome';
import { SolignitionScene } from './components/SolignitionScene';
import { VortaScene } from './components/VortaScene';
import {
  DOCS,
  LEGAL_APPS,
  PRACTICES,
  PRINCIPLES,
  SHOWCASE,
  STUDIO_EMAIL,
  accentOf,
  docHref,
  projectAnchor,
  projectById,
  shortName,
  type Project,
  type Scene,
} from './content';
import { usePageChrome, useReveal } from './hooks';

const SCENES: Record<Scene, ComponentType> = {
  vorta: VortaScene,
  diggle: DiggleScene,
  solignition: SolignitionScene,
  legitai: LegitAiScene,
};

const accent = (color: string) => ({ '--pd-accent': color }) as CSSProperties;

/** Community links the projects publish, named for their project. */
const COMMUNITY = SHOWCASE.flatMap((p) => p.socials);

const NewTab = () => <span className="pd-sr"> (opens in a new tab)</span>;

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
                <span className="pd-hide-narrow">Py Digital&nbsp;&middot;&nbsp;</span>Games, smart contracts &amp; DeFi
              </p>
              <h1 className="pd-display">
                <span className="pd-display-line">Games and DeFi, </span>
                built all the way down
                <span className="pd-stop" aria-hidden="true" />
                <span className="pd-sr">.</span>
              </h1>
              <p className="pd-lede">
                Py Digital is an independent studio. We make games and apps for your phone, write smart contracts and
                DeFi protocols on Solana, and are setting up a proprietary trading firm.
              </p>
              <div className="pd-cta-row">
                <a className="pd-btn pd-btn--solid" href="#work">
                  See the work
                </a>
                <a className="pd-btn pd-btn--ghost" href={`mailto:${STUDIO_EMAIL}`}>
                  Get in touch
                </a>
              </div>
              <ul className="pd-facts" aria-label="Where our work runs">
                <li>Google Play</li>
                <li>Solana dApp Store</li>
                <li>Solana devnet</li>
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

        {/* ── What we build ──────────────────────────────────── */}
        <section className="pd-section" id="studio">
          <div className="pd-wrap">
            <header className="pd-head pd-reveal">
              <p className="pd-eyebrow">
                <span className="pd-index">01</span>What we build
              </p>
              <h2 className="pd-h2">From one-thumb games to on-chain lending.</h2>
              <p className="pd-body">Four kinds of work, from one studio, held to one standard.</p>
            </header>
            <ul className="pd-practices">
              {PRACTICES.map((p, i) => (
                <li key={p.title} className="pd-practice pd-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                  <Glyph name={p.glyph} />
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                  <div className="pd-practice-foot">
                    {p.projects.map((id) => {
                      const project = projectById(id);
                      if (!project) return null;
                      return (
                        <a key={id} className="pd-chip" href={projectAnchor(id)} style={accent(project.accent)}>
                          {shortName(project.name)}
                        </a>
                      );
                    })}
                    {p.status && <span className="pd-status">{p.status}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── The work ───────────────────────────────────────── */}
        <section className="pd-section" id="work">
          <div className="pd-wrap">
            <header className="pd-head pd-reveal">
              <p className="pd-eyebrow">
                <span className="pd-index">02</span>The work
              </p>
              <h2 className="pd-h2">Built here, running live.</h2>
              <p className="pd-body">
                Two games out now, a lending protocol live on Solana devnet, and an app that spots scams. The game
                windows are live, built from each game&rsquo;s own rules and art. The other two are illustrations of how
                the product works.
              </p>
            </header>
            <div className="pd-works">
              {SHOWCASE.map((project, i) => (
                <Work key={project.id} project={project} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Principles ─────────────────────────────────────── */}
        <section className="pd-section pd-section--principles" id="principles">
          <div className="pd-wrap">
            <header className="pd-head pd-reveal">
              <p className="pd-eyebrow">
                <span className="pd-index">03</span>How we build
              </p>
              <h2 className="pd-h2">Three rules, every project.</h2>
              <p className="pd-body">
                Fairness checks you&rsquo;ll never notice, programs that hold no keys, policies you can actually read.
                Each rule comes with where it shows up in what we&rsquo;ve shipped.
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
                      const project = projectById(r.project);
                      return (
                        <li key={r.text} style={accent(accentOf(r.project))}>
                          <span className="pd-chip">{project ? shortName(project.name) : r.project}</span>
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
                <span className="pd-index">04</span>Legal
              </p>
              <h2 className="pd-h2">Every policy, in plain sight.</h2>
              <p className="pd-body">
                The privacy policy, terms, license and copyright notice for each of our apps, in one place and written
                to be read.
              </p>
            </header>
            <div className="pd-legal pd-reveal">
              <table className="pd-legal-table">
                <caption className="pd-sr">Legal documents for each app</caption>
                <thead>
                  <tr>
                    <th scope="col">App</th>
                    {DOCS.map((d) => (
                      <th key={d.type} scope="col">
                        {d.label}
                      </th>
                    ))}
                    <th scope="col">Last updated</th>
                  </tr>
                </thead>
                <tbody>
                  {LEGAL_APPS.map((app) => (
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
                            <span className="pd-sr">, {shortName(app.name)}</span>
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
              <span className="pd-index">05</span>Contact
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
                      <NewTab />
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

const Work = ({ project, index }: { project: Project; index: number }) => {
  const Scene = project.scene ? SCENES[project.scene] : null;

  return (
    <article
      className="pd-work pd-reveal"
      id={`project-${project.id}`}
      style={accent(project.accent)}
      aria-labelledby={`project-${project.id}-name`}
    >
      <div className="pd-window">
        {Scene ? <Scene /> : <Art project={project} />}
        {project.caption && (
          <p className="pd-window-chip">
            {project.live && <span className="pd-live" aria-hidden="true" />}
            {project.live ? 'Live: ' : ''}
            {project.caption}
          </p>
        )}
      </div>

      <div className="pd-work-copy">
        <p className="pd-work-meta">
          <span className="pd-index">{String(index + 1).padStart(2, '0')}</span>
          {project.kind}
          {(project.platform || project.status) && (
            <span className="pd-work-where">
              {project.platform && <span className="pd-work-platform">{project.platform}</span>}
              {project.status && <span className="pd-status">{project.status}</span>}
            </span>
          )}
        </p>
        <h3 className="pd-work-name" id={`project-${project.id}-name`}>
          {project.name}
        </h3>
        {project.tagline && <p className="pd-work-tagline">{project.tagline}</p>}
        {project.summary && <p className="pd-body">{project.summary}</p>}
        {project.stats.length > 0 && (
          <dl className="pd-stats">
            {project.stats.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="pd-work-actions">
          <SmartLink className="pd-btn pd-btn--solid" to={project.href}>
            Visit {shortName(project.name)}
          </SmartLink>
          {project.links.map((l) => (
            <a key={l.href} className="pd-arrow-link" href={l.href} target="_blank" rel="noreferrer">
              {l.label}
              <span aria-hidden="true">&#8599;</span>
              <NewTab />
            </a>
          ))}
        </div>
      </div>
    </article>
  );
};

/** The window for a project with no scene yet: its art, or its initial. */
const Art = ({ project }: { project: Project }) => (
  <div className="pd-scene pd-art">
    {project.art?.banner ? (
      <img src={project.art.banner} alt="" loading="lazy" decoding="async" />
    ) : project.art?.logo ? (
      <img className="pd-art-logo" src={project.art.logo} alt="" loading="lazy" decoding="async" />
    ) : (
      <span className="pd-art-initial" aria-hidden="true">
        {project.name.charAt(0)}
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

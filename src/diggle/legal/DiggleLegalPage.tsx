import '../theme';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DIGGLE_DOCS } from '../../policies/diggleDocuments';
import { DIGGLE_LEGAL, DOC_ORDER, type DiggleDocType } from '../../policies/diggleLegal';
import { Footer } from '../components/Footer';
import { TopBar } from '../components/TopBar';
import { usePageChrome } from '../components/usePageChrome';

// Diggle's legal documents in the landing page's theme. Deliberately imports
// nothing from ../solana or the wallet adapter: these pages stay small and
// never load chain code.

const docLinks = (current: DiggleDocType) =>
  DOC_ORDER.map((type) => (
    <Link key={type} to={`/diggle/${type}`} aria-current={type === current ? 'page' : undefined}>
      {DIGGLE_DOCS[type].tab}
    </Link>
  ));

export const DiggleLegalPage = ({ type }: { type: DiggleDocType }) => {
  const doc = DIGGLE_DOCS[type];
  usePageChrome(`${doc.title} — Diggle`);

  // The contents list starts open beside the text on wide screens and folded
  // above it on phones, where an open list would push the document down.
  const [tocOpen] = useState(() => window.matchMedia('(min-width: 960px)').matches);

  const position = DOC_ORDER.indexOf(type);
  const prev = position > 0 ? DOC_ORDER[position - 1] : null;
  const next = position < DOC_ORDER.length - 1 ? DOC_ORDER[position + 1] : null;

  const contents = [
    ...(doc.summary ? [{ id: 'short-version', title: 'The short version' }] : []),
    ...doc.sections.map(({ id, title }) => ({ id, title })),
  ];

  return (
    <div className="dg dg-legal">
      <a className="dg-skip" href="#legal-content">
        Skip to content
      </a>

      <TopBar
        brandHref="/diggle"
        navLabel="Legal documents"
        nav={docLinks(type)}
        actions={
          <Link className="dg-wallet-btn" to="/diggle">
            Back to Diggle
          </Link>
        }
      />

      <header className="dg-legal-hero">
        <div className="dg-wrap">
          <p className="dg-pixel dg-eyebrow">Legal &middot; Diggle</p>
          <h1 className="dg-legal-title">{doc.title}</h1>
          <dl className="dg-legal-meta">
            <div>
              <dt>Effective</dt>
              <dd>{DIGGLE_LEGAL.effectiveDate}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{DIGGLE_LEGAL.lastUpdated}</dd>
            </div>
            <div>
              <dt>Published by</dt>
              <dd>{DIGGLE_LEGAL.company}</dd>
            </div>
          </dl>
          <nav className="dg-legal-tabs" aria-label="Legal documents">
            {docLinks(type)}
          </nav>
        </div>
        <div className="dg-legal-floor" aria-hidden="true" />
      </header>

      <main className="dg-wrap dg-legal-body" id="legal-content">
        <aside className="dg-legal-toc">
          <details open={tocOpen}>
            <summary>On this page</summary>
            <ol>
              {contents.map(({ id, title }) => (
                <li key={id}>
                  <a href={`#${id}`}>{title}</a>
                </li>
              ))}
            </ol>
          </details>
        </aside>

        <article className="dg-prose">
          {doc.lede}

          {doc.summary && (
            <section id="short-version" className="dg-legal-summary dg-plate">
              <h2>The short version</h2>
              <ul>
                {doc.summary.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {doc.sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2>{section.title}</h2>
              {section.body}
            </section>
          ))}

          <nav className="dg-legal-pager" aria-label="More legal documents">
            {prev ? (
              <Link to={`/diggle/${prev}`}>
                <span>Previous</span>
                <strong>{DIGGLE_DOCS[prev].title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/diggle/${next}`} className="is-next">
                <span>Next</span>
                <strong>{DIGGLE_DOCS[next].title}</strong>
              </Link>
            ) : (
              <Link to="/diggle" className="is-next">
                <span>Done</span>
                <strong>Back to Diggle</strong>
              </Link>
            )}
          </nav>
        </article>
      </main>

      <Footer />
    </div>
  );
};

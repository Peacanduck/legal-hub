import '../theme';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { getAppById } from '../../data/apps';
import { VortaCopyright, VortaLicense, VortaPrivacy, VortaTerms } from '../../policies/VortaPolicies';
import { OrbitGrid } from '../components/Art';
import { Footer, TopBar } from '../components/Chrome';
import { usePageChrome } from '../components/hooks';

// Vorta's legal documents in the landing page's theme. Only the frame is new:
// the text is still the components in src/policies/VortaPolicies.tsx, which
// is what Play Console's privacy-policy URL publishes, so it is rendered
// exactly as the hub's generic page renders it.

export type VortaDocType = 'privacy' | 'terms' | 'license' | 'copyright';

const ORDER: VortaDocType[] = ['privacy', 'terms', 'license', 'copyright'];

const DOCS: Record<VortaDocType, { title: string; tab: string }> = {
  privacy: { title: 'Privacy Policy', tab: 'Privacy' },
  terms: { title: 'Terms & Conditions', tab: 'Terms' },
  license: { title: 'License Agreement', tab: 'License' },
  copyright: { title: 'Copyright Notice', tab: 'Copyright' },
};

const app = getAppById('vorta');
const APP_NAME = app?.name ?? 'Vorta: Orbital Arcade';
const EMAIL = app?.contactEmail ?? 'fu.developer@gmail.com';

const Body = ({ type }: { type: VortaDocType }) => {
  switch (type) {
    case 'privacy':
      return <VortaPrivacy appName={APP_NAME} email={EMAIL} />;
    case 'terms':
      return <VortaTerms appName={APP_NAME} email={EMAIL} />;
    case 'license':
      return <VortaLicense appName={APP_NAME} email={EMAIL} />;
    case 'copyright':
      return <VortaCopyright appName={APP_NAME} email={EMAIL} />;
  }
};

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'section';

/**
 * The contents list, read off the rendered headings. The documents carry no
 * section data of their own, and a second hand-kept list of titles would be
 * one more thing to drift from the published text. Documents with only a
 * couple of top-level sections list their subsections too.
 */
function useHeadings(article: RefObject<HTMLElement | null>, doc: VortaDocType) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  useEffect(() => {
    const el = article.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      const h2s = el.querySelectorAll('h2');
      const nodes = h2s.length >= 3 ? [...h2s] : [...el.querySelectorAll('h2, h3')];
      const used = new Map<string, number>();
      setHeadings(
        nodes.map((node) => {
          const text = node.textContent?.trim() ?? '';
          const base = slug(text);
          const n = (used.get(base) ?? 0) + 1;
          used.set(base, n);
          node.id = n > 1 ? `${base}-${n}` : base;
          return { id: node.id, text, level: node.tagName === 'H3' ? 3 : 2 };
        }),
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [article, doc]);
  return headings;
}

/** The section being read: the last heading to scroll past the top bar, or
 *  the final one once the page bottoms out, since a short last section can
 *  never scroll that far. */
function useActiveHeading(headings: Heading[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (headings.length === 0) return;
    const nodes = headings.map((h) => document.getElementById(h.id)).filter((n) => n !== null);
    let raf = 0;
    const measure = () => {
      raf = 0;
      let current: string | null = null;
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= 120) current = node.id;
        else break;
      }
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActive(atEnd && nodes.length > 0 ? nodes[nodes.length - 1].id : current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [headings]);
  return active;
}

const docLinks = (current: VortaDocType) =>
  ORDER.map((type) => (
    <Link key={type} to={`/vorta/${type}`} aria-current={type === current ? 'page' : undefined}>
      {DOCS[type].tab}
    </Link>
  ));

export const VortaLegalPage = ({ type }: { type: VortaDocType }) => {
  const doc = DOCS[type];
  usePageChrome(`${doc.title} — ${APP_NAME}`);

  const articleRef = useRef<HTMLElement>(null);
  const headings = useHeadings(articleRef, type);
  const active = useActiveHeading(headings);

  // Open beside the text on wide screens, folded above it on narrow ones,
  // where an open list would push the document below the fold.
  const [tocOpen] = useState(() => window.matchMedia('(min-width: 1024px)').matches);

  const position = ORDER.indexOf(type);
  const prev = position > 0 ? ORDER[position - 1] : null;
  const next = position < ORDER.length - 1 ? ORDER[position + 1] : null;

  return (
    <div className="vt vt-legal">
      <a className="vt-skip" href="#legal-content">
        Skip to the document
      </a>

      <TopBar
        brandHref="/vorta"
        navLabel="Legal documents"
        nav={docLinks(type)}
        action={
          <Link className="vt-btn vt-btn--pill" to="/vorta">
            Back to Vorta
          </Link>
        }
      />

      <header className="vt-legal-hero">
        <OrbitGrid className="vt-orbit-grid--corner" />
        <div className="vt-wrap">
          <p className="vt-eyebrow">Legal &middot; Vorta</p>
          <h1 className="vt-legal-title">{doc.title}</h1>
          <dl className="vt-legal-meta">
            <div>
              <dt>App</dt>
              <dd>{APP_NAME}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{app?.lastUpdated}</dd>
            </div>
            <div>
              <dt>Published by</dt>
              <dd>{app?.developerName}</dd>
            </div>
          </dl>
          <nav className="vt-legal-tabs" aria-label="Legal documents">
            {docLinks(type)}
          </nav>
        </div>
      </header>

      <main className="vt-wrap vt-legal-layout">
        <aside className="vt-legal-toc">
          {headings.length > 0 && (
            <details open={tocOpen}>
              <summary>On this page</summary>
              <ol>
                {headings.map((h) => (
                  <li key={h.id} data-level={h.level}>
                    <a href={`#${h.id}`} aria-current={h.id === active ? 'location' : undefined}>
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </aside>

        <div>
          <article className="vt-prose" id="legal-content" ref={articleRef} key={type}>
            <Body type={type} />
          </article>

          <nav className="vt-legal-pager" aria-label="More legal documents">
            {prev ? (
              <Link to={`/vorta/${prev}`}>
                <span>Previous</span>
                <strong>{DOCS[prev].title}</strong>
              </Link>
            ) : (
              <i aria-hidden="true" />
            )}
            {next ? (
              <Link to={`/vorta/${next}`} className="is-next">
                <span>Next</span>
                <strong>{DOCS[next].title}</strong>
              </Link>
            ) : (
              <Link to="/vorta" className="is-next">
                <span>Done</span>
                <strong>Back to Vorta</strong>
              </Link>
            )}
          </nav>
        </div>
      </main>

      <Footer />
    </div>
  );
};

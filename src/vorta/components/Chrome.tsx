import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LINKS } from '../content';
import { Mark } from './Art';
import { useScrolled } from './hooks';

/**
 * The Vorta top bar. The landing page fills `nav` with in-page anchors; the
 * legal pages fill it with the documents and a way back, so neither loads
 * what only the other needs.
 */
export const TopBar = ({
  brandHref,
  navLabel,
  nav,
  action,
}: {
  /** `/…` routes through the router; `#…` stays an in-page anchor. */
  brandHref: string;
  navLabel: string;
  nav: ReactNode;
  action: ReactNode;
}) => {
  const scrolled = useScrolled();
  const brand = (
    <>
      <Mark />
      <span>Vorta</span>
    </>
  );

  return (
    <header className={`vt-topbar${scrolled ? ' is-scrolled' : ''}`}>
      <div className="vt-topbar-inner">
        {brandHref.startsWith('/') ? (
          <Link className="vt-brand" to={brandHref} aria-label="Vorta home">
            {brand}
          </Link>
        ) : (
          <a className="vt-brand" href={brandHref} aria-label="Vorta, back to top">
            {brand}
          </a>
        )}
        <nav className="vt-nav" aria-label={navLabel}>
          {nav}
        </nav>
        {action}
      </div>
    </header>
  );
};

export const Footer = () => (
  <footer className="vt-footer">
    <div className="vt-wrap vt-footer-grid">
      <div>
        <p className="vt-brand vt-brand--footer">
          <Mark size={24} />
          <span>Vorta</span>
        </p>
        <p className="vt-fine">
          An orbital arcade game by <Link to="/">Py Digital</Link>.
        </p>
      </div>
      <nav aria-label="Legal">
        <Link to={LINKS.privacy}>Privacy</Link>
        <Link to={LINKS.terms}>Terms</Link>
        <Link to={LINKS.license}>License</Link>
        <Link to={LINKS.copyright}>Copyright</Link>
      </nav>
      <nav aria-label="More">
        <a href={LINKS.play}>Google Play</a>
        <a href={LINKS.support}>Support</a>
        <Link to="/">More from Py Digital</Link>
      </nav>
    </div>
    <div className="vt-wrap vt-footer-base">
      <p>&copy; {new Date().getFullYear()} Py Digital. All rights reserved.</p>
      <p>Google Play and the Google Play logo are trademarks of Google LLC.</p>
    </div>
  </footer>
);

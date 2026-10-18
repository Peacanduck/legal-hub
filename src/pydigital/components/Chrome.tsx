import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SHOWCASE, STUDIO_EMAIL, appHref, shortName } from '../content';
import { useScrolled } from '../hooks';
import { Mark } from './Pixels';

/** A router link for a path, a plain anchor for a URL on another origin. */
export const SmartLink = ({ to, className, children }: { to: string; className?: string; children: ReactNode }) =>
  to.startsWith('/') ? (
    <Link className={className} to={to}>
      {children}
    </Link>
  ) : (
    <a className={className} href={to}>
      {children}
    </a>
  );

export const TopBar = () => {
  const scrolled = useScrolled();
  return (
    <header className={`pd-topbar${scrolled ? ' is-scrolled' : ''}`}>
      <div className="pd-topbar-inner">
        <a className="pd-brand" href="#top" aria-label="Py Digital, back to top">
          <Mark size={26} />
          <span>Py Digital</span>
        </a>
        <nav className="pd-nav" aria-label="Page">
          <a href="#work">Work</a>
          <a href="#principles">Principles</a>
          <a href="#legal">Legal</a>
        </nav>
        <a className="pd-btn pd-btn--pill" href="#contact">
          Contact
        </a>
      </div>
    </header>
  );
};

export const Footer = () => (
  <footer className="pd-footer">
    <div className="pd-wrap pd-footer-grid">
      <div>
        <p className="pd-brand pd-brand--footer">
          <Mark size={24} />
          <span>Py Digital</span>
        </p>
        <p className="pd-fine">Independent games and apps, built all the way down.</p>
      </div>
      <nav aria-label="Projects">
        <p className="pd-footer-head">Projects</p>
        {SHOWCASE.map(({ app }) => (
          <SmartLink key={app.id} to={appHref(app.id)}>
            {shortName(app)}
          </SmartLink>
        ))}
      </nav>
      <nav aria-label="Studio">
        <p className="pd-footer-head">Studio</p>
        <a href="#principles">How we build</a>
        <a href="#legal">Legal documents</a>
        <a href={`mailto:${STUDIO_EMAIL}`}>Email us</a>
      </nav>
    </div>
    <div className="pd-wrap pd-footer-base">
      <p>&copy; {new Date().getFullYear()} Py Digital. All rights reserved.</p>
      <p>Google Play is a trademark of Google LLC.</p>
    </div>
  </footer>
);

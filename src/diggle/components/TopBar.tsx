import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LINKS } from '../config';
import { DiscordIcon, XIcon } from './Icons';

/**
 * The Diggle top bar. The landing page fills `nav` with in-page anchors and
 * `actions` with the wallet button; the legal pages fill them with doc
 * links and a way back — so the legal pages never load wallet code.
 */
export const TopBar = ({
  brandHref,
  nav,
  navLabel,
  actions,
}: {
  /** `/…` routes through the router; `#…` stays an in-page anchor. */
  brandHref: string;
  nav: ReactNode;
  navLabel: string;
  actions?: ReactNode;
}) => (
  <header className="dg-topbar">
    <div className="dg-topbar-inner">
      {brandHref.startsWith('/') ? (
        <Link className="dg-brand" to={brandHref}>
          Diggle
        </Link>
      ) : (
        <a className="dg-brand" href={brandHref}>
          Diggle
        </a>
      )}
      <nav className="dg-nav" aria-label={navLabel}>
        {nav}
      </nav>
      <div className="dg-topbar-actions">
        <a className="dg-icon-btn" href={LINKS.x} target="_blank" rel="noreferrer" aria-label={`Diggle on X, ${LINKS.xHandle}`}>
          <XIcon />
        </a>
        <a className="dg-icon-btn" href={LINKS.discord} target="_blank" rel="noreferrer" aria-label="Diggle on Discord">
          <DiscordIcon />
        </a>
        {actions}
      </div>
    </div>
  </header>
);

import { Link } from 'react-router-dom';
import { LINKS } from '../config';
import { HUB_HREF, digglePath } from '../site';

export const Footer = () => (
  <footer className="dg-footer">
    <div className="dg-wrap dg-footer-grid">
      <div>
        <p className="dg-brand">Diggle</p>
        <p className="dg-fine">
          A <a href={HUB_HREF}>Py Digital</a> game. Diggle Machines are in-game gear; nothing here is an offer of
          financial return.
        </p>
      </div>
      <nav aria-label="Legal">
        <Link to={digglePath('privacy')}>Privacy</Link>
        <Link to={digglePath('terms')}>Terms</Link>
        <Link to={digglePath('license')}>License</Link>
        <Link to={digglePath('copyright')}>Copyright</Link>
      </nav>
      <nav aria-label="Community">
        <a href={LINKS.x} target="_blank" rel="noreferrer">
          {LINKS.xHandle}
        </a>
        <a href={LINKS.discord} target="_blank" rel="noreferrer">
          Discord
        </a>
        <a href={LINKS.support}>Support</a>
      </nav>
    </div>
    <p className="dg-footer-copy">&copy; {new Date().getFullYear()} Py Digital. All rights reserved.</p>
  </footer>
);

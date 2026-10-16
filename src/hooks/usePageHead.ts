import { useEffect } from 'react';

// The site-wide head from index.html. Pages put these back when they unmount.
const SITE_TITLE = 'Py Digital';
const SITE_ICON = '/vite.svg';

const TYPES: Record<string, string> = {
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  png: 'image/png',
};

const setIcon = (link: HTMLLinkElement, href: string) => {
  const ext = href.split('.').pop()?.toLowerCase() ?? '';
  link.setAttribute('href', href);
  link.setAttribute('type', TYPES[ext] ?? 'image/png');
};

/**
 * Sets the tab icon and title while the calling page is mounted, and resets
 * them to the site defaults when it unmounts. `undefined` leaves that part at
 * the default.
 *
 * Apps with a landing page (Diggle, Vorta) also have a static HTML entry
 * (diggle.html, vorta.html) with the same icon and title, because wallets and
 * link previews read the head as served, before any of this runs. This hook
 * keeps the head right when moving between pages in the app. Resetting to
 * the defaults (not to "whatever was there") matters for that: a visit that
 * lands on diggle.html starts with Diggle's head.
 */
export function usePageHead({ icon, title }: { icon?: string; title?: string }) {
  useEffect(() => {
    if (!icon) return;
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    setIcon(link, icon);
    return () => setIcon(link, SITE_ICON);
  }, [icon]);

  useEffect(() => {
    if (!title) return;
    document.title = title;
    return () => {
      document.title = SITE_TITLE;
    };
  }, [title]);
}

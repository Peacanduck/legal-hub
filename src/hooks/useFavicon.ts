import { useEffect } from 'react';

const TYPES: Record<string, string> = {
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  png: 'image/png',
};

/**
 * Shows `href` as the tab icon while the calling page is mounted, then puts
 * back whatever icon was there before. Each app's pages pass their own icon;
 * `undefined` keeps the site default. Wallets read this icon too: Phantom's
 * connect prompt shows it next to the site's name.
 */
export function useFavicon(href: string | undefined) {
  useEffect(() => {
    if (!href) return;
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;

    const previousHref = link.getAttribute('href');
    const previousType = link.getAttribute('type');
    const ext = href.split('.').pop()?.toLowerCase() ?? '';
    link.setAttribute('href', href);
    link.setAttribute('type', TYPES[ext] ?? 'image/png');

    return () => {
      if (previousHref == null) link.removeAttribute('href');
      else link.setAttribute('href', previousHref);
      if (previousType == null) link.removeAttribute('type');
      else link.setAttribute('type', previousType);
    };
  }, [href]);
}

// Where the Diggle site lives.
//
// In production it has its own host, diggle.pydigital.xyz. Wallets identify a
// dApp by its domain — they verify the game app against that domain's
// /.well-known/assetlinks.json and look up its icon there — so the domain's
// root, favicon and head all have to be Diggle's. Everywhere else (local dev,
// Vercel previews) the site stays under /diggle on the hub, and
// http://diggle.localhost:5173 runs it the production way.

export const DIGGLE_ORIGIN = 'https://diggle.pydigital.xyz';
export const HUB_ORIGIN = 'https://www.pydigital.xyz';

const host = window.location.hostname;

/** Served from the Diggle host: its pages live at the root. */
export const ON_DIGGLE_HOST = host.startsWith('diggle.');

/** Served from the hub's production host, where Diggle pages hand off to DIGGLE_ORIGIN. */
export const ON_HUB_HOST = host === 'www.pydigital.xyz' || host === 'pydigital.xyz';

/** Router path of a Diggle page: '' is the landing page, otherwise a legal document. */
export const digglePath = (page = '') => (ON_DIGGLE_HOST ? `/${page}` : page ? `/diggle/${page}` : '/diggle');

/** The Py Digital hub, from a Diggle page. */
export const HUB_HREF = ON_DIGGLE_HOST ? `${HUB_ORIGIN}/` : '/';

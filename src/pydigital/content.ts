import { apps, type AppData } from '../data/apps';
import { DIGGLE_ORIGIN, ON_HUB_HOST } from '../diggle/site';
import type { GlyphName } from './art';

// Copy and data for the Py Digital home page. Every claim it makes about a
// product is one that product's own page or policy already makes
// (src/vorta/content.ts, src/diggle/content.ts, src/policies/). The studio
// page repeats those claims and never adds to them, so change a number at
// its source first.

/** The address the studio's games publish for support (src/data/apps.ts). */
export const STUDIO_EMAIL = 'fu.developer@gmail.com';

export type DocType = 'privacy' | 'terms' | 'license' | 'copyright';

export const DOCS: { type: DocType; label: string }[] = [
  { type: 'privacy', label: 'Privacy' },
  { type: 'terms', label: 'Terms' },
  { type: 'license', label: 'License' },
  { type: 'copyright', label: 'Copyright' },
];

/** In production Diggle has its own host (src/diggle/site.ts). Linking there
 *  directly saves the hop through the hub's redirect. */
const offsite = (id: string) => id === 'diggle' && ON_HUB_HOST;

/** An app's own page: a router path, or an absolute URL on another origin. */
export const appHref = (id: string) => (offsite(id) ? `${DIGGLE_ORIGIN}/` : `/${id}`);

/** One of an app's legal documents. */
export const docHref = (id: string, doc: DocType) => (offsite(id) ? `${DIGGLE_ORIGIN}/${doc}` : `/${id}/${doc}`);

/** "Vorta: Orbital Arcade" is "Vorta" in a label. */
export const shortName = (app: AppData) => app.name.split(':')[0];

export type Scene = 'vorta' | 'diggle' | 'legitai';

export interface Showcase {
  app: AppData;
  kind: string;
  platform?: string;
  /** The app's tagline, shortened where the card needs it. */
  tagline?: string;
  summary: string;
  stats: { value: string; label: string }[];
  /** A store listing, next to the link to the app's own page. */
  store?: { href: string; label: string };
  /** The window beside the copy. Apps without one show their art. */
  scene?: Scene;
  /** Live scenes run the product's own code; the rest say what they are. */
  live?: boolean;
  caption?: string;
  /** Glow under the window, and the stat figures. */
  accent: string;
}

type Presentation = Omit<Showcase, 'app'>;

const PRESENTATION: Record<string, (app: AppData) => Presentation> = {
  vorta: (app) => ({
    kind: 'Arcade game',
    platform: 'Android · Google Play',
    tagline: app.tagline,
    summary:
      'You orbit a glowing core while rings close in from the dark, each carrying a gap you have to find. Tap anywhere to reverse. A run lasts about thirty seconds. Your best one will haunt you for longer.',
    // src/vorta/content.ts: the control scheme, FAIR_STATS, and the skins.
    stats: [
      { value: '1', label: 'input: tap to reverse' },
      { value: '120 Hz', label: 'fixed-step physics' },
      { value: '7', label: 'skins that repaint it all' },
    ],
    store: app.link?.startsWith('http') ? { href: app.link, label: 'Google Play' } : undefined,
    scene: 'vorta',
    live: true,
    caption: 'The game’s rules, on autopilot',
    accent: '#4de8ff',
  }),
  diggle: () => ({
    kind: 'Mining game',
    platform: 'Solana Mobile · dApp Store',
    tagline: 'Mine deep. Sell high. Upgrade.',
    summary:
      'Pilot a drill down through four hostile strata, haul ore back to the surface, and rebuild your rig from gear you own. Diggle Machine NFTs equip as in-game gear.',
    // The Diggle hero's facts (src/diggle/DigglePage.tsx).
    stats: [
      { value: '4', label: 'strata, topsoil to magma' },
      { value: '8', label: 'ores, coal to diamond' },
      { value: '7', label: 'languages' },
    ],
    // Its store link is a dApp Store deep link that only opens on a Seeker
    // or Saga, so it stays on the Diggle page, which explains that.
    scene: 'diggle',
    live: true,
    caption: 'Sprites from the game’s sheets',
    accent: '#f5b841',
  }),
  legitai: (app) => ({
    kind: 'Scam detection app',
    platform: 'Android',
    tagline: app.tagline,
    summary:
      'LegitAi reads a text conversation for the warning signs of fraud and gives you a risk assessment, to help you spot a scam or a phishing attempt before you reply.',
    // src/data/apps.ts features, and the privacy policy's ephemeral processing.
    stats: [
      { value: 'Read', label: 'a conversation for fraud indicators' },
      { value: 'Score', label: 'how likely it is to be a scam' },
      { value: 'Discard', label: 'the text once it is checked' },
    ],
    scene: 'legitai',
    live: false,
    caption: 'An illustration of a risk check',
    accent: '#6ee7b7',
  }),
};

// What's out comes first.
const ORDER = ['vorta', 'diggle', 'legitai'];
const rank = (id: string) => (ORDER.includes(id) ? ORDER.indexOf(id) : ORDER.length);

const plain = (app: AppData): Presentation => ({
  kind: app.type === 'game' ? 'Game' : 'App',
  tagline: app.tagline,
  summary: app.description ?? '',
  stats: [],
  accent: '#ff6a2b',
});

/** Every app in src/data/apps.ts, so a new one appears here without a code
 *  change, with its art in the window until it gets a scene of its own. */
export const SHOWCASE: Showcase[] = [...apps]
  .sort((a, b) => rank(a.id) - rank(b.id))
  .map((app) => ({ app, ...(PRESENTATION[app.id] ?? plain)(app) }));

export const accentOf = (id: string) => SHOWCASE.find((s) => s.app.id === id)?.accent ?? '#ff6a2b';

export interface Receipt {
  app: string;
  text: string;
}

export interface Principle {
  title: string;
  body: string;
  glyph: GlyphName;
  receipts: Receipt[];
}

export const PRINCIPLES: Principle[] = [
  {
    title: 'One idea, all the way down.',
    body: 'Each project starts from one idea and is built out from there, so there is never more to learn than the idea needs.',
    glyph: 'one',
    receipts: [
      { app: 'vorta', text: 'One tap reverses your orbit. That is the entire control scheme.' },
      { app: 'diggle', text: 'Every descent is the same argument: fuel, hull, cargo. Pick two.' },
    ],
  },
  {
    title: 'Fair by construction.',
    body: 'We would rather prove a game is fair than ask you to trust that it is. If you lose, it should be because of something you did.',
    glyph: 'fair',
    receipts: [
      {
        app: 'vorta',
        text: 'Before a ring appears, the game checks that you can reach its gap. An autopilot plays the whole difficulty curve on every build.',
      },
      { app: 'diggle', text: 'The weekly challenge runs on a standardized loadout, so nobody buys a leaderboard.' },
    ],
  },
  {
    title: 'Only what a feature needs.',
    body: 'Data is a cost we try not to pass on. When something does leave your device, the policy says what, where and why.',
    glyph: 'less',
    receipts: [
      { app: 'vorta', text: 'No account with us. Your progress lives on your device.' },
      { app: 'legitai', text: 'Text you check is analysed, then discarded. It is never stored on our servers.' },
      { app: 'diggle', text: 'No ads, and no analytics or tracking SDKs.' },
    ],
  },
];

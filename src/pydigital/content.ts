import { apps, type AppData } from '../data/apps';
import { DIGGLE_ORIGIN, ON_HUB_HOST } from '../diggle/site';
import type { GlyphName } from './art';

// Copy and data for the Py Digital home page. Every claim it makes about a
// product is one that product's own page, site or policy already makes
// (src/vorta/content.ts, src/diggle/content.ts, src/policies/, and
// solignition.xyz for Solignition). The studio page repeats those claims and
// never adds to them, so change a number at its source first. The earlier
// business systems, LiteScan and PestControl, are described from their own
// source code (2015–17), and their clients stay unnamed.

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
const appHref = (id: string) => (offsite(id) ? `${DIGGLE_ORIGIN}/` : `/${id}`);

/** One of an app's legal documents. */
export const docHref = (id: string, doc: DocType) => (offsite(id) ? `${DIGGLE_ORIGIN}/${doc}` : `/${id}/${doc}`);

/** "Vorta: Orbital Arcade" is "Vorta" in a label. */
export const shortName = (name: string) => name.split(':')[0];

export type Scene = 'vorta' | 'diggle' | 'solignition' | 'legitai';

export interface Link {
  href: string;
  label: string;
}

/** Anything on the studio page: an app from src/data/apps.ts, whose legal
 *  documents this site hosts, or a project with a site of its own. */
export interface Project {
  id: string;
  name: string;
  kind: string;
  platform?: string;
  /** Where it stands, when that is not simply "out". */
  status?: string;
  tagline?: string;
  summary: string;
  stats: { value: string; label: string }[];
  /** Its own page: a router path, or an absolute URL. */
  href: string;
  /** Store listings, docs: beside the link to its page, in a new tab. */
  links: Link[];
  socials: Link[];
  /** The window beside the copy. A project without one shows its art. */
  scene?: Scene;
  /** Live scenes run the product's own code; the rest say what they are. */
  live?: boolean;
  caption?: string;
  art?: { banner?: string; logo?: string };
  /** Glow under the window, and the stat figures. */
  accent: string;
}

type Presentation = Omit<Project, 'id' | 'name' | 'href' | 'socials'> & { socials?: Link[] };

const socialsOf = (app: AppData): Link[] => [
  ...(app.socials?.x ? [{ href: app.socials.x, label: `${shortName(app.name)} on X` }] : []),
  ...(app.socials?.discord ? [{ href: app.socials.discord, label: `${shortName(app.name)} on Discord` }] : []),
];

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
    links: app.link?.startsWith('http') ? [{ href: app.link, label: 'Google Play' }] : [],
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
    links: [],
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
    links: [],
    scene: 'legitai',
    live: false,
    caption: 'An illustration of a risk check',
    accent: '#6ee7b7',
  }),
};

const plain = (app: AppData): Presentation => ({
  kind: app.type === 'game' ? 'Game' : 'App',
  tagline: app.tagline,
  summary: app.description ?? '',
  stats: [],
  links: [],
  art: { banner: app.banner, logo: app.logo },
  accent: '#ff6a2b',
});

const fromApp = (app: AppData): Project => {
  const p = (PRESENTATION[app.id] ?? plain)(app);
  return { id: app.id, name: app.name, href: appHref(app.id), ...p, socials: p.socials ?? socialsOf(app) };
};

/** Solignition lives at solignition.xyz with its own terms, so it is not an
 *  app this site hosts documents for. Its copy is from its own site and docs
 *  links; its status is the one the site shows ("LIVE · DEVNET · v0.4.2"). */
const SOLIGNITION: Project = {
  id: 'solignition',
  name: 'Solignition',
  kind: 'DeFi lending protocol',
  platform: 'Solana',
  status: 'Live on devnet',
  tagline: 'Deploy Solana programs without upfront capital.',
  summary:
    'Solignition lends builders the rent and fees it takes to deploy a program on Solana. A protocol-owned PDA holds the upgrade authority for the term of the loan, and repaying moves it to your wallet in the same transaction. Lenders deposit SOL and earn from loan interest. It is on devnet today, with a formal audit scheduled before mainnet.',
  stats: [
    { value: '2–6 SOL', label: 'a deploy’s upfront cost, lent' },
    { value: '24 h', label: 'grace after a loan expires' },
    { value: 'v0.4.2', label: 'live on devnet' },
  ],
  href: 'https://www.solignition.xyz/',
  links: [{ href: 'https://docs.solignition.xyz', label: 'Docs' }],
  socials: [{ href: 'https://x.com/Solignition', label: 'Solignition on X' }],
  scene: 'solignition',
  live: false,
  caption: 'An illustration of a loan',
  accent: '#56d57b',
};

// What's out comes first, games and the rest taking turns.
const ORDER = ['vorta', 'solignition', 'diggle', 'legitai'];
const rank = (id: string) => (ORDER.includes(id) ? ORDER.indexOf(id) : ORDER.length);
const byOrder = <T extends { id: string }>(a: T, b: T) => rank(a.id) - rank(b.id);

/** Every project, including every app in src/data/apps.ts, so a new app
 *  appears without a code change, its art in the window until it gets a
 *  scene of its own. */
export const SHOWCASE: Project[] = [...apps.map(fromApp), SOLIGNITION].sort(byOrder);

/** The apps whose legal documents this site hosts. */
export const LEGAL_APPS: AppData[] = [...apps].sort(byOrder);

export const projectById = (id: string) => SHOWCASE.find((p) => p.id === id);

/** The page's own anchor for a project: its row in the work section, or its
 *  card in the earlier work. */
export const projectAnchor = (id: string) => `#project-${id}`;

/** Business systems built before the studio's own products. They have no
 *  page or store listing, so they get a card each and no window. */
export interface EarlierProject {
  id: string;
  name: string;
  years: string;
  kind: string;
  summary: string;
  stack: string[];
}

export const EARLIER: EarlierProject[] = [
  {
    id: 'litescan',
    name: 'LiteScan',
    years: '2015–16',
    kind: 'Point of sale and stock',
    summary:
      'A barcode point-of-sale and stock system: sales with a running total, stock takes by scanning, item photos, agent accounts and reports.',
    stack: ['Java desktop', 'MySQL'],
  },
  {
    id: 'pestcontrol',
    name: 'PestControl',
    years: '2016–17',
    kind: 'Field data capture',
    summary:
      'Bait-station audits for a pest-control company. Technicians scan each device on an Android app that works offline; a desktop app manages clients, chemicals and reports.',
    stack: ['Android', 'Java desktop', 'MySQL', 'Apache + PHP'],
  },
];

/** Earlier work has no brand colour of its own: a warm stone, like the page. */
const EARLIER_ACCENT = '#cdbba6';

export interface Chip {
  name: string;
  accent: string;
  href: string;
}

/** A chip that scrolls to a project, wherever on the page it is. */
export const chipFor = (id: string): Chip | null => {
  const project = projectById(id);
  if (project) return { name: shortName(project.name), accent: project.accent, href: projectAnchor(id) };
  const earlier = EARLIER.find((p) => p.id === id);
  return earlier ? { name: earlier.name, accent: EARLIER_ACCENT, href: projectAnchor(id) } : null;
};

export const accentOf = (id: string) => chipFor(id)?.accent ?? '#ff6a2b';

export interface Practice {
  title: string;
  body: string;
  glyph: GlyphName;
  /** Projects that show the practice, by id. */
  projects: string[];
  /** A static tag after the chips. */
  since?: string;
}

export const PRACTICES: Practice[] = [
  {
    title: 'Business systems',
    body: 'Point of sale, stock control and field data capture: barcode-driven apps on Android and desktop, over a MySQL database.',
    glyph: 'scan',
    projects: ['litescan', 'pestcontrol'],
    since: 'Since 2015',
  },
  {
    title: 'Games and apps',
    body: 'Mobile games built around one idea, and apps that do one job well, from an orbital arcade game to an AI scam checker.',
    glyph: 'play',
    projects: ['vorta', 'diggle', 'legitai'],
  },
  {
    title: 'Smart contracts and DeFi',
    body: 'Solana programs and the clients that talk to them: a lending protocol that holds no keys, NFT mints, and wallet flows that hold up on a phone.',
    glyph: 'ring',
    projects: ['solignition', 'diggle'],
  },
];

/** "How we build": a promise, and the projects that keep it. */
export interface StudioPromise {
  title: string;
  line: string;
  glyph: GlyphName;
  projects: string[];
}

export const PROMISES: StudioPromise[] = [
  {
    title: 'Works where it’s used.',
    line: 'In a field with no signal, on a plane, at a shop counter.',
    glyph: 'pin',
    // PestControl captures offline, Vorta plays offline (src/vorta/content.ts),
    // and LiteScan runs on a local database.
    projects: ['pestcontrol', 'vorta', 'litescan'],
  },
  {
    title: 'Fair by construction.',
    line: 'The rules are in the code, where anyone can check them.',
    glyph: 'fair',
    // Vorta checks every gap can be reached, Diggle's weekly challenge runs on
    // a standard loadout, and Solignition's loan terms are on-chain.
    projects: ['vorta', 'diggle', 'solignition'],
  },
  {
    title: 'Only what it needs.',
    line: 'No spare data, keys or permissions.',
    glyph: 'less',
    // Vorta needs no account, LegitAi discards the text it checks, and
    // Solignition holds no keys.
    projects: ['vorta', 'legitai', 'solignition'],
  },
];

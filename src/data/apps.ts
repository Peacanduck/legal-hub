export interface AppData {
  id: string; // Used in URL (e.g., /legitai)
  name: string;
  type?: 'game' | 'app';
  tagline?: string;       // Short description for the home page cards
  description?: string;   // Long description for the app's landing page
  features?: string[];    // Bullet points for the landing page
  link?: string;          // Link to App Store/Play Store/Web
  banner?: string;        // Hero image for the landing page
  logo?: string;          // Square logo/icon for the project
  socials?: {             // Social media community links
    discord?: string;
    x?: string;
  };
  developerName: string;
  contactEmail: string;
  lastUpdated: string;
}

export const apps: AppData[] = [
  {
    id: 'legitai',
    name: 'LegitAi',
    type: 'app',
    tagline: 'AI-powered scam detection.',
    description: 'LegitAi analyzes text conversations to identify potential fraud indicators, providing risk assessments to help users protect themselves from scams and phishing attempts.',
    features: [
      'conversation analysis', 
      'Scam probability scoring', 
      'Ephemeral processing (No data stored on servers)'
    ],
    link: '#', // Add your actual store link here
    socials: {
      x: '' // Example
    },
    developerName: 'PeacanDuck',
    contactEmail: 'support.LegitAi@proton.me',
    lastUpdated: 'Febuary 1, 2026'
  },
  {
    id: 'diggle',
    name: 'Diggle',
    type: 'game',
    tagline: 'Mine deep. Sell high. Upgrade. A pixel-art mining game for Solana Mobile.',
    // /diggle renders its own page (src/diggle/); these fields feed the
    // Py Digital home card and the legal pages.
    description: 'Pilot a drill down through four hostile strata, haul ore back to the surface, and rebuild your rig from gear you own. Free on the Solana dApp Store.',
    features: [
      'Four strata, eight ores, six upgrade tracks',
      'Diggle Machine NFTs equip as in-game gear',
      'Available in seven languages'
    ],
    link: 'solanadappstore://details?id=com.example.diggle',
    // Reference the images placed in your public/ directory
    banner: '/DiggleBannerLong.png',
    logo: '/diggle/collection.png',
    socials: {
      discord: 'https://discord.gg/QH4uUfK2wR',
      x: 'https://x.com/DiggleOnSol'
    },
    developerName: 'PeacanDuck',
    contactEmail: 'support.diggle@proton.me',
    lastUpdated: 'Febuary 3, 2026'
  },
  {
    id: 'vorta',
    name: 'Vorta: Orbital Arcade',
    type: 'game',
    tagline: 'One tap to reverse. Thread the closing rings.',
    description: 'Vorta is a one-thumb arcade game about threading impossible gaps. You orbit a glowing core while rings close in from the dark, each carrying a gap you have to find. Tap anywhere to reverse your direction — that is the entire control scheme. Motes drifting between the rings build a combo multiplier that decays in three and a half seconds, so playing it safe bleeds your score away and chasing every mote gets you killed. A run lasts about thirty seconds. Your best one will haunt you for longer.',
    features: [
      'One-tap controls — the entire game is a single input',
      'A combo system that rewards nerve over caution',
      'Unlockable skins that recolour the whole playfield',
      'Offline play, no account required',
      'Fair by construction — every ring is verified reachable',
      'Optional Remove Ads upgrade'
    ],
    link: '#', // Play Store link — swap in once the listing is live
    banner: '/VortaFeature1024x500.png',
    logo: '/VortaIcon1024.png',
    socials: {
      discord: '',
      x: ''
    },
    developerName: 'Py Digital',
    contactEmail: 'fu.developer@gmail.com',
    lastUpdated: 'September 1, 2026'
  }
];

export const getAppById = (id: string | undefined) => apps.find((app) => app.id === id);
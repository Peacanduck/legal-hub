export interface AppData {
  id: string; // Used in URL (e.g., /legitai)
  name: string;
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
    tagline: 'A casual mobile game.',
    description: 'Diggle is an casual game designed for engaging play sessions on your mobile device. Upgrade your mining rig by mining ores and selling them for gold ',
    features: [
      'in game store', 
      'Unlockable characters & skins tba', 
      'Global leaderboards in progress'
    ],
    link: '#', // Add your actual store link here
    // Reference the images placed in your public/ directory
    banner: '/DiggleBannerLong.png', 
    logo: '/DiggleBanner1200x1200.png', 
    socials: {
      discord: '',
      x: ''
    },
    developerName: 'PeacanDuck',
    contactEmail: 'support.diggle@proton.me',
    lastUpdated: 'Febuary 3, 2026'
  }
];

export const getAppById = (id: string | undefined) => apps.find((app) => app.id === id);
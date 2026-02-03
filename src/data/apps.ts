export interface AppData {
  id: string; // Used in URL (e.g., /legitai)
  name: string;
  developerName: string;
  contactEmail: string;
  lastUpdated: string;
}

export const apps: AppData[] = [
  {
    id: 'legitai',
    name: 'LegitAi',
    developerName: 'PeacanDuck',
    contactEmail: 'support.LegitAi@proton.me',
    lastUpdated: 'Febuary 1, 2026'
  },
  {
    id: 'diggle',
    name: 'Diggle',
    developerName: 'PeacanDuck',
    contactEmail: 'support.diggle@proton.me',
    lastUpdated: 'Febuary 3, 2026'
  }
];

export const getAppById = (id: string | undefined) => apps.find((app) => app.id === id);
# Legal Hub

A central, scalable React application to host Privacy Policies and Terms & Conditions for multiple mobile applications. Built with **Vite**, **TypeScript**, and **React Router**.

## 🚀 Features

* **Centralized Hub:** Manage legal docs for all your apps in one place.
* **Registry Pattern:** Easily switch between generic templates and custom legal text per app.
* **Scalable:** Adding a new app takes 30 seconds.
* **Zero Backend:** Fully static, deployable to Vercel, Netlify, or GitHub Pages.
* **Mobile Responsive:** Clean, readable layout for mobile and desktop users.

## 🛠 Tech Stack

* React 18
* TypeScript
* Vite
* React Router v6

# Project Structure
 src/
 ├── components/       # Reusable UI (Layout, AppCard)
 ├── data/            
 │   └── apps.ts       # Main config file for App metadata
 ├── pages/            # Routing pages (Home, LegalDoc)
 ├── policies/         # The Legal Content Engine
 │   ├── DefaultPolicies.tsx  # Fallback text
 │   ├── LegitAiPolicies.tsx  # Custom text for LegitAi
 │   └── registry.ts          # Maps App IDs to Policy Files
 └── App.tsx           # Router setup

# How to Add a New App
1. Add App Data
 Open src/data/apps.ts and add a new object to the apps array:
```TypeScript
 {
   id: 'new-app',           // Used in URL (e.g., /new-app)
   name: 'New App Name',
   developerName: 'Your Name',
   contactEmail: 'support@newapp.com',
   lastUpdated: 'February 2026'
 }
```
2. (Optional) Create Custom Policies
 If the app needs specific legal text (different from the default):

 Create a file: src/policies/NewAppPolicies.tsx.

 Copy the structure from LegitAiPolicies.tsx.

 Export NewAppPrivacy and NewAppTerms.

3. Register the Policies
 Open src/policies/registry.ts and import your new components:
```TypeScript
 import { NewAppPrivacy, NewAppTerms } from './NewAppPolicies';

 const registry = {
   // ... existing apps
   'new-app': {
     privacy: NewAppPrivacy,
     terms: NewAppTerms
   }
 };
``` 
 Note: If you skip steps 2 & 3, the app will automatically use the Default generic policies found in src/policies/DefaultPolicies.tsx

### 1. Install Dependencies
```bash
npm install
```
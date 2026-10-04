import React from 'react';
import { DefaultPrivacy, DefaultTerms, DefaultLicense, DefaultCopyright } from './DefaultPolicies';
import { LegitAiPrivacy, LegitAiTerms } from './LegitAiPolicies';
import { DigglePrivacy, DiggleTerms, DiggleLicense, DiggleCopyright } from './DigglePolicies';
import { VortaPrivacy, VortaTerms, VortaLicense, VortaCopyright } from './VortaPolicies';

type PolicyComponent = React.FC<{ appName: string; email: string }>;

interface PolicyRegistryItem {
  privacy?: PolicyComponent;
  terms?: PolicyComponent;
  license?: PolicyComponent;     // NEW
  copyright?: PolicyComponent;   // NEW
}

const registry: Record<string, PolicyRegistryItem> = {
  'legitai': {
    privacy: LegitAiPrivacy,
    terms: LegitAiTerms
  },
  'diggle': {
    // /diggle/* renders these with the Diggle theme (src/diggle/legal/);
    // the text itself lives in diggleDocuments.tsx.
    privacy: DigglePrivacy,
    terms: DiggleTerms,
    license: DiggleLicense,
    copyright: DiggleCopyright
  },
  'vorta': {
    privacy: VortaPrivacy,
    terms: VortaTerms,
    license: VortaLicense,
    copyright: VortaCopyright
  }
};

export const getPolicyComponent = (appId: string, type: 'privacy' | 'terms' | 'license' | 'copyright'): PolicyComponent => {
  const customPolicies = registry[appId];
  
  if (customPolicies && customPolicies[type]) {
    return customPolicies[type]!;
  }

  // Fallback Logic
  switch (type) {
    case 'privacy': return DefaultPrivacy;
    case 'terms': return DefaultTerms;
    case 'license': return DefaultLicense;
    case 'copyright': return DefaultCopyright;
    default: return DefaultPrivacy;
  }
};
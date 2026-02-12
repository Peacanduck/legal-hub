import React from 'react';
import { DefaultPrivacy, DefaultTerms, DefaultLicense, DefaultCopyright } from './DefaultPolicies';
import { LegitAiPrivacy, LegitAiTerms } from './LegitAiPolicies';
import { DigglePrivacy, DiggleLicense, DiggleCopyright } from './DigglePolicies';

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
    privacy: DigglePrivacy,
    // Diggle uses standard terms (optional, or create DiggleTerms if needed)
    license: DiggleLicense,     // Maps to specific file
    copyright: DiggleCopyright  // Maps to specific file
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
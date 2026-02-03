import React from 'react';
import { DefaultPrivacy, DefaultTerms } from './DefaultPolicies';
import { LegitAiPrivacy, LegitAiTerms } from './LegitAiPolicies';

// Define the type for our component mapping
type PolicyComponent = React.FC<{ appName: string; email: string }>;

interface PolicyRegistryItem {
  privacy?: PolicyComponent;
  terms?: PolicyComponent;
}

// THE CONFIGURATION OBJECT
// Map the 'id' from apps.ts to specific components here.
const registry: Record<string, PolicyRegistryItem> = {
  'legitai': {
    privacy: LegitAiPrivacy,
    terms: LegitAiTerms
  },
  // 'diggle': {} // Empty implies it will use defaults
};

export const getPolicyComponent = (appId: string, type: 'privacy' | 'terms'): PolicyComponent => {
  const customPolicies = registry[appId];
  
  if (customPolicies && customPolicies[type]) {
    return customPolicies[type]!;
  }

  // Fallback to defaults
  return type === 'privacy' ? DefaultPrivacy : DefaultTerms;
};
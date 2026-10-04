import type { ReactNode } from 'react';

// Types and constants for Diggle's legal documents. The documents
// themselves are in diggleDocuments.tsx; this half has no JSX, so both the
// themed pages and the registry components can import it freely.

export type DiggleDocType = 'privacy' | 'terms' | 'license' | 'copyright';

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

export interface LegalDocument {
  title: string;
  /** Short label for tabs and the pager. */
  tab: string;
  lede: ReactNode;
  summary?: ReactNode[];
  sections: LegalSection[];
}

export const DIGGLE_LEGAL = {
  company: 'Py Digital',
  email: 'fu.developer@gmail.com',
  packageId: 'com.example.diggle',
  governingLaw: 'South Africa',
  // Both dates move together on a material change, which the "Changes"
  // section of each document promises. Keep src/data/apps.ts in step.
  effectiveDate: '4 October 2026',
  lastUpdated: '4 October 2026',
} as const;

export const DOC_ORDER: readonly DiggleDocType[] = ['privacy', 'terms', 'license', 'copyright'];

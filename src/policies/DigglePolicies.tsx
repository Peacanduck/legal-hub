import React, { lazy, Suspense } from 'react';
import type { DiggleDocType } from './diggleLegal';

interface PolicyProps {
  appName: string;
  email: string;
}

// The text lives in diggleDocuments.tsx, and /diggle/* renders it with the
// Diggle theme (src/diggle/legal/DiggleLegalPage.tsx). These wrappers keep the
// shared registry able to resolve Diggle's documents, and load the text on
// demand so it stays out of the bundle every Py Digital page downloads.
const DiggleLegalBody = lazy(() => import('./DiggleLegalBody'));

const Body = ({ type }: { type: DiggleDocType }) => (
  <Suspense fallback={null}>
    <DiggleLegalBody type={type} />
  </Suspense>
);

export const DigglePrivacy: React.FC<PolicyProps> = () => <Body type="privacy" />;
export const DiggleTerms: React.FC<PolicyProps> = () => <Body type="terms" />;
export const DiggleLicense: React.FC<PolicyProps> = () => <Body type="license" />;
export const DiggleCopyright: React.FC<PolicyProps> = () => <Body type="copyright" />;

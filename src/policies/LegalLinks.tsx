import type { ReactNode } from 'react';

// Link helpers for the Diggle legal documents. Kept apart from the document
// data so that file exports only data and Fast Refresh stays happy.

export const MailLink = ({ email }: { email: string }) => <a href={`mailto:${email}`}>{email}</a>;

export const ExternalLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer">
    {children}
  </a>
);

import React from 'react';

// Props allow us to inject the correct name/email even into the generic template
interface PolicyProps {
  appName: string;
  email: string;
}

export const DefaultPrivacy: React.FC<PolicyProps> = ({ appName, email }) => (
  <>
    <p><strong>(Generic Policy)</strong> This privacy policy applies to the <strong>{appName}</strong> app.</p>
    <h3>Information Collection</h3>
    <p>We do not collect any personal data with this application.</p>
    <h3>Contact</h3>
    <p>Contact: {email}</p>
  </>
);

export const DefaultTerms: React.FC<PolicyProps> = ({ appName }) => (
  <>
    <p><strong>(Generic Terms)</strong> By using <strong>{appName}</strong>, you agree to these standard terms.</p>
    <h3>Usage</h3>
    <p>Use this app responsibly.</p>
  </>
);
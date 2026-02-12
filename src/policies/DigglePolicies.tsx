import React from 'react';

interface PolicyProps {
  appName: string;
  email: string;
}

const ASSET_ARTIST = "Independent Developer";
const COMPANY_NAME = "Independent Developer"; // Update this
const YEAR = new Date().getFullYear();

// --- 1. PRIVACY POLICY ---
export const DigglePrivacy: React.FC<PolicyProps> = ({ appName, email }) => (
  <>
    <p><strong>Last Updated:</strong> February 2026</p>
    <p>
      This Privacy Policy explains how <strong>{appName}</strong> collects, uses, and discloses information 
      about you. By using the App, you consent to the processing of your information as described in this policy.
    </p>

    <h3>1. Data Collection</h3>
    <p>
      We collect minimal data necessary for the app's functionality. This may include device type and 
      crash logs to help us improve stability. We do not sell your personal data.
    </p>

    <h3>2. Contact</h3>
    <p>For privacy questions, contact: <a href={`mailto:${email}`}>{email}</a></p>
  </>
);

// --- 2. LICENSE (EULA / Compliance) ---
export const DiggleLicense: React.FC<PolicyProps> = ({ appName }) => (
  <>
    <h3>End User License Agreement (EULA)</h3>
    <p>
      This License Agreement is a legal agreement between you and <strong>{COMPANY_NAME}</strong> regarding your use of the 
      <strong>{appName}</strong> mobile application.
    </p>

    <h4>1. Grant of License</h4>
    <p>
      We grant you a revocable, non-exclusive, non-transferable, limited license to download, install, 
      and use the App solely for your personal, non-commercial purposes strictly in accordance with the terms of this Agreement.
    </p>

    <h4>2. Restrictions</h4>
    <p>You agree not to, and you will not permit others to:</p>
    <ul>
      <li>License, sell, rent, lease, assign, distribute, transmit, host, outsource, disclose, or otherwise commercially exploit the App.</li>
      <li>Modify, make derivative works of, disassemble, decrypt, reverse compile, or reverse engineer any part of the App.</li>
    </ul>

    <h4>3. Termination</h4>
    <p>
      This Agreement is effective until terminated by you or us. Your rights under this Agreement will terminate automatically 
      without notice if you fail to comply with any of its terms.
    </p>

    <h3>Permissions & Grants</h3>
    
    <p>
      <strong>{COMPANY_NAME}</strong> grants the App Store (Solana dApp Store) the right to display 
      all submitted media (screenshots, video, icons) for showcasing this application.
    </p>
  </>
);

// --- 3. COPYRIGHT (Ownership) ---
export const DiggleCopyright: React.FC<PolicyProps> = ({ appName }) => (
  <>
    <h3>Copyright Notice</h3>
    <p>
      <strong>Copyright &copy; {YEAR} {COMPANY_NAME}. All rights reserved.</strong>
    </p>
    
    <h4>Ownership</h4>
    <p>
      The <strong>{appName}</strong> application, including all content, features, and functionality (including but not limited to 
      all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) 
      are owned by {COMPANY_NAME}, its licensors, or other providers of such material.
    </p>

    <h3>Character Assets</h3>
    <p>
      Character design and animation frames by <strong>{ASSET_ARTIST}</strong>.<br />
      Assets used with permission for this project.
    </p>

    <h3>Submission Media</h3>
    <p>
      All screenshots, demo video, and app icons created by {COMPANY_NAME}.
    </p>
    <ul>
      <li>Screenshots - captured from actual app by developer</li>
      <li>Demo video - recorded by developer showing app functionality</li>
      <li>App icons and banner - created by developer for this application</li>
    </ul>
    <p>
      No NFT ownership required to use this app.
    </p>
    <p>
      <strong>&copy; {YEAR} {COMPANY_NAME} - All submission media rights reserved.</strong>
    </p>

  </>
);
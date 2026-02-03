import React from 'react';

interface PolicyProps {
  appName: string;
  email: string;
}

const COMPANY_NAME = "Independent Developer"; 
const LAST_UPDATED = "February 2026";

export const LegitAiPrivacy: React.FC<PolicyProps> = ({ appName, email }) => {
  // CONFIGURATION: Update this to your Name or Company Name 

  return (
    <>
      <p><strong>Last Updated:</strong> {LAST_UPDATED}</p>

      <h3>1. Introduction</h3>
      <p>
        <strong>{COMPANY_NAME}</strong> ("we," "our," or "us") operates the <strong>{appName}</strong> mobile application (the "App"). 
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our App.
      </p>
      <p>
        By using {appName}, you agree to the collection and use of information in accordance with this Privacy Policy. 
        If you do not agree with the terms of this Privacy Policy, please do not access or use the App.
      </p>

      <h3>2. Information We Collect</h3>
      
      <h4>2.1 Information You Provide</h4>
      <ul>
        <li>
          <strong>Conversation Text for Analysis:</strong> When you use our scam detection feature, you may paste or enter conversation text for analysis. 
          This text is processed to provide you with a risk assessment but is <strong>not stored on our servers</strong>. 
          Analysis is performed ephemerally, meaning the conversation text is processed and immediately discarded after generating your results.
        </li>
        <li>
          <strong>User Preferences:</strong> We collect and store your preferences <strong>locally on your device</strong>, 
          including your display name, notification preferences, and app settings. This information never leaves your device.
        </li>
      </ul>

      <h4>2.2 Information Collected Automatically</h4>
      <ul>
        <li>
          <strong>Subscription Information:</strong> If you purchase a subscription, Google Play handles all payment processing. 
          We receive confirmation of your subscription status but do not have access to your payment details such as credit card numbers.
        </li>
      </ul>

      <h3>3. How We Use Your Information</h3>
      <p>We use the information we collect for the following purposes:</p>
      <ul>
        <li>To provide scam detection and risk assessment services</li>
        <li>To process and manage your subscription</li>
        <li>To personalize your experience within the App</li>
        <li>To improve and optimize the App</li>
      </ul>

      <h3>4. Third-Party Services</h3>
      
      <h4>4.1 OpenAI</h4>
      <p>
        Our App uses OpenAI's API to analyze conversation text for potential scam indicators. When you submit text for analysis, it is sent to OpenAI's servers for processing. 
        OpenAI processes this data in accordance with their privacy policy and data usage policies. We do not store the conversation text before, during, or after this analysis. 
        For more information about how OpenAI handles data, please visit: <a href="https://openai.com/privacy" target="_blank" rel="noreferrer">https://openai.com/privacy</a>
      </p>

      <h4>4.2 Google Play Billing</h4>
      <p>
        We use Google Play Billing for subscription management. Google processes all payment information. We only receive confirmation of subscription status and do not have access to your financial information. 
        Google's privacy policy governs the collection and use of your payment information: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">https://policies.google.com/privacy</a>
      </p>

      <h3>5. Data Storage and Security</h3>
      <ul>
        <li><strong>Local Storage Only:</strong> All user preferences and settings are stored locally on your device using Android's DataStore. This data is not transmitted to or stored on our servers.</li>
        <li><strong>Ephemeral Processing:</strong> Conversation text submitted for analysis is processed in real-time and is not persisted. Once your analysis results are generated, the original text is discarded.</li>
        <li><strong>Security Measures:</strong> We implement appropriate technical measures to protect the information processed through our App, including secure HTTPS connections for all API communications.</li>
      </ul>

      <h3>6. Data Retention</h3>
      <p>
        Since we do not store conversation data on our servers, there is no server-side retention of your analyzed content. 
        Local preferences remain on your device until you uninstall the App or clear its data. Subscription status information is managed by Google Play and retained according to their policies.
      </p>

      <h3>7. Your Rights and Choices</h3>
      <p>You have the following rights regarding your information:</p>
      <ul>
        <li><strong>Access and Control:</strong> You can access and modify your preferences directly within the App's settings.</li>
        <li><strong>Data Deletion:</strong> You can delete all locally stored data by uninstalling the App or clearing its data through your device settings.</li>
        <li><strong>Subscription Management:</strong> You can manage or cancel your subscription through the Google Play Store.</li>
      </ul>

      <h3>8. Children's Privacy</h3>
      <p>
        Our App is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. 
        If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can take appropriate action.
      </p>

      <h3>9. Changes to This Privacy Policy</h3>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy within the App and updating the "Last Updated" date. 
        You are advised to review this Privacy Policy periodically for any changes. Changes are effective when posted.
      </p>

      <h3>10. Contact Us</h3>
      <p>
        If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
      </p>
      <p>
        <strong>{COMPANY_NAME}</strong><br />
        Email: <a href={`mailto:${email}`}>{email}</a>
      </p>

      <h3>11. Consent</h3>
      <p>By using the {appName} App, you consent to the processing of your information as described in this Privacy Policy.</p>
    </>
  );
};

// Placeholder Terms for LegitAi (required to keep registry.ts happy)
export const LegitAiTerms: React.FC<PolicyProps> = ({ appName, email }) => (
 <>
    <h1>Terms and Conditions</h1>
    <p><em>Last Updated: {LAST_UPDATED}</em></p>

    <h2>1. Acceptance of Terms</h2>
    <p>
      Welcome to <strong>{appName}</strong>. By downloading, installing, accessing, or using the {appName} mobile application (the "App"), 
      you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use the App.
    </p>
    <p>
      These Terms constitute a legally binding agreement between you ("User," "you," or "your") and {COMPANY_NAME} ("Company," "we," "us," or "our").
    </p>

    <h2>2. Description of Service</h2>
    <p>
      <strong>{appName}</strong> is an AI-powered scam detection application that analyzes text conversations to identify potential fraud indicators. 
      The App provides risk assessments, red flag identification, and recommended actions to help users protect themselves from scams.
    </p>
    <p>
      <strong>Important Disclaimer:</strong> The App provides AI-assisted analysis only. Results are not guaranteed to be accurate and should not 
      be relied upon as the sole basis for any decision. Always verify information independently and exercise your own judgment.
    </p>

    <h2>3. Eligibility</h2>
    <p>
      You must be at least 13 years of age to use the App. If you are under 18, you represent that you have your parent's or guardian's permission 
      to use the App. By using the App, you represent and warrant that you meet these eligibility requirements.
    </p>

    <h2>4. User Account and Subscription</h2>
    <h3>4.1 Subscriptions</h3>
    <p>
      <strong>{appName}</strong> offers subscription-based premium features. Subscriptions are processed through Google Play and are subject to 
      Google Play's terms of service and billing policies.
    </p>
    <h3>4.2 Free Trial</h3>
    <p>
      We may offer a free trial period for new subscribers. At the end of the free trial, your subscription will automatically convert to a paid 
      subscription unless you cancel before the trial ends.
    </p>
    <h3>4.3 Billing and Renewal</h3>
    <p>
      Subscriptions automatically renew unless canceled at least 24 hours before the end of the current billing period. You can manage and cancel 
      your subscription through Google Play Store settings.
    </p>
    <h3>4.4 Refunds</h3>
    <p>
      Refund requests are handled according to Google Play's refund policies. We do not directly process refunds.
    </p>

    <h2>5. Acceptable Use</h2>
    <p>You agree to use the App only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
    <ul>
      <li>Use the App in any way that violates applicable laws or regulations</li>
      <li>Attempt to gain unauthorized access to the App, its servers, or any related systems</li>
      <li>Use the App to harass, abuse, or harm others</li>
      <li>Interfere with or disrupt the App's operation or servers</li>
      <li>Reverse engineer, decompile, or disassemble the App</li>
      <li>Use the App to facilitate or promote illegal activities</li>
      <li>Submit false, misleading, or malicious content for analysis</li>
      <li>Use automated systems or bots to access the App</li>
    </ul>

    <h2>6. Intellectual Property</h2>
    <p>
      The App and its original content, features, and functionality are owned by {COMPANY_NAME} and are protected by international copyright, 
      trademark, patent, trade secret, and other intellectual property laws.
    </p>
    <p>
      You are granted a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial purposes in accordance 
      with these Terms.
    </p>

    <h2>7. Third-Party Services</h2>
    <p>
      The App utilizes third-party services, including but not limited to OpenAI for AI-powered analysis and Google Play for billing. 
      Your use of these third-party services is subject to their respective terms and privacy policies.
    </p>
    <p>
      We are not responsible for the content, accuracy, or practices of any third-party services.
    </p>

    <h2>8. Disclaimer of Warranties</h2>
    <p>
      THE APP IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT 
      LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
    </p>
    <p>
      WE DO NOT WARRANT THAT:
    </p>
    <ul>
      <li>The App will be uninterrupted, secure, or error-free</li>
      <li>The results obtained from the App will be accurate or reliable</li>
      <li>Any errors in the App will be corrected</li>
      <li>The App will meet your specific requirements</li>
    </ul>
    <p>
      <strong>THE SCAM DETECTION ANALYSIS PROVIDED BY THE APP IS FOR INFORMATIONAL PURPOSES ONLY AND SHOULD NOT BE CONSIDERED AS LEGAL, 
      FINANCIAL, OR PROFESSIONAL ADVICE. ALWAYS VERIFY INFORMATION INDEPENDENTLY.</strong>
    </p>

    <h2>9. Limitation of Liability</h2>
    <p>
      TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL {COMPANY_NAME.toUpperCase()}, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, 
      SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION 
      LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
    </p>
    <ul>
      <li>Your access to or use of (or inability to access or use) the App</li>
      <li>Any conduct or content of any third party on the App</li>
      <li>Any content obtained from the App</li>
      <li>Unauthorized access, use, or alteration of your transmissions or content</li>
      <li>Any decisions made or actions taken based on the App's analysis results</li>
      <li>Financial losses resulting from reliance on the App's scam detection results</li>
    </ul>

    <h2>10. Indemnification</h2>
    <p>
      You agree to defend, indemnify, and hold harmless {COMPANY_NAME} and its officers, directors, employees, and agents from and against any 
      claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of 
      or relating to your violation of these Terms or your use of the App.
    </p>

    <h2>11. Privacy</h2>
    <p>
      Your use of the App is also governed by our Privacy Policy, which describes how we collect, use, and protect your information. 
      By using the App, you consent to our collection and use of information as described in the Privacy Policy.
    </p>

    <h2>12. Modifications to the App and Terms</h2>
    <h3>12.1 App Modifications</h3>
    <p>
      We reserve the right to modify, suspend, or discontinue the App (or any part thereof) at any time with or without notice. 
      We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the App.
    </p>
    <h3>12.2 Terms Modifications</h3>
    <p>
      We reserve the right to modify these Terms at any time. We will provide notice of material changes by updating the "Last Updated" date 
      and, where appropriate, providing additional notice within the App. Your continued use of the App after such modifications constitutes 
      your acceptance of the updated Terms.
    </p>

    <h2>13. Termination</h2>
    <p>
      We may terminate or suspend your access to the App immediately, without prior notice or liability, for any reason, including without 
      limitation if you breach these Terms.
    </p>
    <p>
      Upon termination, your right to use the App will immediately cease. All provisions of these Terms which by their nature should survive 
      termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
    </p>

    <h2>14. Governing Law</h2>
    <p>
      These Terms shall be governed by and construed in accordance with the laws of [South Africa], without regard to its conflict of law provisions.
    </p>
    <p>
      Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in [JURISDICTION].
    </p>

    <h2>15. Severability</h2>
    <p>
      If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the 
      objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
    </p>

    <h2>16. Waiver</h2>
    <p>
      The failure of {COMPANY_NAME} to enforce any right or provision of these Terms will not be considered a waiver of those rights. 
      The waiver of any such right or provision will be effective only if in writing and signed by a duly authorized representative of {COMPANY_NAME}.
    </p>

    <h2>17. Entire Agreement</h2>
    <p>
      These Terms, together with the Privacy Policy, constitute the entire agreement between you and {COMPANY_NAME} regarding your use of the App 
      and supersede all prior and contemporaneous written or oral agreements between you and {COMPANY_NAME}.
    </p>

    <h2>18. Contact Information</h2>
    <p>
      If you have any questions about these Terms, please contact us at:
    </p>
    <p>
      <strong>{COMPANY_NAME}</strong><br />
      Email: {email}
    </p>

    <h2>19. Acknowledgment</h2>
    <p>
      BY USING <strong>{appName.toUpperCase()}</strong>, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS.
    </p>
  </>
);
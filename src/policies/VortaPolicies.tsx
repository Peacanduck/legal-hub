import React from 'react';
import { Link } from 'react-router-dom';

interface PolicyProps {
  appName: string;
  email: string;
}

const COMPANY_NAME = "Py Digital";
const PACKAGE_ID = "com.pyrolabs.vorta";
const GOVERNING_LAW = "South Africa";
// Both dates move together on a material change, which is what the "Changes"
// section of each document promises. Keep in step with the copies bundled in
// the app: store/privacy-policy.md and store/terms-and-conditions.md in the
// Vorta repo are the source, and the app renders them directly.
const EFFECTIVE_DATE = "4 September 2026";
const YEAR = new Date().getFullYear();

// --- 1. PRIVACY POLICY ---
export const VortaPrivacy: React.FC<PolicyProps> = ({ appName, email }) => (
  <>
    <p className="meta-info" style={{ marginBottom: '1.5rem' }}>
      <strong>Effective date:</strong> {EFFECTIVE_DATE} &bull; <strong>Last updated:</strong> {EFFECTIVE_DATE}
    </p>

    <p>
      {appName} ("the game", "the app") is published by <strong>{COMPANY_NAME}</strong> ("we", "us").
      This policy explains what the app collects, who receives it, and what you can do about it.
      It applies to the Google Play release of {appName} (<code>{PACKAGE_ID}</code>).
    </p>

    <h2>The short version</h2>
    <ul>
      <li>There is no account with us, and we never ask you for your name, email address, phone number or date of birth. The app can optionally sign in to <strong>Google Play Games</strong> &mdash; Android may do this automatically &mdash; to sync your progress across devices and to power leaderboards and achievements. You can play the whole game without signing in.</li>
      <li>Your progress &mdash; high score, coins, unlocked skins and settings &mdash; is stored <strong>on your device</strong>. If you are signed in to Google Play Games, a copy of your coins, skins and stats is <strong>also saved to your Google Play Games account</strong> so it survives a reinstall or a new phone. <strong>We keep no copy on any server of ours; that cloud data lives with Google.</strong></li>
      <li>The app shows ads and sells optional in-app purchases. The companies that provide those services do collect data about your device, and that is the main privacy consideration in this app.</li>
    </ul>

    <h2>What we store on your device</h2>
    <p>The app saves the following locally, using your device's standard app storage:</p>
    <table className="policy-table">
      <thead>
        <tr>
          <th>Stored</th>
          <th>Why</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>High score and total runs</td><td>To show your personal best</td></tr>
        <tr><td>Coin balance</td><td>To spend on in-app items</td></tr>
        <tr><td>Unlocked skins</td><td>To remember what you own</td></tr>
        <tr><td>Sound and haptics settings</td><td>To remember your preferences</td></tr>
        <tr><td>How far through the coaching hints you are</td><td>So they appear once, and resume where you left off</td></tr>
        <tr><td>Whether the app has asked you to rate it</td><td>So it asks at most once per version</td></tr>
      </tbody>
    </table>
    <p>
      This information stays on the device. It is not transmitted to us, and we keep no copy of it on any
      server of ours. It is removed when you uninstall the app. If you are signed in to Google Play Games,
      a copy of your coins, unlocked skins and game stats is also saved to your Google Play Games account
      &mdash; see <strong>Google Play Games Services</strong> below.
    </p>

    <h2>What third parties collect</h2>
    <p>
      To sign you in, sync your progress, show ads and process purchases, the app includes software from the
      companies below. They act as independent controllers of the data they collect and handle it under
      their own privacy policies, which we link to here.
    </p>

    <h3>Google Play Games Services</h3>
    <p>
      Powers optional sign-in, the global leaderboard, achievements, and cloud saving of your progress.
      Sign-in is handled by Google and is optional &mdash; Android may sign you in automatically if you
      already use Play Games, and you can play the entire game signed out, in which case none of the data
      below leaves your device. When you are signed in, Google collects and stores:
    </p>
    <ul>
      <li>your <strong>Play Games player ID and display name</strong> (a gaming profile Google maintains; it is not created by us);</li>
      <li>the <strong>scores you set</strong>, submitted to the game's leaderboard;</li>
      <li>your <strong>achievement progress</strong> &mdash; which milestones you have reached;</li>
      <li>a <strong>cloud copy of your progress</strong>: your coin balance, unlocked and equipped skins, and game stats (high score, total runs, best combo, total gaps), so it restores on a new device.</li>
    </ul>
    <p>
      Your device settings and which sound set you hear are <strong>not</strong> sent to Google Play Games.
      You manage sign-in, and can delete your saved game data, in the <strong>Google Play Games</strong> app
      and your Google account.<br />
      Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">https://policies.google.com/privacy</a>
    </p>

    <h3>Google AdMob &mdash; advertising</h3>
    <p>Provides the banner, interstitial and rewarded video ads. AdMob collects:</p>
    <ul>
      <li>your device's <strong>advertising ID</strong> (a resettable identifier used for ads);</li>
      <li>device and app information, such as device model, operating system version, language, and app version;</li>
      <li><strong>approximate location derived from your IP address</strong> &mdash; country or city level. The app does not request or receive GPS or precise location permission;</li>
      <li>interactions with ads, such as impressions and clicks, for reporting and for detecting invalid traffic.</li>
    </ul>
    <p>
      Google uses this to select ads, limit how often you see the same ad, measure ad performance and prevent fraud.<br />
      Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">https://policies.google.com/privacy</a> &mdash; see also{' '}
      <a href="https://support.google.com/admob/answer/6128543" target="_blank" rel="noreferrer">https://support.google.com/admob/answer/6128543</a> for how Google uses ad data.
    </p>

    <h3>RevenueCat &mdash; purchases and entitlements</h3>
    <p>
      Processes in-app purchases and remembers what you have bought so it can be restored on a reinstall
      or a new device. RevenueCat collects:
    </p>
    <ul>
      <li>your <strong>purchase history</strong> for this app, and the receipt Google Play issues;</li>
      <li>an <strong>app user ID</strong> that identifies your purchases. When you are signed in to Google Play Games this is your <strong>Play Games player ID</strong> &mdash; a pseudonymous gaming identifier, not your name, email or Google account login &mdash; so that a purchase follows your game profile to your other devices. Signed out, it is a random per-install identifier;</li>
      <li>device and country information.</li>
    </ul>
    <p>Policy: <a href="https://www.revenuecat.com/privacy" target="_blank" rel="noreferrer">https://www.revenuecat.com/privacy</a></p>

    <h3>Superwall &mdash; in-app offers</h3>
    <p>
      Decides which purchase offer to display and when. Superwall collects device and app information,
      an anonymous installation identifier, and events describing which offers were shown and whether
      they were accepted or dismissed.
    </p>
    <p>Policy: <a href="https://superwall.com/privacy" target="_blank" rel="noreferrer">https://superwall.com/privacy</a></p>

    <h3>Google Play Billing</h3>
    <p>
      Payment itself is handled entirely by Google Play. Your payment method and billing details go to
      Google and are <strong>never seen by us or by the app</strong>.
    </p>
    <p>Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">https://policies.google.com/privacy</a></p>

    <h2>Advertising ID and your choices</h2>
    <p>
      The app declares the <code>com.google.android.gms.permission.AD_ID</code> permission because AdMob
      uses the advertising ID to serve ads. You control it in Android:
    </p>
    <ul>
      <li><strong>Settings &rarr; Google &rarr; Ads</strong> lets you <strong>delete your advertising ID</strong> or <strong>opt out of ads personalisation</strong>. Opting out does not remove ads, but they stop being tailored to you.</li>
      <li>Removing ads entirely is available as a one-off in-app purchase.</li>
    </ul>

    <h2>In-app purchases</h2>
    <p>
      {appName} sells consumable coins, cosmetic skins and a Remove Ads upgrade. Remove Ads suppresses
      the banner above the play area and the full-screen interstitial ads between runs. Optional
      rewarded videos &mdash; the ones you choose to watch in exchange for a continue or coins &mdash;
      remain available, and watching one is always your choice.
    </p>

    <h2>Age ratings and children</h2>
    <p>
      {appName} holds an all-ages content rating almost everywhere it is rated: <strong>PEGI 3</strong>,{' '}
      <strong>ESRB Everyone</strong>, <strong>USK 0</strong>, <strong>IARC 3+</strong>, <strong>GRAC ALL</strong>,{' '}
      <strong>ACB G</strong>, <strong>Gmedia 3</strong> and <strong>0+</strong> in Russia. Brazil's ClassInd rates it <strong>14</strong>.
    </p>
    <p>
      Those ratings describe the <em>content</em> &mdash; there is no violence, no chat, and nothing else
      in the game a young player should not see. They are not a statement about who the app is built for,
      and the two are easy to confuse.
    </p>
    <p>
      <strong>The app is not directed to children under 13.</strong> It is a general-audience app serving
      general-audience advertising, it is not enrolled in the Google Play Families programme, and its Play
      target age group is set to 13 and over. We do not knowingly collect personal information from
      children under 13. If you believe a child has provided personal information through the app, contact
      us at <a href={`mailto:${email}`}>{email}</a> and we will delete what we can and tell you what we cannot.
    </p>
    <p>
      If you are a parent deciding whether to let a younger child play: the game itself is harmless, but it
      shows third-party advertising and sells optional in-app purchases, and the advertising is not
      filtered for a child audience. The Remove Ads purchase switches off the full-screen ads. Android's
      own parental controls can require approval for every purchase.
    </p>

    <h2>Your rights</h2>
    <p>
      Depending on where you live, you may have the right to access, correct, delete or export personal
      data held about you, to object to processing, or to opt out of the "sale" or "sharing" of personal
      information.
    </p>
    <p>
      Because you have no account with us, and your progress lives on your device (and, if you
      are signed in, in your own Google Play Games account), the fastest way to erase everything we could
      possibly be associated with is to <strong>uninstall the app</strong>, <strong>reset your advertising
      ID</strong>, and &mdash; if you signed in &mdash; <strong>delete the app's saved game data in the
      Google Play Games app</strong>. For data held by the providers listed above, exercise your rights with
      them directly through the links in their policies, or write to us at{' '}
      <a href={`mailto:${email}`}>{email}</a> and we will help route the request.
    </p>
    <p>
      <strong>EEA and UK users:</strong> where ads are personalised, that processing relies on your
      consent, which you may withdraw at any time. Where we process data to deliver and secure the app,
      we rely on legitimate interests.
    </p>
    <p>
      <strong>California users:</strong> we do not sell personal information for money. Sharing advertising
      identifiers with ad providers for personalised advertising may be treated as "sharing" under the
      CCPA/CPRA; you may opt out using the Android ads settings described above.
    </p>

    <h2>South Africa and POPIA</h2>
    <p>
      We are based in {GOVERNING_LAW}, so the Protection of Personal Information Act 4 of 2013
      ("POPIA") applies to this app. {COMPANY_NAME} is the <strong>responsible party</strong> for the
      processing described in this policy. The Google Play Games, advertising and purchase providers
      listed above determine their own purposes and means, so they are responsible parties in their own
      right rather than our operators.
    </p>
    <p>
      The information involved is device-level and profile-level &mdash; an advertising identifier, device
      and app characteristics, an approximate location derived from your IP address, purchase records, and,
      if you sign in to Google Play Games, your Play Games profile and a cloud copy of your game progress.
      We hold no name, email address, account or contact details for any player, and no copy on
      infrastructure of ours &mdash; the cloud-saved progress, scores and achievement state are held by
      Google.
    </p>
    <p>
      We process it on two bases: your <strong>consent</strong>, where the law requires consent for
      personalised advertising, and our <strong>legitimate interests</strong> in delivering, securing
      and being paid for the app.
    </p>
    <p>
      Under POPIA you may ask us to confirm what personal information we hold about you, to correct or
      delete it, and you may object to processing. Write to <a href={`mailto:${email}`}>{email}</a>.
      Because you have no account with us, we usually cannot connect a request to a specific
      installation, and the honest answer will often be that we hold nothing identifying you &mdash;
      in which case the effective controls are the Android advertising ID settings above, the deletion of
      your Google Play Games saved data, and the providers' own policies.
    </p>
    <p>
      If you are not satisfied with how we handle a request, you may complain to the Information
      Regulator (South Africa):{' '}
      <a href="https://inforegulator.org.za" target="_blank" rel="noreferrer">https://inforegulator.org.za</a>
    </p>

    <h2>Data retention</h2>
    <p>
      We keep no copy of your data on infrastructure of ours. Progress you cloud-save to Google Play Games,
      and your leaderboard and achievement records, are retained by Google under its own policy; you can
      delete the saved game data from the Google Play Games app. Retention by the other providers above is
      governed by their own policies.
    </p>

    <h2>Security</h2>
    <p>
      Traffic between the app and the services above uses encrypted connections (HTTPS/TLS) as implemented
      by those providers. No method of transmission or storage is perfectly secure, and we cannot guarantee
      absolute security.
    </p>

    <h2>Changes</h2>
    <p>
      If this policy changes materially, we will update the effective date at the top and publish the new
      version at this address before the change takes effect.
    </p>

    <h2>Contact</h2>
    <p>
      <strong>{COMPANY_NAME}</strong><br />
      <a href={`mailto:${email}`}>{email}</a>
    </p>
  </>
);

// --- 2. TERMS AND CONDITIONS ---
export const VortaTerms: React.FC<PolicyProps> = ({ appName, email }) => (
  <>
    <p className="meta-info" style={{ marginBottom: '1.5rem' }}>
      <strong>Effective date:</strong> {EFFECTIVE_DATE} &bull; <strong>Last updated:</strong> {EFFECTIVE_DATE}
    </p>

    <p>
      These terms are an agreement between you and <strong>{COMPANY_NAME}</strong> ("we", "us") covering
      your use of the {appName} mobile game ("the app"). By installing or playing the app you accept them.
      If you do not accept them, do not use the app.
    </p>
    <p>
      Our <Link to="/vorta/privacy">Privacy Policy</Link> explains what the app collects and who receives it.
      It forms part of these terms.
    </p>

    <h2>1. Who may use the app</h2>
    <p>
      You must be <strong>13 or over</strong> to use {appName}. The app carries an all-ages <em>content</em>{' '}
      rating (PEGI 3, ESRB Everyone, USK 0, IARC 3+ and equivalents; ClassInd 14 in Brazil), which means the
      content is suitable for young players &mdash; but the app is a general-audience product that serves
      third-party advertising and is not designed for children.
    </p>
    <p>
      If you are under the age of majority where you live, you may use the app only with the involvement of
      a parent or guardian, and only they may make purchases.
    </p>

    <h2>2. Your licence to use the app</h2>
    <p>
      We grant you a personal, non-exclusive, non-transferable, revocable licence to install and play{' '}
      {appName} on devices you control, for your own private, personal, non-commercial use.
    </p>

    <h2>3. What you may not do</h2>
    <p>You may not:</p>
    <ul>
      <li>reverse engineer, decompile or disassemble the app, except where that right cannot lawfully be excluded;</li>
      <li>modify the app, or use a modified client, emulator, bot, script or memory editor to alter gameplay, scores or the currency balance;</li>
      <li>attempt to obtain coins, skins or the Remove Ads entitlement without paying for them where they are sold, or to circumvent the display of advertising by interfering with the app;</li>
      <li>generate artificial ad impressions or clicks, whether by hand or automatically;</li>
      <li>use the app to break the law, or to interfere with the app's operation or with other players' use of it.</li>
    </ul>
    <p>
      We may suspend or terminate your access, and remove entitlements obtained in breach of this section,
      where we reasonably believe it applies to you.
    </p>

    <h2>4. Purchases, coins and other virtual items</h2>
    <p>
      <strong>
        Coins, skins and the Remove Ads upgrade are a limited licence to use a feature of the app. They are
        not property and they have no monetary value.
      </strong>{' '}
      They cannot be sold, transferred, exchanged or redeemed for money or anything else of real value,
      inside or outside the app.
    </p>
    <ul>
      <li>All purchases are processed by <strong>Google Play</strong>. We never see or handle your payment details. Google's own terms apply to the transaction.</li>
      <li>Prices are shown by the store in your local currency before you confirm.</li>
      <li>Coins are consumed when spent and are not refundable once spent.</li>
      <li>Remove Ads suppresses the banner above the play area and the full-screen interstitial advertising between runs. Optional rewarded videos &mdash; the ones you choose to watch in exchange for a continue or coins &mdash; remain available, because they are always your choice to watch.</li>
    </ul>
    <p>
      <strong>Refunds.</strong> Your statutory rights are unaffected and, depending on where you live, may
      include a right to withdraw from a digital purchase. Beyond those rights, refunds are handled by
      Google Play under its refund policy, and we generally have no ability to reverse a charge ourselves.
      If Google refunds a purchase, the corresponding entitlement is removed.
    </p>
    <p>
      <strong>Losing your items.</strong> Your progress and balance are stored on your device and, if you
      are signed in to Google Play Games, also backed up to your Google Play Games account, so your coins,
      skins and stats can restore on a new device. Purchases are restored through your Google account using
      the Restore Purchases option in Settings. Consumable coins that were already spent cannot be restored.
      Uninstalling the app erases local progress, and progress restores only as far as your last cloud save
      (or, if you were never signed in, not at all).
    </p>

    <h2>5. Advertising</h2>
    <p>
      The app shows advertising supplied by third parties. We do not choose the individual adverts, do not
      endorse them, and are not responsible for the goods, services or content they promote or for the sites
      they link to. If an advert appears broken, deceptive or inappropriate, tell us at{' '}
      <a href={`mailto:${email}`}>{email}</a> and we will report it.
    </p>
    <p>
      Where the law requires your consent for personalised advertising, the app asks for it before
      requesting any adverts, and Settings offers a way to change your answer at any time.
    </p>

    <h2>6. Availability and changes to the app</h2>
    <p>
      We may update, change or discontinue the app or any of its features at any time. We may also stop
      distributing it. We will not do that as a way of avoiding an obligation we already owe you, and where
      we withdraw a paid feature you have bought, we will act reasonably about it.
    </p>
    <p>
      The app needs a network connection for advertising, purchases and restoring entitlements. Gameplay
      itself works offline.
    </p>
    <p>
      Leaderboards, achievements and cloud saving of your progress are <strong>optional online features that
      require Google Play Games</strong>. Signing in is optional and the whole game is playable without it;
      when you use these features they are provided by Google under its own terms, and they may change or be
      unavailable.
    </p>

    <h2>7. Our intellectual property</h2>
    <p>
      The app &mdash; its code, artwork, sound, name and design &mdash; belongs to <strong>{COMPANY_NAME}</strong>{' '}
      or its licensors and is protected by copyright and other laws. Nothing in these terms transfers any of
      it to you beyond the licence in section 2. You may freely record, stream and publish footage of your
      own play, including monetised video.
    </p>

    <h2>8. Disclaimers</h2>
    <p>
      The app is provided <strong>"as is"</strong>. To the fullest extent the law allows, we exclude implied
      warranties of merchantability, fitness for a particular purpose and non-infringement, and we do not
      warrant that the app will be uninterrupted, error-free, or that scores and progress will never be lost.
    </p>
    <p>
      Nothing here excludes liability that cannot lawfully be excluded, including for death or personal
      injury caused by negligence, or for fraud. If you are a consumer, you keep all the statutory rights
      your local law gives you, and where those rights conflict with this section, they win.
    </p>

    <h2>9. Limitation of liability</h2>
    <p>
      To the fullest extent the law allows, and subject to section 8, we are not liable for indirect or
      consequential loss, loss of data or lost progress, or loss of profit or opportunity.
    </p>
    <p>
      Where we are liable, our total liability to you is limited to the greater of the amount you paid us
      through the app in the twelve months before the claim, or USD 50.
    </p>

    <h2>10. Ending this agreement</h2>
    <p>
      You may end it at any time by uninstalling the app. We may suspend or end your access if you
      materially breach these terms, in particular section 3. Sections 4, 7, 8, 9 and 11 survive the end of
      this agreement.
    </p>

    <h2>11. Governing law and disputes</h2>
    <p>
      These terms are governed by the laws of <strong>{GOVERNING_LAW}</strong>, and the courts of{' '}
      {GOVERNING_LAW} have jurisdiction. If you are a consumer resident elsewhere, this does not deprive you
      of the protection of the mandatory consumer law of the country you live in, or of the right to bring
      proceedings there.
    </p>

    <h2>12. Changes to these terms</h2>
    <p>
      We may update these terms. If a change materially affects your rights, we will update the date at the
      top and publish the new version here before it takes effect. Continuing to use the app after that
      means you accept the new version. If you do not accept it, uninstall the app.
    </p>

    <h2>13. Contact</h2>
    <p>
      <strong>{COMPANY_NAME}</strong><br />
      <a href={`mailto:${email}`}>{email}</a>
    </p>
  </>
);

// --- 3. LICENSE (EULA) ---
export const VortaLicense: React.FC<PolicyProps> = ({ appName }) => (
  <>
    <h2>End User License Agreement (EULA)</h2>
    <p>
      This License Agreement is a legal agreement between you and <strong>{COMPANY_NAME}</strong> regarding
      your use of the <strong>{appName}</strong> mobile game (<code>{PACKAGE_ID}</code>). It supplements the{' '}
      <Link to="/vorta/terms">Terms &amp; Conditions</Link>, which govern in the event of a conflict.
    </p>

    <h3>1. Grant of licence</h3>
    <p>
      We grant you a revocable, non-exclusive, non-transferable, limited licence to download, install and
      use {appName} on devices you control, solely for your personal, non-commercial purposes and strictly
      in accordance with this Agreement.
    </p>

    <h3>2. Restrictions</h3>
    <p>You agree not to, and will not permit others to:</p>
    <ul>
      <li>license, sell, rent, lease, assign, distribute, transmit, host, outsource or otherwise commercially exploit the app;</li>
      <li>modify, make derivative works of, disassemble, decrypt, reverse compile or reverse engineer any part of the app, except where that right cannot lawfully be excluded;</li>
      <li>use a modified client, emulator, bot, script or memory editor to alter gameplay, scores or the coin balance;</li>
      <li>remove, obscure or alter any copyright, trademark or other proprietary notice.</li>
    </ul>

    <h3>3. Virtual items</h3>
    <p>
      Coins, skins and the Remove Ads upgrade are a limited licence to use a feature of the app. They are
      not property, have no monetary value, and cannot be transferred or redeemed for anything of real
      value. Section 4 of the <Link to="/vorta/terms">Terms &amp; Conditions</Link> sets this out in full.
    </p>

    <h3>4. Streaming and video</h3>
    <p>
      You may record, stream and publish footage of your own play, including monetised video, without a
      separate licence from us.
    </p>

    <h3>5. Termination</h3>
    <p>
      This Agreement is effective until terminated by you or by us. Your rights under it terminate
      automatically without notice if you fail to comply with any of its terms. On termination you must stop
      using the app and delete it from your devices.
    </p>

    <h2>Permissions &amp; grants</h2>
    <p>
      <strong>{COMPANY_NAME}</strong> grants Google Play the right to display all submitted media
      (screenshots, video, icon and feature graphic) for the purpose of showcasing this application.
    </p>
  </>
);

// --- 4. COPYRIGHT ---
export const VortaCopyright: React.FC<PolicyProps> = ({ appName }) => (
  <>
    <p>
      <strong>Copyright &copy; {YEAR} {COMPANY_NAME}. All rights reserved.</strong>
    </p>

    <h3>Ownership</h3>
    <p>
      The <strong>{appName}</strong> application, including all content, features and functionality
      (including but not limited to all information, software, text, displays, images, video and audio, and
      the design, selection and arrangement thereof) is owned by {COMPANY_NAME}, its licensors, or other
      providers of such material, and is protected by copyright and other laws.
    </p>

    <h3>Game assets</h3>
    <p>
      Every ring, mote and particle in {appName} is drawn procedurally by the app itself &mdash; there are no
      licensed sprite or texture packs in the build. The visual design, colour palettes and skins are
      original work created by {COMPANY_NAME}.
    </p>

    <h3>Submission media</h3>
    <p>All store media was created by {COMPANY_NAME}:</p>
    <ul>
      <li>Screenshots &mdash; captured from the actual app by the developer</li>
      <li>Feature graphic and app icon &mdash; created by the developer for this application</li>
      <li>Promotional copy &mdash; written by the developer</li>
    </ul>

    <h3>Trademarks</h3>
    <p>
      Google Play and Android are trademarks of Google LLC. AdMob, RevenueCat and Superwall are trademarks
      of their respective owners. Their use here is descriptive only and does not imply any endorsement of{' '}
      {appName}.
    </p>

    <p>
      <strong>&copy; {YEAR} {COMPANY_NAME} &mdash; all rights reserved.</strong>
    </p>
  </>
);

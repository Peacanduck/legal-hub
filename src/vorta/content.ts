import { getAppById } from '../data/apps';

// Copy and data for the Vorta landing page. Every mechanic and number here is
// the game's: a claim on this page that the app does not back up is a refund
// request or a one-star review, so check the Vorta repo before changing one.

const app = getAppById('vorta');

export const LINKS = {
  play: app?.link ?? 'https://play.google.com/store/apps/details?id=com.pyrolabs.vorta',
  support: `mailto:${app?.contactEmail ?? 'fu.developer@gmail.com'}`,
  privacy: '/vorta/privacy',
  terms: '/vorta/terms',
  license: '/vorta/license',
  copyright: '/vorta/copyright',
};

export const PILLARS = [
  {
    title: 'One input',
    body: 'Tap anywhere to flip your orbit. There is nothing else to learn, so every run comes down to timing and nerve.',
  },
  {
    title: 'Thread the gap',
    body: 'Rings close in from the dark, each spinning at its own speed and carrying one to three openings. Read the rotation, commit, slip through.',
  },
  {
    title: 'One miss ends it',
    body: 'Touch a ring and the run is over. No health bar, no lives: just the score you earned and the pull to go again.',
  },
];

// lib/core/game_config.dart: comboMultiplierMax, comboDecaySeconds, nearMissBonus.
export const COMBO_STATS = [
  { value: '×5', label: 'Multiplier cap' },
  { value: '3.5 s', label: 'To keep a chain alive' },
  { value: '+3', label: 'For threading it close' },
];

export const FAIR_STATS = [
  {
    value: '78%',
    body: 'The most of your top-speed reach any ring may ask for. Decisive, never perfect.',
  },
  {
    value: '120 Hz',
    body: 'Fixed-step physics, identical on every phone. Each crossing is judged at its exact instant, between frames.',
  },
  {
    value: '40 runs',
    body: 'An autopilot plays the whole difficulty curve on every build. One unreachable ring fails it.',
  },
];

export type FeatureIcon = 'offline' | 'account' | 'ranks' | 'trophy' | 'cloud' | 'noads';

export const FEATURES: { icon: FeatureIcon; title: string; body: string }[] = [
  { icon: 'offline', title: 'Plays offline', body: 'No signal needed. On a plane, underground, anywhere.' },
  { icon: 'account', title: 'No account', body: 'Nothing to sign up for, and no login screen between you and a run.' },
  { icon: 'ranks', title: 'Leaderboards', body: 'Weekly and all-time rankings through Google Play Games.' },
  { icon: 'trophy', title: 'Achievements', body: 'Twenty-four to chase, from your first orbit to the event horizon.' },
  { icon: 'cloud', title: 'Cloud save', body: 'Signed in to Play Games, your coins, skins and stats follow you to a new phone.' },
  { icon: 'noads', title: 'Remove Ads', body: 'One optional purchase switches off the banner and the ads between runs.' },
];

export const FAQ: { q: string; a: string; link?: { href: string; label: string } }[] = [
  {
    q: 'Is Vorta free?',
    a: 'Yes. It is free to play with ads. Optional purchases add coin packs, two premium skins and a one-time Remove Ads upgrade, all through Google Play.',
  },
  {
    q: 'Does it need an internet connection?',
    a: 'No. The whole game plays offline. A connection is only used for ads, purchases and the optional Google Play Games features.',
  },
  {
    q: 'Do I need an account?',
    a: 'Not with us: there is nothing to sign up for. Signing in to Google Play Games is optional and adds leaderboards, achievements and cloud save. Everything else works without it.',
  },
  {
    q: 'What does Remove Ads remove?',
    a: 'The banner above the play area and the full-screen ads between runs. Rewarded videos, the ones you can choose to watch for a continue or coins, stay available, and stay your choice.',
  },
  {
    q: 'Which devices can play it?',
    a: 'Android phones and tablets running Android 8.0 or later.',
  },
  {
    q: 'Can I stream it or post videos?',
    a: 'Yes. You can record, stream and publish footage of your own play, monetised video included, without asking us first.',
  },
  {
    q: 'Is it suitable for children?',
    a: 'The content is rated for everyone, PEGI 3 and ESRB Everyone, with no violence and no chat. It does show third-party ads and sell optional purchases, so it is not designed for children under 13.',
  },
  {
    q: 'What data does it collect?',
    a: 'Nothing on servers of ours. Your progress lives on your device, and if you sign in to Play Games a copy is kept by Google. Ads and purchases are run by third parties that collect device data under their own policies.',
    link: { href: LINKS.privacy, label: 'Read the privacy policy' },
  },
];

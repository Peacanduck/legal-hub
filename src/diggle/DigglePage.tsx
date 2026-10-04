import './polyfills';
import './theme';

import { useCallback, useRef, useState, type CSSProperties } from 'react';
import type { WalletError } from '@solana/wallet-adapter-base';
import { CLUSTER, LINKS, NETWORK, RPC_HOST, explorer } from './config';
import { FAQ, ORES, RARITIES, SLOTS, STRATA, UPGRADES, uniformLoadout } from './content';
import { shortAddress } from './format';
import { SolanaProviders } from './solana/SolanaProviders';
import { useCandyState, type CandyState } from './solana/candyState';
import { DepthGauge } from './components/DepthGauge';
import { Hangar, LegendaryFive } from './components/Hangar';
import { MintConsole } from './components/MintConsole';
import { Machine, StarterRig, Tile, type AnimBand } from './components/Sprites';
import { WalletButton, WalletModal } from './components/WalletUI';
import { useReveal } from './components/useReveal';
import { TopBar } from './components/TopBar';
import { Footer } from './components/Footer';
import { usePageChrome } from './components/usePageChrome';

// The game's own playback bands (lib/game/systems/drill_anim.dart).
const BANDS: { label: string; note: string; band: AnimBand }[] = [
  { label: 'Digging', note: '14 fps', band: { fps: 14, frames: 4 } },
  { label: 'Flying', note: '12 fps', band: { fps: 12, frames: 4 } },
  { label: 'Driving', note: '8 fps', band: { fps: 8, frames: 4 } },
  { label: 'Parked', note: '3 fps, plume never lights', band: { fps: 3, frames: 2 } },
];

export const DigglePage = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const candy = useCandyState();

  const openWallet = useCallback(() => {
    setWalletError(null);
    setWalletOpen(true);
  }, []);
  const closeWallet = useCallback(() => setWalletOpen(false), []);
  const onWalletError = useCallback((e: WalletError) => {
    setWalletError(e.message || 'The wallet could not connect. Try again.');
  }, []);

  useReveal(rootRef);
  usePageChrome('Diggle — Mine deep. Sell high. Upgrade.');

  return (
    <SolanaProviders onWalletError={onWalletError}>
      <div className="dg" ref={rootRef}>
        <a className="dg-skip" href="#mint">
          Skip to mint
        </a>

        {CLUSTER === 'devnet' && (
          <div className="dg-devnet-banner" role="status">
            Devnet mode &mdash; test mints against the devnet candy machine. Remove <code>?cluster=devnet</code> for
            the real collection.
          </div>
        )}

        <TopBar
          brandHref="#top"
          navLabel="Page"
          nav={
            <>
              <a href="#game">The game</a>
              <a href="#hangar">Hangar</a>
              <a href="#legendary">Legendary</a>
              <a href="#faq">FAQ</a>
            </>
          }
          actions={<WalletButton onOpen={openWallet} />}
        />

        <DepthGauge />

        <main>
          {/* ── The surface ─────────────────────────────────────── */}
          <section className="dg-hero" id="top" data-depth="0-0" data-biome="Surface" data-accent="--dg-gold">
            <div className="dg-wrap dg-hero-grid">
              <div className="dg-hero-copy">
                <p className="dg-pixel dg-eyebrow">A mining game for Solana Mobile</p>
                <h1 className="dg-wordmark">Diggle</h1>
                <p className="dg-tagline">Mine deep. Sell high. Upgrade.</p>
                <p className="dg-lede">
                  Pilot a drill straight down through four hostile strata, haul ore back to the surface, and rebuild
                  your rig from parts you actually own.
                </p>
                <figure className="dg-quote">
                  <blockquote>
                    &ldquo;A fantastic 2D mining game that perfectly captures the &lsquo;just one more trip&rsquo;
                    loop.&rdquo;
                  </blockquote>
                  <figcaption>avatarx.skr &middot; dApp Store review</figcaption>
                </figure>
                <div className="dg-cta-row">
                  <a className="dg-btn dg-btn--store" href={LINKS.dappStore}>
                    Play free on the dApp Store
                  </a>
                  <a className="dg-btn dg-btn--ghost dg-mobile-only" href="#mint">
                    Mint a machine
                  </a>
                </div>
                <p className="dg-fine">The store link opens the dApp Store on Seeker and Saga.</p>
                <ul className="dg-facts" aria-label="At a glance">
                  <li>
                    <strong>4</strong> strata
                  </li>
                  <li>
                    <strong>8</strong> ores
                  </li>
                  <li>
                    <strong>7</strong> languages
                  </li>
                  <li>
                    <strong>Free</strong> to play
                  </li>
                </ul>
              </div>
              <div className="dg-hero-console" id="mint">
                <MintConsole candy={candy} openWallet={openWallet} />
              </div>
            </div>
            <div className="dg-surface" aria-hidden="true">
              <div className="dg-surface-rig">
                <StarterRig label="" band={{ fps: 3, frames: 2 }} />
              </div>
            </div>
          </section>

          {/* ── The run ─────────────────────────────────────────── */}
          <section className="dg-band dg-band--run" id="game" data-depth="0-30" data-biome="Surface" data-accent="--dg-gold">
            <div className="dg-wrap dg-split">
              <div className="dg-reveal">
                <p className="dg-pixel dg-eyebrow">The run</p>
                <h2 className="dg-h2">Fuel, hull, cargo. Pick two.</h2>
                <p className="dg-body">
                  Every descent is the same argument with yourself. Fuel gets you down and back. Your hull absorbs the
                  falls and whatever the rock is hiding. Your cargo bay decides when a good run has to end.
                </p>
                <p className="dg-body">
                  The whole game is that moment at 350&nbsp;m with a diamond seam in reach and just enough fuel to
                  surface &mdash; but not both.
                </p>
              </div>
              <div className="dg-hud dg-reveal" aria-label="Example gauges at 350 metres">
                <p className="dg-pixel dg-hud-depth">350m &middot; Crystal Caverns</p>
                {[
                  { name: 'Fuel', value: 22, tone: 'bad' },
                  { name: 'Hull', value: 64, tone: 'ok' },
                  { name: 'Cargo', value: 93, tone: 'warn' },
                ].map((g) => (
                  <div key={g.name} className={`dg-hud-row dg-hud-row--${g.tone}`}>
                    <span className="dg-pixel">{g.name}</span>
                    <span className="dg-hud-bar">
                      <span style={{ width: `${g.value}%` }} />
                    </span>
                    <span className="dg-pixel dg-hud-val">{g.value}%</span>
                  </div>
                ))}
                <p className="dg-pull">You don&rsquo;t have enough fuel. You never have enough fuel.</p>
              </div>
            </div>
          </section>

          {/* ── The strata ──────────────────────────────────────── */}
          {STRATA.map((s, i) => (
            <section
              key={s.id}
              className={`dg-band dg-stratum dg-stratum--${s.id}`}
              data-depth={`${i === 0 ? 30 : s.from}-${s.to ?? 420}`}
              data-biome={s.name}
              data-accent={s.accent}
              style={{ '--dg-texture': `url(${s.texture})` } as CSSProperties}
            >
              <div className="dg-wrap dg-stratum-grid dg-reveal">
                <div className="dg-stratum-head">
                  <p className="dg-pixel dg-eyebrow">Stratum 0{i + 1}</p>
                  <h2 className="dg-h2">{s.name}</h2>
                  <p className="dg-depth-tag dg-pixel">
                    {s.from}&ndash;{s.to ?? '∞'} m
                  </p>
                  <div className="dg-stratum-ores">
                    {s.ores.map((o) => (
                      <span key={o} className="dg-ore-chip">
                        <Tile name={o} size={40} />
                        <span>{o}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="dg-body">{s.body}</p>
                  <ul className="dg-facts-list">
                    {s.facts.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}

          {/* ── Feel ────────────────────────────────────────────── */}
          <section className="dg-band dg-band--deep" data-depth="420-440" data-biome="Deep seams" data-accent="--dg-ember">
            <div className="dg-wrap">
              <div className="dg-reveal dg-narrow">
                <p className="dg-pixel dg-eyebrow">Feel</p>
                <h2 className="dg-h2">And it moves</h2>
                <p className="dg-body">
                  Ore bursts when you break it. Blasts shake the screen. Gas pockets chain across a cavern, one lighting
                  the next. The drill animates by what it&rsquo;s doing &mdash; and deliberately <em>not</em> by what
                  you&rsquo;ve bought: a maxed rig and a starter rig dig at exactly the same frame rate.
                </p>
              </div>
              <ul className="dg-bands dg-reveal">
                {BANDS.map((b) => (
                  <li key={b.label}>
                    <Machine loadout={uniformLoadout('rare')} band={b.band} label={`Machine ${b.label.toLowerCase()}`} />
                    <strong>{b.label}</strong>
                    <span>{b.note}</span>
                  </li>
                ))}
              </ul>
              <p className="dg-fine dg-center">
                Same machine, the game&rsquo;s real playback rates. Full, Reduced and Off effect settings are in the
                game for battery life.
              </p>
            </div>
          </section>

          {/* ── Payload + rig ───────────────────────────────────── */}
          <section className="dg-band dg-band--deep" data-depth="440-470" data-biome="Deep seams" data-accent="--dg-ember">
            <div className="dg-wrap dg-split dg-split--top">
              <div className="dg-reveal">
                <p className="dg-pixel dg-eyebrow">Payload</p>
                <h2 className="dg-h2">Eight ores, coal to diamond</h2>
                <p className="dg-body">
                  Value climbs with depth, and so does the hardness of the rock sitting on top of it. A full bay of
                  diamond is a genuinely good day.
                </p>
                <ul className="dg-ore-legend">
                  {ORES.map((o) => (
                    <li key={o}>
                      <Tile name={o} size={48} />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="dg-reveal">
                <p className="dg-pixel dg-eyebrow">The rig</p>
                <h2 className="dg-h2">Six things to make better</h2>
                <ul className="dg-upgrades">
                  {UPGRADES.map((u) => (
                    <li key={u.name}>
                      <strong>{u.name}</strong>
                      <span>{u.body}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ── Endgame ─────────────────────────────────────────── */}
          <section className="dg-band dg-band--deep" data-depth="470-520" data-biome="Endgame" data-accent="--dg-ember">
            <div className="dg-wrap dg-split dg-split--top">
              <div className="dg-reveal">
                <p className="dg-pixel dg-eyebrow">Endgame</p>
                <h2 className="dg-h2">Corporate Contracts</h2>
                <p className="dg-body">
                  Reach 400&nbsp;m or bank half a million in lifetime cash and you can sign a new contract. The world
                  regenerates; your cash and upgrades reset. Your XP, achievements, artifacts and gear stay &mdash; and
                  from the second contract on, the world runs hardcore seams: richer ore, and a lot more that wants you
                  dead.
                </p>
              </div>
              <div className="dg-reveal">
                <p className="dg-pixel dg-eyebrow">Collection</p>
                <h2 className="dg-h2">The museum</h2>
                <p className="dg-body">
                  Artifacts sit in ruins through the deeper strata, fixed to their place in the world: the same ruin
                  always holds the same relic, for everyone. Complete a biome&rsquo;s set and the museum pays out. Daily
                  quests, login streaks, tiered achievements and weekly leaderboards fill in the rest.
                </p>
              </div>
            </div>
          </section>

          {/* ── Hangar ──────────────────────────────────────────── */}
          <section className="dg-band dg-band--hangar" id="hangar" data-depth="520-560" data-biome="The hangar" data-accent="--dg-gold">
            <div className="dg-wrap">
              <div className="dg-reveal dg-narrow">
                <p className="dg-pixel dg-eyebrow">The hangar</p>
                <h2 className="dg-h2">Your drill, part by part</h2>
                <p className="dg-body">
                  A Diggle Machine is five parts of gear, each rolled at one of five rarities. Every part carries a real
                  stat bonus and renders on your drill in-game. Gear never touches the weekly challenge &mdash; that
                  runs on a standardized loadout, so nobody buys a leaderboard.
                </p>
              </div>
              <div className="dg-reveal">
                <Hangar />
              </div>

              <div className="dg-matrix-wrap dg-reveal">
                <table className="dg-matrix">
                  <caption>Every part in the collection</caption>
                  <thead>
                    <tr>
                      <th scope="col">Slot</th>
                      {RARITIES.map((r) => (
                        <th key={r.key} scope="col" data-rarity={r.key}>
                          {r.label}
                          <span>{r.share}%</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SLOTS.map((slot) => (
                      <tr key={slot.key}>
                        <th scope="row">
                          {slot.label}
                          <span>{slot.stat}</span>
                        </th>
                        {slot.parts.map((part, i) => (
                          <td key={part} data-rarity={RARITIES[i].key}>
                            {part}
                            <span>{slot.bonus[i]}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="dg-fine">
                Shares are per slot across the 10,000. Both Common parts in a slot give identical stats.
              </p>
            </div>
          </section>

          {/* ── Legendary ───────────────────────────────────────── */}
          <section className="dg-band dg-band--legendary" id="legendary" data-depth="560-600" data-biome="Legendary" data-accent="--dg-r-legendary">
            <div className="dg-wrap">
              <div className="dg-reveal dg-narrow">
                <p className="dg-pixel dg-eyebrow dg-eyebrow--legendary">Legendary &middot; 2% per slot</p>
                <h2 className="dg-h2">Five parts, animated by hand</h2>
                <p className="dg-body">
                  There is exactly one Legendary part per slot &mdash; about 200 machines carry each. So each one was
                  drawn frame by frame rather than sharing the treatment every other tier gets.
                </p>
              </div>
              <LegendaryFive />
            </div>
          </section>

          {/* ── On-chain ────────────────────────────────────────── */}
          <section className="dg-band dg-band--deep" id="provenance" data-depth="600-640" data-biome="On-chain" data-accent="--dg-gold">
            <div className="dg-wrap dg-split dg-split--top">
              <div className="dg-reveal">
                <p className="dg-pixel dg-eyebrow">Provenance</p>
                <h2 className="dg-h2">Check it yourself</h2>
                <p className="dg-body">
                  Everything the mint console shows is read live from the chain, not from our servers. These are the
                  addresses behind it.
                </p>
              </div>
              <Provenance state={candy.state} />
            </div>
          </section>

          {/* ── FAQ ─────────────────────────────────────────────── */}
          <section className="dg-band dg-band--deep" id="faq" data-depth="640-680" data-biome="Questions" data-accent="--dg-gold">
            <div className="dg-wrap dg-narrow">
              <p className="dg-pixel dg-eyebrow">FAQ</p>
              <h2 className="dg-h2">Before you dig in</h2>
              <div className="dg-faq">
                {FAQ.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── Bedrock ─────────────────────────────────────────── */}
          <section className="dg-band dg-bedrock" data-depth="680-700" data-biome="Bedrock" data-accent="--dg-magma">
            <div className="dg-wrap dg-center dg-reveal">
              <h2 className="dg-bedrock-title">Go deeper than we did.</h2>
              <div className="dg-cta-row dg-cta-row--center">
                <a className="dg-btn dg-btn--primary" href="#mint">
                  Mint a machine
                </a>
                <a className="dg-btn dg-btn--store" href={LINKS.dappStore}>
                  Play free on the dApp Store
                </a>
                <a className="dg-btn dg-btn--ghost" href={LINKS.discord} target="_blank" rel="noreferrer">
                  Join the Discord
                </a>
              </div>
              <p className="dg-fine">English &middot; Espa&ntilde;ol &middot; Fran&ccedil;ais &middot; 日本語 &middot; 한국어 &middot; Русский &middot; 简体中文</p>
            </div>
          </section>
        </main>

        <Footer />

        <WalletModal open={walletOpen} onClose={closeWallet} error={walletError} />
      </div>
    </SolanaProviders>
  );
};

const Provenance = ({ state }: { state: CandyState | null }) => {
  const rows: { label: string; value: string; href?: string; full?: string }[] = [
    { label: 'Network', value: `${NETWORK.label} · via ${RPC_HOST}` },
    {
      label: 'Candy machine',
      value: shortAddress(NETWORK.candyMachine),
      full: NETWORK.candyMachine,
      href: explorer.account(NETWORK.candyMachine),
    },
  ];
  if (state) {
    const collection = state.collectionMint.toString();
    rows.push({ label: 'Collection', value: shortAddress(collection), full: collection, href: explorer.token(collection) });
    if (state.revealHash) {
      rows.push({ label: 'Reveal commitment', value: state.revealHash, full: state.revealHash });
    }
    rows.push({ label: 'Creator royalty', value: `${state.royaltyPercent}%` });
  }
  rows.push({ label: 'Art and metadata', value: 'Arweave, permanent' });

  return (
    <dl className="dg-ledger dg-plate dg-reveal">
      {rows.map((r) => (
        <div key={r.label}>
          <dt>{r.label}</dt>
          <dd className={r.full ? 'dg-mono' : undefined} title={r.full}>
            {r.href ? (
              <a href={r.href} target="_blank" rel="noreferrer">
                {r.value}
              </a>
            ) : (
              r.value
            )}
          </dd>
        </div>
      ))}
      {!state && (
        <div>
          <dt>Live data</dt>
          <dd>Reading the candy machine&hellip;</dd>
        </div>
      )}
    </dl>
  );
};

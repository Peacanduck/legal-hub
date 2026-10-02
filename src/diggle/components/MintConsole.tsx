import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CLUSTER, MINT_OVERHEAD_SOL, NETWORK, RPC_HOST, explorer } from '../config';
import { loadWalletMintInfo, type CandyState, type WalletMintInfo } from '../solana/candyState';
import type { MintOutcome, MintStage } from '../solana/mint';
import { describeMintError } from '../solana/errors';
import { shortAddress } from '../format';

// The mint path pulls in the wallet signer and compute-budget helpers on
// top of the read path. Fetched when a wallet connects, not on page load.
const loadMint = () => import('../solana/mint');

type Phase =
  | { kind: 'idle' }
  | { kind: 'working'; stage: MintStage }
  | { kind: 'done'; outcomes: MintOutcome[] }
  | { kind: 'error'; message: string };

const STAGE_LABEL: Record<MintStage, string> = {
  preparing: 'Preparing transaction…',
  approving: 'Approve in your wallet…',
  sending: 'Sending to Solana…',
  confirming: 'Confirming on-chain…',
};

// Upper bound on one batch even when the guard sets no per-wallet limit.
const MAX_BATCH = 3;

const sol = (n: number) => `${Number(n.toFixed(4))} SOL`;

const formatDate = (d: Date) =>
  d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export interface CandyFeed {
  state: CandyState | null;
  error: string | null;
  refresh: () => Promise<void>;
}

export const MintConsole = ({ candy, openWallet }: { candy: CandyFeed; openWallet: () => void }) => {
  const wallet = useWallet();
  const address = wallet.publicKey?.toBase58() ?? null;
  const { state, error: stateError, refresh } = candy;

  // Wallet info is tagged with the wallet it was read for, so switching
  // wallets can never show the previous one's balance or mint count.
  const [info, setInfo] = useState<(WalletMintInfo & { owner: string }) | null>(null);
  const [infoFailedFor, setInfoFailedFor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });

  const refreshInfo = useCallback(async () => {
    if (!state || !address) return;
    try {
      setInfo({ ...(await loadWalletMintInfo(state, address)), owner: address });
      setInfoFailedFor(null);
    } catch {
      setInfoFailedFor(address);
    }
  }, [state, address]);

  // Re-read on connect and on every candy machine poll, so balance and
  // mint count stay current while the page is open.
  useEffect(() => {
    if (!state || !address) return;
    let cancelled = false;
    loadWalletMintInfo(state, address).then(
      (next) => {
        if (cancelled) return;
        setInfo({ ...next, owner: address });
        setInfoFailedFor(null);
      },
      () => {
        if (!cancelled) setInfoFailedFor(address);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [state, address]);

  useEffect(() => {
    if (address) void loadMint();
  }, [address]);

  const walletInfo = info && info.owner === address ? info : null;
  const infoFailed = !!address && infoFailedFor === address && !walletInfo;
  const now = Date.now();
  const available = state?.itemsAvailable ?? 0;
  const redeemed = state?.itemsRedeemed ?? 0;
  const left = Math.max(0, available - redeemed);
  const soldOut = !!state && left === 0;
  const notStarted = !!state?.startsAt && state.startsAt.getTime() > now;
  const ended = !!state?.endsAt && state.endsAt.getTime() < now;
  const walletLeft = state?.mintLimit ? Math.max(0, state.mintLimit.limit - (walletInfo?.minted ?? 0)) : MAX_BATCH;
  const maxQty = Math.max(1, Math.min(walletLeft, left, MAX_BATCH));
  const qty = Math.min(quantity, maxQty);
  const price = state?.priceSol ?? 0;
  const needed = qty * (price + MINT_OVERHEAD_SOL);
  const insufficient = !!walletInfo && walletInfo.balanceSol < needed;
  const working = phase.kind === 'working';

  const doMint = async () => {
    if (!state) return;
    setPhase({ kind: 'working', stage: 'preparing' });
    try {
      const { mintMachines } = await loadMint();
      const outcomes = await mintMachines({
        wallet,
        state,
        quantity: qty,
        onStage: (stage) => setPhase({ kind: 'working', stage }),
      });
      setPhase({ kind: 'done', outcomes });
    } catch (e) {
      setPhase({ kind: 'error', message: describeMintError(e) });
    } finally {
      void refresh();
      void refreshInfo();
    }
  };

  // One primary action, whose label always says exactly what it will do.
  let action: { label: string; onClick?: () => void; note?: string; isError?: boolean } = {
    label: 'Reading the candy machine…',
  };
  if (!state && stateError) {
    action = {
      label: 'Retry',
      onClick: () => void refresh(),
      note: `Couldn’t read the ${NETWORK.label} candy machine. ${stateError}`,
      isError: true,
    };
  }
  else if (!state) action = { label: 'Reading the candy machine…' };
  else if (soldOut) action = { label: 'Sold out' };
  else if (notStarted) action = { label: `Opens ${formatDate(state.startsAt!)}` };
  else if (ended) action = { label: 'Minting has closed' };
  else if (working) action = { label: STAGE_LABEL[phase.stage] };
  else if (!address) action = { label: 'Connect wallet to mint', onClick: openWallet };
  else if (infoFailed) {
    action = {
      label: 'Retry wallet check',
      onClick: () => void refreshInfo(),
      note: 'Couldn’t read this wallet’s balance and mint count.',
      isError: true,
    };
  } else if (!walletInfo) action = { label: 'Checking your wallet…' };
  else if (walletLeft === 0) action = { label: `Wallet limit reached (${walletInfo.minted}/${state.mintLimit?.limit})` };
  else if (insufficient) {
    action = {
      label: `Needs about ${sol(needed)}`,
      note: `This wallet holds ${sol(walletInfo.balanceSol)}. The estimate covers the price plus rent and fees.`,
    };
  } else {
    action = {
      label: `Mint ${qty === 1 ? 'a machine' : `${qty} machines`} · ${sol(qty * price)}`,
      onClick: () => void doMint(),
    };
  }

  const status = !state
    ? null
    : soldOut
      ? { tone: 'done', text: 'Sold out' }
      : notStarted
        ? { tone: 'wait', text: 'Soon' }
        : ended
          ? { tone: 'done', text: 'Closed' }
          : { tone: 'live', text: 'Live' };

  const claimed = available > 0 ? redeemed / available : 0;

  return (
    <div className="dg-console dg-plate" aria-live="polite">
      <div className="dg-console-head">
        <span className="dg-pixel dg-console-eyebrow">Surface depot</span>
        <span className="dg-console-tags">
          {/* Always shown: which chain a mint would land on is never a guess. */}
          <span className={`dg-pill dg-pill--net-${CLUSTER}`} title={`Reading the chain through ${RPC_HOST}`}>
            {NETWORK.label}
          </span>
          {status && (
            <span className={`dg-pill dg-pill--${status.tone}`}>
              <span className="dg-pill-dot" aria-hidden="true" />
              {status.text}
            </span>
          )}
        </span>
      </div>

      <div className={`dg-bay${phase.kind === 'done' ? ' is-delivered' : ''}`}>
        <img
          className="dg-crate"
          src="/diggle/sealed-crate.png"
          alt="A sealed Diggle Machine crate"
          width={512}
          height={512}
        />
        {qty > 1 && phase.kind !== 'done' && <span className="dg-crate-count dg-pixel">&times;{qty}</span>}
      </div>

      <h2 className="dg-console-title">Diggle Machine</h2>
      <p className="dg-console-sub">
        Five slots of gear, sealed until the collection mints out.
      </p>

      <div className="dg-supply">
        <div className="dg-supply-row">
          <span className="dg-supply-left dg-pixel">{state ? left.toLocaleString() : '—'}</span>
          <span className="dg-supply-of">
            of {available ? available.toLocaleString() : '10,000'} left
          </span>
        </div>
        <div
          className="dg-meter"
          role="progressbar"
          aria-label="Machines minted"
          aria-valuemin={0}
          aria-valuemax={available || 10000}
          aria-valuenow={redeemed}
        >
          <span style={{ width: `${Math.max(claimed * 100, redeemed > 0 ? 0.8 : 0)}%` }} />
        </div>
        <span className="dg-supply-minted">{redeemed.toLocaleString()} minted</span>
      </div>

      <dl className="dg-terms">
        <div>
          <dt>Price</dt>
          <dd>{state?.priceSol != null ? sol(state.priceSol) : '—'}</dd>
        </div>
        <div>
          <dt>Per wallet</dt>
          <dd>{state?.mintLimit ? `${state.mintLimit.limit} max` : state ? 'No limit' : '—'}</dd>
        </div>
        <div>
          <dt>Royalty</dt>
          <dd>{state ? `${state.royaltyPercent}%` : '—'}</dd>
        </div>
      </dl>

      {phase.kind !== 'done' && (
        <>
          {address && walletInfo && state && !soldOut && walletLeft > 0 && maxQty > 1 && (
            <div className="dg-qty" role="group" aria-label="Quantity">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, qty - 1))}
                disabled={qty <= 1 || working}
                aria-label="One fewer"
              >
                &minus;
              </button>
              <output aria-live="polite">{qty}</output>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(maxQty, qty + 1))}
                disabled={qty >= maxQty || working}
                aria-label="One more"
              >
                +
              </button>
              <span className="dg-qty-note">
                {state.mintLimit ? `${walletLeft} left for this wallet` : `Up to ${MAX_BATCH} per approval`}
              </span>
            </div>
          )}

          <button
            type="button"
            className={`dg-btn dg-btn--primary dg-btn--xl${working ? ' is-working' : ''}`}
            onClick={action.onClick}
            disabled={!action.onClick}
          >
            {action.label}
          </button>
          {action.note &&
            (action.isError ? (
              <p className="dg-console-error" role="alert">
                {action.note}
              </p>
            ) : (
              <p className="dg-console-note">{action.note}</p>
            ))}

          {phase.kind === 'error' && (
            <p className="dg-console-error" role="alert">
              {phase.message}
            </p>
          )}
        </>
      )}

      {phase.kind === 'done' && <MintResult outcomes={phase.outcomes} onAgain={() => setPhase({ kind: 'idle' })} />}

      {address && (
        <p className="dg-console-wallet">
          <span className="dg-mono">{shortAddress(address)}</span>
          {walletInfo && (
            <>
              <span aria-hidden="true">·</span>
              <span>{sol(walletInfo.balanceSol)}</span>
              {state?.mintLimit && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    minted {walletInfo.minted}/{state.mintLimit.limit}
                  </span>
                </>
              )}
            </>
          )}
        </p>
      )}
    </div>
  );
};

const MintResult = ({ outcomes, onAgain }: { outcomes: MintOutcome[]; onAgain: () => void }) => {
  const minted = outcomes.filter((o) => o.status === 'minted');
  const others = outcomes.filter((o) => o.status !== 'minted');

  return (
    <div className="dg-result">
      {minted.length > 0 && (
        <>
          <p className="dg-result-head">
            {minted.length === 1 ? 'Crate secured.' : `${minted.length} crates secured.`}
          </p>
          <ul className="dg-result-list">
            {minted.map((o) => (
              <li key={o.mint}>
                <span className="dg-result-name">{o.name || 'Diggle Machine'}</span>
                <a href={explorer.token(o.mint)} target="_blank" rel="noreferrer">
                  View NFT
                </a>
                <a href={explorer.tx(o.signature)} target="_blank" rel="noreferrer">
                  Transaction
                </a>
              </li>
            ))}
          </ul>
          <p className="dg-console-note">
            Connect this wallet in Diggle and the crate&rsquo;s +25% XP and points apply from your next run.
          </p>
        </>
      )}

      {others.map((o, i) => (
        <p key={i} className="dg-console-error" role="alert">
          {o.status === 'rejected' ? (
            <>
              The candy machine rejected one mint, so no machine was created and its bot tax was charged.{' '}
              <a href={explorer.tx(o.signature)} target="_blank" rel="noreferrer">
                Transaction
              </a>
            </>
          ) : o.status === 'failed' ? (
            <>
              {describeMintError(o.error)}
              {o.signature && (
                <>
                  {' '}
                  <a href={explorer.tx(o.signature)} target="_blank" rel="noreferrer">
                    Transaction
                  </a>
                </>
              )}
            </>
          ) : null}
        </p>
      ))}

      <button type="button" className="dg-btn dg-btn--ghost" onClick={onAgain}>
        {minted.length > 0 ? 'Mint another' : 'Try again'}
      </button>
    </div>
  );
};

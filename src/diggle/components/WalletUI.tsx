import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState, type WalletName } from '@solana/wallet-adapter-base';
import { explorer } from '../config';
import { shortAddress } from '../format';

const GET_WALLETS = [
  { name: 'Phantom', url: 'https://phantom.app/download' },
  { name: 'Solflare', url: 'https://solflare.com/download' },
  { name: 'Backpack', url: 'https://backpack.app/download' },
];

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

/** Button for the top bar: connect, or show the connected address. */
export const WalletButton = ({ onOpen }: { onOpen: () => void }) => {
  const { publicKey, connecting } = useWallet();
  const address = publicKey?.toBase58();
  return (
    <button type="button" className={`dg-wallet-btn${address ? ' is-connected' : ''}`} onClick={onOpen}>
      {address ? (
        <>
          <span className="dg-wallet-dot" aria-hidden="true" />
          <span className="dg-mono">{shortAddress(address)}</span>
        </>
      ) : connecting ? (
        'Connecting…'
      ) : (
        'Connect wallet'
      )}
    </button>
  );
};

/** Wallet picker / account sheet. One instance, opened from anywhere. */
export const WalletModal = ({
  open,
  onClose,
  error,
}: {
  open: boolean;
  onClose: () => void;
  /** Last connection error from the wallet provider, if any. */
  error?: string | null;
}) => {
  const { wallets, wallet, select, connect, disconnect, publicKey, connecting } = useWallet();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  // Close once a picked wallet finishes connecting.
  const wasConnecting = useRef(false);
  useEffect(() => {
    if (open && wasConnecting.current && publicKey) onClose();
    wasConnecting.current = connecting;
  }, [connecting, publicKey, open, onClose]);

  if (!open) return null;

  const available = wallets.filter(
    (w) => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable,
  );

  const choose = (name: WalletName) => {
    // Picking a new wallet connects through the provider's autoConnect.
    // Re-picking the one that's already selected needs an explicit call.
    if (wallet?.adapter.name === name) connect().catch(() => undefined);
    else select(name);
  };

  const address = publicKey?.toBase58();

  return (
    <div className="dg-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="dg-modal dg-plate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dg-wallet-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="dg-modal-head">
          <h2 id="dg-wallet-title" className="dg-modal-title">
            {address ? 'Wallet' : 'Connect a wallet'}
          </h2>
          <button type="button" className="dg-icon-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {address ? (
          <div className="dg-account">
            <p className="dg-account-addr dg-mono">{address}</p>
            <div className="dg-account-actions">
              <button
                type="button"
                className="dg-btn dg-btn--ghost"
                onClick={() => {
                  void navigator.clipboard?.writeText(address).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  });
                }}
              >
                {copied ? 'Copied' : 'Copy address'}
              </button>
              <a className="dg-btn dg-btn--ghost" href={explorer.account(address)} target="_blank" rel="noreferrer">
                View on Solscan
              </a>
              <button
                type="button"
                className="dg-btn dg-btn--ghost"
                onClick={() => {
                  void disconnect();
                  onClose();
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : available.length > 0 ? (
          <>
          {error && (
            <p className="dg-console-error" role="alert">
              {error}
            </p>
          )}
          <ul className="dg-wallet-list">
            {available.map((w) => (
              <li key={w.adapter.name}>
                <button
                  type="button"
                  className="dg-wallet-option"
                  onClick={() => choose(w.adapter.name)}
                  disabled={connecting}
                >
                  <img src={w.adapter.icon} alt="" width={28} height={28} />
                  <span>{w.adapter.name}</span>
                  <span className="dg-wallet-state">
                    {connecting && wallet?.adapter.name === w.adapter.name
                      ? 'Connecting…'
                      : w.readyState === WalletReadyState.Installed
                        ? 'Detected'
                        : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          </>
        ) : (
          <div className="dg-no-wallet">
            <p>No Solana wallet found in this browser.</p>
            {isIOS() ? (
              <a
                className="dg-btn dg-btn--primary"
                href={`https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}?ref=${encodeURIComponent(window.location.origin)}`}
              >
                Open this page in Phantom
              </a>
            ) : (
              <div className="dg-account-actions">
                {GET_WALLETS.map((w) => (
                  <a key={w.name} className="dg-btn dg-btn--ghost" href={w.url} target="_blank" rel="noreferrer">
                    Get {w.name}
                  </a>
                ))}
              </div>
            )}
            <p className="dg-fine">On a Seeker or Saga, open this page in Chrome to use Seed Vault.</p>
          </div>
        )}
      </div>
    </div>
  );
};

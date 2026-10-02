import { useCallback, useEffect, useState } from 'react';
import type { PublicKey } from '@metaplex-foundation/umi';
import { NETWORK, RPC_HOST } from '../config';
import { describeReadError } from './errors';

/** Everything the mint console needs, read straight from chain. */
export interface CandyState {
  candyMachine: PublicKey;
  candyGuard: PublicKey;
  collectionMint: PublicKey;
  itemsAvailable: number;
  itemsRedeemed: number;
  priceSol: number | null;
  paymentDestination: PublicKey | null;
  mintLimit: { id: number; limit: number } | null;
  startsAt: Date | null;
  endsAt: Date | null;
  royaltyPercent: number;
  /** hiddenSettings.hash — the commitment to the reveal mapping. */
  revealHash: string | null;
}

export interface WalletMintInfo {
  minted: number;
  balanceSol: number;
}

// Metaplex is loaded on demand; see chainReads.ts.
const reads = () => import('./chainReads');

export const loadCandyState = async (): Promise<CandyState> => (await reads()).loadCandyState();

export const loadWalletMintInfo = async (state: CandyState, owner: string): Promise<WalletMintInfo> =>
  (await reads()).loadWalletMintInfo(state, owner);

const logReadFailure = (e: unknown) =>
  console.error(
    `Diggle: couldn't read the ${NETWORK.label} candy machine ${NETWORK.candyMachine} via ${RPC_HOST}`,
    e,
  );

/** Candy machine state, refreshed on an interval while the tab is visible. */
export function useCandyState(pollMs = 20_000) {
  const [state, setState] = useState<CandyState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setState(await loadCandyState());
      setError(null);
    } catch (e) {
      logReadFailure(e);
      setError(describeReadError(e));
    }
  }, []);

  // State is only set from the promise callbacks, and never after unmount.
  useEffect(() => {
    let cancelled = false;
    const poll = () =>
      loadCandyState().then(
        (next) => {
          if (cancelled) return;
          setState(next);
          setError(null);
        },
        (e: unknown) => {
          if (cancelled) return;
          logReadFailure(e);
          setError(describeReadError(e));
        },
      );
    void poll();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void poll();
    }, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return { state, error, refresh };
}

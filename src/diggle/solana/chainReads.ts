// Chain reads for the Diggle mint console. Split from candyState.ts and
// only ever loaded through a dynamic import, so Metaplex (the bulk of the
// page's JavaScript) arrives after first paint instead of blocking it.
import { isSome, publicKey, type Umi } from '@metaplex-foundation/umi';
import {
  fetchCandyMachine,
  safeFetchCandyGuard,
  safeFetchMintCounterFromSeeds,
} from '@metaplex-foundation/mpl-candy-machine';
import { NETWORK } from '../config';
import { createDiggleUmi } from './umi';
import type { CandyState, WalletMintInfo } from './candyState';

let readUmi: Umi | null = null;

/** A signer-less Umi for reads; the mint builds its own with the wallet. */
export const getReadUmi = (): Umi => {
  readUmi ??= createDiggleUmi();
  return readUmi;
};

const toDate = (unixSeconds: bigint): Date => new Date(Number(unixSeconds) * 1000);

// Sugar stores the MD5 hex digest as 32 ASCII bytes. Show it as text when
// that's what it is, and fall back to hex for anything else.
const decodeHash = (bytes: Uint8Array): string => {
  const text = new TextDecoder().decode(bytes).replace(/\0+$/, '');
  if (/^[0-9a-f]{32}$/i.test(text)) return text;
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

export async function loadCandyState(): Promise<CandyState> {
  const umi = getReadUmi();
  const cm = await fetchCandyMachine(umi, publicKey(NETWORK.candyMachine));
  const guard = await safeFetchCandyGuard(umi, cm.mintAuthority);
  if (!guard) {
    throw new Error('This candy machine has no candy guard, so it cannot be minted from the web.');
  }

  const g = guard.guards;
  const sol = isSome(g.solPayment) ? g.solPayment.value : null;
  const hidden = isSome(cm.data.hiddenSettings) ? cm.data.hiddenSettings.value : null;

  return {
    candyMachine: cm.publicKey,
    candyGuard: guard.publicKey,
    collectionMint: cm.collectionMint,
    itemsAvailable: Number(cm.data.itemsAvailable),
    itemsRedeemed: Number(cm.itemsRedeemed),
    priceSol: sol ? Number(sol.lamports.basisPoints) / 1e9 : null,
    paymentDestination: sol ? sol.destination : null,
    mintLimit: isSome(g.mintLimit) ? g.mintLimit.value : null,
    startsAt: isSome(g.startDate) ? toDate(g.startDate.value.date) : null,
    endsAt: isSome(g.endDate) ? toDate(g.endDate.value.date) : null,
    royaltyPercent: Number(cm.data.sellerFeeBasisPoints.basisPoints) / 100,
    revealHash: hidden ? decodeHash(hidden.hash) : null,
  };
}

export async function loadWalletMintInfo(state: CandyState, owner: string): Promise<WalletMintInfo> {
  const umi = getReadUmi();
  const user = publicKey(owner);
  const [counter, balance] = await Promise.all([
    state.mintLimit
      ? safeFetchMintCounterFromSeeds(umi, {
          id: state.mintLimit.id,
          user,
          candyMachine: state.candyMachine,
          candyGuard: state.candyGuard,
        })
      : Promise.resolve(null),
    umi.rpc.getBalance(user),
  ]);
  return { minted: counter?.count ?? 0, balanceSol: Number(balance.basisPoints) / 1e9 };
}

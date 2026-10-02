import {
  generateSigner,
  signAllTransactions,
  some,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { base58 } from '@metaplex-foundation/umi/serializers';
import { walletAdapterIdentity, type WalletAdapter } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mintV2 } from '@metaplex-foundation/mpl-candy-machine';
import { fetchMetadataFromSeeds, safeFetchMetadataFromSeeds } from '@metaplex-foundation/mpl-token-metadata';
import { setComputeUnitLimit, setComputeUnitPrice } from '@metaplex-foundation/mpl-toolbox';
import { COMPUTE_UNITS, PRIORITY_MICRO_LAMPORTS } from '../config';
import type { CandyState } from './candyState';
import { createDiggleUmi } from './umi';

export type MintStage = 'preparing' | 'approving' | 'sending' | 'confirming';

export type MintOutcome =
  | { status: 'minted'; mint: string; signature: string; name: string | null }
  /** Transaction landed, but a guard rejected it and bot tax was charged. */
  | { status: 'rejected'; signature: string }
  | { status: 'failed'; signature: string | null; error: unknown };

/**
 * Mint `quantity` machines in one wallet approval.
 *
 * Each machine needs its own transaction (its own fresh mint keypair), so
 * the transactions are built together and signed with signAllTransactions.
 * Everything the guard needs — payment destination, mint-limit id — comes
 * from the chain state the console already loaded, so a sugar guard update
 * never requires a site deploy.
 */
export async function mintMachines({
  wallet,
  state,
  quantity,
  onStage,
}: {
  wallet: WalletAdapter;
  state: CandyState;
  quantity: number;
  onStage: (stage: MintStage) => void;
}): Promise<MintOutcome[]> {
  onStage('preparing');

  const umi = createDiggleUmi().use(walletAdapterIdentity(wallet));

  // mintV2 needs the collection's update authority; read it rather than
  // hardcode it, so devnet and mainnet both just work.
  const collection = await fetchMetadataFromSeeds(umi, { mint: state.collectionMint });

  const mintArgs = {
    ...(state.paymentDestination ? { solPayment: some({ destination: state.paymentDestination }) } : {}),
    ...(state.mintLimit ? { mintLimit: some({ id: state.mintLimit.id }) } : {}),
  };

  const jobs = Array.from({ length: quantity }, () => {
    const nftMint = generateSigner(umi);
    const builder = transactionBuilder()
      .add(setComputeUnitLimit(umi, { units: COMPUTE_UNITS }))
      .add(setComputeUnitPrice(umi, { microLamports: PRIORITY_MICRO_LAMPORTS }))
      .add(
        mintV2(umi, {
          candyMachine: state.candyMachine,
          candyGuard: state.candyGuard,
          nftMint,
          collectionMint: state.collectionMint,
          collectionUpdateAuthority: collection.updateAuthority,
          mintArgs,
        }),
      );
    return { nftMint, builder };
  });

  const blockhash = await umi.rpc.getLatestBlockhash({ commitment: 'confirmed' });
  const unsigned = jobs.map(({ builder }) => ({
    transaction: builder.setBlockhash(blockhash).build(umi),
    signers: builder.getSigners(umi),
  }));

  onStage('approving');
  const signed = await signAllTransactions(unsigned);

  // Send one at a time. If a later send fails, the earlier ones may still
  // have landed — they're confirmed and reported, never silently dropped.
  onStage('sending');
  const sent: { index: number; signature: Uint8Array }[] = [];
  const outcomes: MintOutcome[] = [];
  for (let i = 0; i < signed.length; i++) {
    try {
      sent.push({ index: i, signature: await umi.rpc.sendTransaction(signed[i], { skipPreflight: false }) });
    } catch (error) {
      if (sent.length === 0) throw error;
      for (let j = i; j < signed.length; j++) outcomes.push({ status: 'failed', signature: null, error });
      break;
    }
  }

  onStage('confirming');
  for (const { index, signature } of sent) {
    const sig = base58.deserialize(signature)[0];
    try {
      const result = await umi.rpc.confirmTransaction(signature, {
        strategy: { type: 'blockhash', ...blockhash },
        commitment: 'confirmed',
      });
      if (result.value.err) {
        outcomes.push({ status: 'failed', signature: sig, error: result.value.err });
        continue;
      }

      // With a bot-tax guard, a failed guard check does not fail the
      // transaction: it lands, charges the tax, and mints nothing. The mint
      // account existing is the only honest proof a machine was created.
      const mint = jobs[index].nftMint.publicKey;
      if (!(await umi.rpc.accountExists(mint, { commitment: 'confirmed' }))) {
        outcomes.push({ status: 'rejected', signature: sig });
        continue;
      }

      const metadata = await safeFetchMetadataFromSeeds(umi, { mint }).catch(() => null);
      outcomes.push({
        status: 'minted',
        mint: mint.toString(),
        signature: sig,
        name: metadata ? metadata.name.replace(/\0/g, '').trim() : null,
      });
    } catch (error) {
      outcomes.push({ status: 'failed', signature: sig, error });
    }
  }

  return outcomes;
}

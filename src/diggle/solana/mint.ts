import {
  generateSigner,
  signAllTransactions,
  some,
  transactionBuilder,
  type KeypairSigner,
  type Transaction,
  type TransactionBuilder,
  type Umi,
} from '@metaplex-foundation/umi';
import { base58 } from '@metaplex-foundation/umi/serializers';
import { walletAdapterIdentity, type WalletAdapter } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mintV2 } from '@metaplex-foundation/mpl-candy-machine';
import { fetchMetadataFromSeeds, safeFetchMetadataFromSeeds } from '@metaplex-foundation/mpl-token-metadata';
import { setComputeUnitLimit, setComputeUnitPrice } from '@metaplex-foundation/mpl-toolbox';
import { Connection, PublicKey as Web3PublicKey, VersionedTransaction } from '@solana/web3.js';
import { COMPUTE_UNITS, NETWORK, PRIORITY_MICRO_LAMPORTS } from '../config';
import type { CandyState } from './candyState';
import { createDiggleUmi } from './umi';

export type MintStage = 'preparing' | 'approving' | 'sending' | 'confirming';

export type MintOutcome =
  | { status: 'minted'; mint: string; signature: string; name: string | null }
  /** Transaction landed, but a guard rejected it and bot tax was charged. */
  | { status: 'rejected'; signature: string }
  | { status: 'failed'; signature: string | null; error: unknown };

/** What one approval costs, measured by simulating the exact transactions
 *  the wallet will be asked to sign. All amounts in lamports, all machines. */
export interface MintQuote {
  quantity: number;
  /** The guard's SOL payment, paid to `destination`. */
  price: bigint;
  /** Rent locked in each new NFT's accounts (mint, token account, metadata, edition). */
  rent: bigint;
  /** Network and priority fees. */
  fee: bigint;
  total: bigint;
  destination: string | null;
}

interface Job {
  nftMint: KeypairSigner;
  builder: TransactionBuilder;
}

/** A checked mint, ready to send to the wallet. Opaque outside this module. */
export interface PreparedMint {
  quote: MintQuote;
  umi: Umi;
  jobs: Job[];
  priceEach: bigint;
}

/** The candy machine would refuse this mint, so the wallet is never opened. */
export class MintCheckError extends Error {
  readonly logs: string[];

  constructor(reason: string, logs: string[] | null | undefined) {
    const tail = (logs ?? []).filter((l) => !/^Program \w+ (invoke|consumed|success)/.test(l)).slice(-6);
    super([reason, ...tail].join(' | '));
    this.name = 'MintCheckError';
    this.logs = logs ?? [];
  }
}

/**
 * Build `quantity` mint transactions and simulate each one before anything
 * reaches the wallet. A mint the guard would reject — over the wallet limit,
 * sold out, not open, not enough SOL — throws `MintCheckError` instead of
 * prompting a signature for a transaction that would fail or, with bot tax,
 * land and charge 0.01 SOL for nothing.
 *
 * Each machine needs its own transaction (its own fresh mint keypair).
 * Everything the guard needs — payment destination, mint-limit id — comes
 * from the chain state the console already loaded, so a sugar guard update
 * never requires a site deploy.
 */
export async function prepareMint({
  wallet,
  state,
  quantity,
}: {
  wallet: WalletAdapter;
  state: CandyState;
  quantity: number;
}): Promise<PreparedMint> {
  const umi = createDiggleUmi().use(walletAdapterIdentity(wallet));

  // mintV2 needs the collection's update authority; read it rather than
  // hardcode it, so devnet and mainnet both just work.
  const collection = await fetchMetadataFromSeeds(umi, { mint: state.collectionMint });

  const mintArgs = {
    ...(state.paymentDestination ? { solPayment: some({ destination: state.paymentDestination }) } : {}),
    ...(state.mintLimit ? { mintLimit: some({ id: state.mintLimit.id }) } : {}),
  };

  const jobs: Job[] = Array.from({ length: quantity }, () => {
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

  const priceEach = state.priceSol != null ? BigInt(Math.round(state.priceSol * 1e9)) : 0n;
  const { rent, fee } = await buildAndCheck(umi, jobs, priceEach);
  const price = priceEach * BigInt(quantity);

  return {
    umi,
    jobs,
    priceEach,
    quote: {
      quantity,
      price,
      rent,
      fee,
      total: price + rent + fee,
      destination: state.paymentDestination?.toString() ?? null,
    },
  };
}

/**
 * Sign and send a prepared mint in one wallet approval.
 *
 * The transactions are rebuilt on a fresh blockhash and checked again, so a
 * review left open for a while can't hand the wallet an expired or newly
 * failing transaction. The wallet signs first (Umi orders the payer ahead of
 * the mint keypairs), which is what Phantom requires to simulate and guard a
 * multi-signer transaction.
 */
export async function approveMint(
  prepared: PreparedMint,
  onStage: (stage: MintStage) => void,
): Promise<MintOutcome[]> {
  const { umi, jobs, priceEach } = prepared;

  onStage('preparing');
  const { transactions, blockhash } = await buildAndCheck(umi, jobs, priceEach);

  onStage('approving');
  const signed = await signAllTransactions(
    transactions.map((transaction, i) => ({ transaction, signers: jobs[i].builder.getSigners(umi) })),
  );

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

/**
 * Build every job on one fresh blockhash and simulate each transaction
 * without signatures. Returns the unsigned transactions plus the rent and
 * fees the simulation measured.
 *
 * Bot tax makes a rejected mint look like a successful transaction, so the
 * simulation also reads the new mint account back: if it wasn't created, the
 * guard refused the mint and this throws rather than letting the wallet
 * charge the tax.
 */
async function buildAndCheck(umi: Umi, jobs: Job[], priceEach: bigint) {
  const connection = new Connection(NETWORK.rpc, 'confirmed');
  const payer = new Web3PublicKey(umi.payer.publicKey.toString());

  const [blockhash, balance] = await Promise.all([
    umi.rpc.getLatestBlockhash({ commitment: 'confirmed' }),
    connection.getBalance(payer, 'confirmed'),
  ]);
  const before = BigInt(balance);
  const transactions: Transaction[] = jobs.map(({ builder }) => builder.setBlockhash(blockhash).build(umi));

  let rent = 0n;
  let fee = 0n;
  for (let i = 0; i < transactions.length; i++) {
    const tx = VersionedTransaction.deserialize(umi.transactions.serialize(transactions[i]));
    const [sim, feeForMessage] = await Promise.all([
      connection.simulateTransaction(tx, {
        sigVerify: false,
        replaceRecentBlockhash: true,
        commitment: 'confirmed',
        accounts: { encoding: 'base64', addresses: [payer.toBase58(), jobs[i].nftMint.publicKey.toString()] },
      }),
      connection.getFeeForMessage(tx.message, 'confirmed'),
    ]);

    const { err, logs, accounts } = sim.value;
    if (err) throw new MintCheckError(typeof err === 'string' ? err : JSON.stringify(err), logs);

    const [payerAfter, mintAfter] = accounts ?? [];
    if (!mintAfter || mintAfter.lamports === 0) throw new MintCheckError('BotTax', logs);

    // The simulated payer balance already has the fee taken out, so what's
    // left after the price and the fee is rent for the new accounts.
    const txFee = BigInt(feeForMessage.value ?? 0);
    const spent = payerAfter ? before - BigInt(payerAfter.lamports) : 0n;
    rent += spent > priceEach + txFee ? spent - priceEach - txFee : 0n;
    fee += txFee;
  }

  return { transactions, blockhash, rent, fee };
}

// Diggle site configuration.
//
// The mint is built in the browser with Metaplex Umi, so everything the
// page needs is the candy machine address and an RPC endpoint. The guard,
// collection, price and per-wallet limit are all read from chain at
// runtime — change them with sugar and this page follows.

export type Cluster = 'mainnet' | 'devnet';

interface NetworkConfig {
  cluster: Cluster;
  rpc: string;
  candyMachine: string;
  explorerSuffix: string;
}

const NETWORKS: Record<Cluster, NetworkConfig> = {
  mainnet: {
    cluster: 'mainnet',
    // Public RPC works for reads but is rate-limited. Set
    // VITE_SOLANA_RPC_MAINNET to a domain-restricted Helius (or similar)
    // endpoint before launch traffic arrives.
    rpc: import.meta.env.VITE_SOLANA_RPC_MAINNET || 'https://api.mainnet-beta.solana.com',
    candyMachine: '7LtViZU4Y672qZVC6jxHPipVEHXeCKUcKR6cG8zMCwqP',
    explorerSuffix: '',
  },
  devnet: {
    cluster: 'devnet',
    rpc: import.meta.env.VITE_SOLANA_RPC_DEVNET || 'https://api.devnet.solana.com',
    candyMachine: '3iniDHsBymdEdxB7yvRG4sE11JXP1d89dqvXfTsXWNr2',
    explorerSuffix: '?cluster=devnet',
  },
};

// `?cluster=devnet` switches the whole page to the devnet candy machine,
// so the real mint flow can be rehearsed with a devnet wallet on the
// deployed site. The page shows a DEVNET banner while it's active.
const requested = new URLSearchParams(window.location.search).get('cluster');
const envCluster = import.meta.env.VITE_DIGGLE_CLUSTER;

export const CLUSTER: Cluster =
  requested === 'devnet' || (requested !== 'mainnet' && envCluster === 'devnet')
    ? 'devnet'
    : 'mainnet';

export const NETWORK = NETWORKS[CLUSTER];

export const explorer = {
  token: (mint: string) => `https://solscan.io/token/${mint}${NETWORK.explorerSuffix}`,
  account: (address: string) => `https://solscan.io/account/${address}${NETWORK.explorerSuffix}`,
  tx: (signature: string) => `https://solscan.io/tx/${signature}${NETWORK.explorerSuffix}`,
};

export const LINKS = {
  x: 'https://x.com/DiggleOnSol',
  xHandle: '@DiggleOnSol',
  discord: 'https://discord.gg/QH4uUfK2wR',
  // Solana Mobile's documented listing deep link. Resolves only on a
  // device with the dApp Store installed (Seeker, Saga).
  dappStore: 'solanadappstore://details?id=com.example.diggle',
  support: 'mailto:support.diggle@proton.me',
};

// Headroom per mint for rent (mint, metadata, edition, token account) and
// fees, on top of the guard's SOL payment. Used only to warn early.
export const MINT_OVERHEAD_SOL = 0.02;

// Mirrors the priority settings the game's mint path has used on mainnet.
export const COMPUTE_UNITS = 400_000;
export const PRIORITY_MICRO_LAMPORTS = 50_000;

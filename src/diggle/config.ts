// Diggle site configuration.
//
// The mint is built in the browser with Metaplex Umi, so everything the
// page needs is the candy machine address and an RPC endpoint. The guard,
// collection, price and per-wallet limit are all read from chain at
// runtime — change them with sugar and this page follows.

export type Cluster = 'mainnet' | 'devnet';

interface NetworkConfig {
  cluster: Cluster;
  label: string;
  rpc: string;
  /** True when the RPC came from an env var rather than the public fallback. */
  customRpc: boolean;
  candyMachine: string;
  explorerSuffix: string;
}

const mainnetRpc = import.meta.env.VITE_SOLANA_RPC_MAINNET;
const devnetRpc = import.meta.env.VITE_SOLANA_RPC_DEVNET;

const NETWORKS: Record<Cluster, NetworkConfig> = {
  mainnet: {
    cluster: 'mainnet',
    label: 'Mainnet',
    // api.mainnet-beta.solana.com answers browser requests with 403 Access
    // forbidden, so it can't be the fallback. PublicNode's free endpoint
    // accepts them (verified 2026-10-02) and keeps the page working with no
    // config. For launch traffic, set VITE_SOLANA_RPC_MAINNET to your own
    // endpoint (e.g. Helius) with this domain on its allowlist — the URL
    // ships to the browser, so a key in it is public.
    rpc: mainnetRpc || 'https://solana-rpc.publicnode.com',
    customRpc: !!mainnetRpc,
    candyMachine: '7LtViZU4Y672qZVC6jxHPipVEHXeCKUcKR6cG8zMCwqP',
    explorerSuffix: '',
  },
  devnet: {
    cluster: 'devnet',
    label: 'Devnet',
    rpc: devnetRpc || 'https://api.devnet.solana.com',
    customRpc: !!devnetRpc,
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

/** Hostname only — an API key in the URL's path or query never displays. */
export const RPC_HOST = (() => {
  try {
    return new URL(NETWORK.rpc).host;
  } catch {
    return 'RPC';
  }
})();

/** The env var that overrides this cluster's RPC, for error messages. */
export const RPC_ENV_VAR = CLUSTER === 'devnet' ? 'VITE_SOLANA_RPC_DEVNET' : 'VITE_SOLANA_RPC_MAINNET';

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

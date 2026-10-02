import { useMemo, type ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import type { WalletError } from '@solana/wallet-adapter-base';
import { NETWORK } from '../config';

// An empty adapter list is deliberate. Phantom, Solflare, Backpack and the
// rest register themselves through Wallet Standard, and on Android the
// provider injects the Mobile Wallet Adapter on its own — which is what
// lets Seeker owners mint from Chrome with Seed Vault.
export const SolanaProviders = ({
  children,
  onWalletError,
}: {
  children: ReactNode;
  onWalletError?: (error: WalletError) => void;
}) => {
  const wallets = useMemo(() => [], []);
  return (
    <ConnectionProvider endpoint={NETWORK.rpc} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect onError={onWalletError}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Turn wallet, RPC and candy-guard failures into something a player can
// act on. Matching is on message text because the errors arrive from four
// different libraries with no shared type.

const messageOf = (e: unknown): string => {
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  if (typeof e === 'string') return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
};

export function describeMintError(e: unknown): string {
  const m = messageOf(e);

  if (/reject|denied|declin|cancel/i.test(m)) return 'Cancelled in your wallet. Nothing was charged.';
  if (/blockhash|block height exceeded|expired/i.test(m)) {
    return 'The transaction expired before it was approved. Try again — it only takes a moment.';
  }
  if (/insufficient (funds|lamports)|0x1\b|debit an account/i.test(m)) {
    return 'Not enough SOL to cover the mint, rent and network fees.';
  }
  if (/mint ?limit|maximum.*mint|MintLimit/i.test(m)) return 'This wallet has reached its mint limit.';
  if (/empty|sold ?out|NotEnoughItems|CandyMachineEmpty/i.test(m)) return 'Sold out — every machine has been claimed.';
  if (/not live|MintNotLive|start ?date|after ?end/i.test(m)) return 'Minting is not open right now.';
  if (/not connected|WalletNotConnected|Uninitialized/i.test(m)) return 'Connect a wallet first.';
  if (/signAllTransactions|OperationNotSupported/i.test(m)) {
    return 'This wallet can’t sign several transactions at once. Mint one machine at a time.';
  }
  if (/429|rate limit|Too Many Requests/i.test(m)) return 'The network is busy. Wait a few seconds and try again.';

  return `Something went wrong: ${m.slice(0, 160)}`;
}

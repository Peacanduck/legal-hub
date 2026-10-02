// Turn wallet, RPC and candy-guard failures into something a player can
// act on. Matching is on message text because the errors arrive from four
// different libraries with no shared type.

import { NETWORK, RPC_ENV_VAR, RPC_HOST } from '../config';

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

/** Why the candy machine couldn't be read. Names the endpoint and, when the
 *  fix is a config change, the env var that makes it. */
export function describeReadError(e: unknown): string {
  const m = messageOf(e);

  if (/\b40[13]\b|forbidden|unauthori[sz]ed|api key/i.test(m)) {
    return `${RPC_HOST} refused requests from this site (403). Point ${RPC_ENV_VAR} at an RPC endpoint that allows browser requests.`;
  }
  if (/\b429\b|too many requests|rate limit/i.test(m)) {
    return `${RPC_HOST} is rate-limiting requests. The page retries every 20 seconds.`;
  }
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(m)) {
    return `Couldn’t reach ${RPC_HOST}. Check your connection.`;
  }
  if (/was not found|account.*not found|AccountNotFound/i.test(m)) {
    return `No candy machine at ${NETWORK.candyMachine.slice(0, 4)}… on ${NETWORK.label}.`;
  }
  return m.slice(0, 200);
}

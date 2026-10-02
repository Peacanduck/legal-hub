// web3.js, the wallet adapters and parts of the Metaplex stack still reach
// for Node's `Buffer` and `global` in a few browser paths (without `global`
// the candy machine read throws on load). Imported first by the Diggle page
// so it runs before any Solana module evaluates — including the ones loaded
// later by dynamic import — and only in the Diggle chunk, never the rest of
// the site.
import { Buffer } from 'buffer';

const g = globalThis as unknown as { Buffer?: typeof Buffer; global?: typeof globalThis };
if (!g.global) g.global = globalThis;
if (!g.Buffer) g.Buffer = Buffer;

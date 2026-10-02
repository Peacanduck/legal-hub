import { createUmi as createBaseUmi, type Umi } from '@metaplex-foundation/umi';
import { dataViewSerializer } from '@metaplex-foundation/umi-serializer-data-view';
import { defaultProgramRepository } from '@metaplex-foundation/umi-program-repository';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { web3JsRpc } from '@metaplex-foundation/umi-rpc-web3js';
import { chunkGetAccountsRpc } from '@metaplex-foundation/umi-rpc-chunk-get-accounts';
import { web3JsTransactionFactory } from '@metaplex-foundation/umi-transaction-factory-web3js';
import { mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { NETWORK } from '../config';

/**
 * Umi assembled from only what the mint uses.
 *
 * umi-bundle-defaults also installs an HTTP client and an off-chain JSON
 * downloader. The mint never fetches off-chain data, and that HTTP client
 * drags in node-fetch's Node build, which crashes in the browser under
 * Vite. Everything here is on-chain reads, PDA maths and transactions.
 */
export const createDiggleUmi = (): Umi =>
  createBaseUmi()
    .use(dataViewSerializer())
    .use(defaultProgramRepository())
    .use(web3JsEddsa())
    .use(web3JsRpc(NETWORK.rpc, { commitment: 'confirmed' }))
    .use(chunkGetAccountsRpc())
    .use(web3JsTransactionFactory())
    .use(mplCandyMachine())
    .use(mplTokenMetadata());

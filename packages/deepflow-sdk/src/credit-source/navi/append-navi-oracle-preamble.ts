import { getPool, updateOraclePriceBeforeUserOperationPTB } from "@naviprotocol/lending";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import { NAVI_ENV, NAVI_MAIN_MARKET } from "./constants.ts";
import { resolveNaviPoolKey } from "./resolve-navi-pool-key.ts";

/** Refresh on-chain NAVI oracle state before the first lending op in a PTB (not for swap quoting). */
export async function appendNaviOraclePreamble(
  tx: Transaction,
  sender: string,
  assets: readonly string[],
  client: SuiJsonRpcClient,
): Promise<void> {
  const uniqueAssets = [...new Set(assets)];
  const pools = await Promise.all(
    uniqueAssets.map(async (asset) => {
      const poolKey = await resolveNaviPoolKey(asset);
      return getPool(poolKey, { env: NAVI_ENV, market: NAVI_MAIN_MARKET });
    }),
  );

  await updateOraclePriceBeforeUserOperationPTB(tx, sender, pools, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
    client,
  });
}

import { depositCoinPTB, getPool } from "@naviprotocol/lending";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import { appendNaviOraclePreamble } from "../credit-source/navi/append-navi-oracle-preamble.ts";
import { toSafeAmountNumber } from "../credit-source/navi/amount.ts";
import { NAVI_ENV, NAVI_MAIN_MARKET } from "../credit-source/navi/constants.ts";
import { resolveNaviPoolKey } from "../credit-source/navi/resolve-navi-pool-key.ts";
import {
  appendDeepbookWithdrawCoin,
  resolveDeepbookCoinType,
} from "./append-deepbook-withdraw-coin.ts";

export interface BuildDeepbookSupplyNaviTxParams {
  sender: string;
  asset: string;
  assetSymbol?: string;
  amount: bigint;
  managerId: string;
  client: SuiJsonRpcClient;
}

export async function buildDeepbookSupplyNaviTx(
  params: BuildDeepbookSupplyNaviTxParams,
): Promise<Transaction> {
  const { sender, asset, assetSymbol, amount, managerId, client } = params;
  const amountNumber = toSafeAmountNumber(amount, "supply amount");
  const deepbookAsset = assetSymbol ?? asset;

  const poolKey = await resolveNaviPoolKey(asset);
  const pool = await getPool(poolKey, { env: NAVI_ENV, market: NAVI_MAIN_MARKET });
  const coinType = pool.suiCoinType;
  const deepbookCoinType = resolveDeepbookCoinType(deepbookAsset);

  if (coinType !== deepbookCoinType) {
    throw new Error(
      `DeepBook coin type mismatch for ${deepbookAsset}: NAVI=${coinType}, DeepBook=${deepbookCoinType}`,
    );
  }

  const tx = new Transaction();
  tx.setSender(sender);

  const withdrawnCoin = appendDeepbookWithdrawCoin(tx, {
    managerId,
    coinType,
    amount,
  });

  await appendNaviOraclePreamble(tx, sender, [deepbookAsset], client);

  await depositCoinPTB(tx, poolKey, withdrawnCoin as never, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
    amount: amountNumber,
  });

  return tx;
}

import { withdrawCoinPTB } from "@naviprotocol/lending";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import { appendNaviOraclePreamble } from "./append-navi-oracle-preamble.ts";
import { toSafeAmountNumber } from "./amount.ts";
import { NAVI_ENV, NAVI_MAIN_MARKET } from "./constants.ts";
import { resolveNaviPoolKey } from "./resolve-navi-pool-key.ts";

export interface BuildNaviWithdrawTxParams {
  sender: string;
  asset: string;
  assetSymbol?: string;
  amount: bigint;
  client: SuiJsonRpcClient;
}

export async function buildNaviWithdrawTx(
  params: BuildNaviWithdrawTxParams,
): Promise<Transaction> {
  const { sender, asset, amount, client } = params;
  const amountNumber = toSafeAmountNumber(amount, "withdraw amount");

  const poolKey = await resolveNaviPoolKey(asset);

  const tx = new Transaction();
  tx.setSender(sender);

  await appendNaviOraclePreamble(tx, sender, [asset], client);

  const withdrawnCoin = await withdrawCoinPTB(tx, poolKey, amountNumber, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
  });

  tx.transferObjects([withdrawnCoin], sender);

  return tx;
}

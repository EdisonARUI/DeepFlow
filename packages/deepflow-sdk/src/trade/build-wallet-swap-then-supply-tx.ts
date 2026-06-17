import { depositCoinPTB } from "@naviprotocol/lending";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import { appendNaviOraclePreamble } from "../credit-source/navi/append-navi-oracle-preamble.ts";
import { NAVI_ENV, NAVI_MAIN_MARKET } from "../credit-source/navi/constants.ts";
import { resolveNaviPoolKey } from "../credit-source/navi/resolve-navi-pool-key.ts";
import {
  appendDeepbookSwap,
  createDeepbookContract,
  mergeWalletInputCoin,
  requireNaviClient,
  validateSwapLegParams,
  type TradeSwapLegParams,
} from "./resolve-deepbook-swap.ts";

export interface BuildWalletSwapThenSupplyTxParams extends TradeSwapLegParams {}

export async function buildWalletSwapThenSupplyTx(
  params: BuildWalletSwapThenSupplyTxParams,
): Promise<Transaction> {
  const {
    sender,
    poolKey,
    inputAsset,
    outputAsset,
    inputAmount,
    minOutput,
    deepAmount,
    client,
  } = params;

  const { isBaseToCoin } = validateSwapLegParams(params);

  const tx = new Transaction();
  tx.setSender(sender);

  const inputCoin = await mergeWalletInputCoin(tx, sender, inputAsset, inputAmount, requireNaviClient(client));
  const deepBook = createDeepbookContract(sender);

  const { inputChange, outputCoin, deepChange } = appendDeepbookSwap(tx, deepBook, {
    poolKey,
    inputCoin,
    inputAmount,
    minOutput,
    isBaseToCoin,
    deepAmount,
  });

  tx.transferObjects([inputChange, deepChange], sender);

  await appendNaviOraclePreamble(tx, sender, [outputAsset], requireNaviClient(client));

  const outputPoolKey = await resolveNaviPoolKey(outputAsset);
  await depositCoinPTB(tx, outputPoolKey, outputCoin, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
  });

  return tx;
}

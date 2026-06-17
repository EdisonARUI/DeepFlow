import { depositCoinPTB } from "@naviprotocol/lending";
import { Transaction } from "@mysten/sui/transactions";

import { appendNaviOraclePreamble } from "../credit-source/navi/append-navi-oracle-preamble.ts";
import { NAVI_ENV, NAVI_MAIN_MARKET } from "../credit-source/navi/constants.ts";
import { resolveNaviPoolKey } from "../credit-source/navi/resolve-navi-pool-key.ts";
import { appendSuilendWithdraw } from "../credit-source/suilend/append-suilend-swap-leg.ts";
import {
  appendDeepbookSwap,
  createDeepbookContract,
  requireNaviClient,
  validateSwapLegParams,
  type TradeSwapLegParams,
} from "./resolve-deepbook-swap.ts";

export interface BuildSuilendSwapThenSupplyNaviTxParams extends TradeSwapLegParams {}

export async function buildSuilendSwapThenSupplyNaviTx(
  params: BuildSuilendSwapThenSupplyNaviTxParams,
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
  const naviClient = requireNaviClient(client);

  const tx = new Transaction();
  tx.setSender(sender);

  const withdrawnInputCoin = await appendSuilendWithdraw(tx, {
    sender,
    inputAsset,
    inputAmount,
  });

  const deepBook = createDeepbookContract(sender);

  const { inputChange, outputCoin, deepChange } = appendDeepbookSwap(tx, deepBook, {
    poolKey,
    inputCoin: withdrawnInputCoin,
    inputAmount,
    minOutput,
    isBaseToCoin,
    deepAmount,
  });

  tx.transferObjects([inputChange, deepChange], sender);

  await appendNaviOraclePreamble(tx, sender, [outputAsset], naviClient);

  const outputPoolKey = await resolveNaviPoolKey(outputAsset);
  await depositCoinPTB(tx, outputPoolKey, outputCoin, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
  });

  return tx;
}

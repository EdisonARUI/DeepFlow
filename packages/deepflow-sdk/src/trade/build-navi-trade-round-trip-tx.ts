import { depositCoinPTB, withdrawCoinPTB } from "@naviprotocol/lending";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import { appendNaviOraclePreamble } from "../credit-source/navi/append-navi-oracle-preamble.ts";
import { toSafeAmountNumber } from "../credit-source/navi/amount.ts";
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

export interface BuildNaviTradeRoundTripTxParams extends TradeSwapLegParams {}

export async function buildNaviTradeRoundTripTx(
  params: BuildNaviTradeRoundTripTxParams,
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

  const withdrawAmountNumber = toSafeAmountNumber(inputAmount, "withdraw amount");
  const inputPoolKey = await resolveNaviPoolKey(inputAsset);

  const tx = new Transaction();
  tx.setSender(sender);

  await appendNaviOraclePreamble(tx, sender, [inputAsset, outputAsset], requireNaviClient(client));

  const withdrawnInputCoin = await withdrawCoinPTB(tx, inputPoolKey, withdrawAmountNumber, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
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

  const outputPoolKey = await resolveNaviPoolKey(outputAsset);
  await depositCoinPTB(tx, outputPoolKey, outputCoin, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
  });

  return tx;
}

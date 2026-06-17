import { withdrawCoinPTB } from "@naviprotocol/lending";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import { appendNaviOraclePreamble } from "../credit-source/navi/append-navi-oracle-preamble.ts";
import { toSafeAmountNumber } from "../credit-source/navi/amount.ts";
import { NAVI_ENV, NAVI_MAIN_MARKET } from "../credit-source/navi/constants.ts";
import { resolveNaviPoolKey } from "../credit-source/navi/resolve-navi-pool-key.ts";
import { appendSuilendDeposit } from "../credit-source/suilend/append-suilend-swap-leg.ts";
import {
  appendDeepbookSwap,
  createDeepbookContract,
  requireNaviClient,
  validateSwapLegParams,
  type TradeSwapLegParams,
} from "./resolve-deepbook-swap.ts";

export interface BuildNaviSwapThenSupplySuilendTxParams extends TradeSwapLegParams {}

export async function buildNaviSwapThenSupplySuilendTx(
  params: BuildNaviSwapThenSupplySuilendTxParams,
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

  const withdrawAmountNumber = toSafeAmountNumber(inputAmount, "withdraw amount");
  const inputPoolKey = await resolveNaviPoolKey(inputAsset);

  const tx = new Transaction();
  tx.setSender(sender);

  await appendNaviOraclePreamble(tx, sender, [inputAsset], naviClient);

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

  await appendSuilendDeposit(tx, {
    sender,
    outputAsset,
    outputCoin,
    allowCreateObligation: true,
  });

  return tx;
}

import { Transaction } from "@mysten/sui/transactions";

import {
  appendSuilendDeposit,
  appendSuilendWithdraw,
} from "../credit-source/suilend/append-suilend-swap-leg.ts";
import {
  appendDeepbookSwap,
  createDeepbookContract,
  validateSwapLegParams,
  type TradeSwapLegParams,
} from "./resolve-deepbook-swap.ts";

export interface BuildSuilendTradeRoundTripTxParams extends TradeSwapLegParams {}

export async function buildSuilendTradeRoundTripTx(
  params: BuildSuilendTradeRoundTripTxParams,
): Promise<Transaction> {
  const {
    sender,
    poolKey,
    inputAsset,
    outputAsset,
    inputAmount,
    minOutput,
    deepAmount,
  } = params;

  const { isBaseToCoin } = validateSwapLegParams(params);

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

  await appendSuilendDeposit(tx, {
    sender,
    outputAsset,
    outputCoin,
    allowCreateObligation: false,
  });

  return tx;
}

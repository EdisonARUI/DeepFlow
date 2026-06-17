import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import { appendSuilendDeposit } from "../credit-source/suilend/append-suilend-swap-leg.ts";
import {
  appendDeepbookSwap,
  createDeepbookContract,
  mergeWalletInputCoin,
  requireNaviClient,
  validateSwapLegParams,
  type TradeSwapLegParams,
} from "./resolve-deepbook-swap.ts";

export interface BuildWalletSwapThenSupplySuilendTxParams extends TradeSwapLegParams {}

export async function buildWalletSwapThenSupplySuilendTx(
  params: BuildWalletSwapThenSupplySuilendTxParams,
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

  const inputCoin = await mergeWalletInputCoin(
    tx,
    sender,
    inputAsset,
    inputAmount,
    requireNaviClient(client),
  );
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

  await appendSuilendDeposit(tx, {
    sender,
    outputAsset,
    outputCoin,
    allowCreateObligation: true,
  });

  return tx;
}

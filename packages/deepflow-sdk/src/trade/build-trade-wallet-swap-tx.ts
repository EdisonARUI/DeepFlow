import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import {
  appendDeepbookSwap,
  createDeepbookContract,
  mergeWalletInputCoin,
  requireNaviClient,
  validateSwapLegParams,
  type TradeSwapLegParams,
} from "./resolve-deepbook-swap.ts";

export interface BuildTradeWalletSwapTxParams extends TradeSwapLegParams {}

export async function buildTradeWalletSwapTx(
  params: BuildTradeWalletSwapTxParams,
): Promise<Transaction> {
  const {
    sender,
    poolKey,
    inputAsset,
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

  tx.transferObjects([outputCoin, inputChange, deepChange], sender);

  return tx;
}

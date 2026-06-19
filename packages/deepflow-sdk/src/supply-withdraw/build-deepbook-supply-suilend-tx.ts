import { Transaction } from "@mysten/sui/transactions";

import { appendSuilendDeposit } from "../credit-source/suilend/append-suilend-swap-leg.ts";
import {
  appendDeepbookWithdrawCoin,
  resolveDeepbookCoinType,
} from "./append-deepbook-withdraw-coin.ts";

export interface BuildDeepbookSupplySuilendTxParams {
  sender: string;
  asset: string;
  assetSymbol?: string;
  amount: bigint;
  managerId: string;
}

export async function buildDeepbookSupplySuilendTx(
  params: BuildDeepbookSupplySuilendTxParams,
): Promise<Transaction> {
  const { sender, asset, assetSymbol, amount, managerId } = params;
  const deepbookAsset = assetSymbol ?? asset;

  if (amount <= 0n) {
    throw new Error("supply amount must be positive");
  }

  const coinType = resolveDeepbookCoinType(deepbookAsset);

  const tx = new Transaction();
  tx.setSender(sender);

  const withdrawnCoin = appendDeepbookWithdrawCoin(tx, {
    managerId,
    coinType,
    amount,
  });

  await appendSuilendDeposit(tx, {
    sender,
    outputAsset: deepbookAsset,
    outputCoin: withdrawnCoin,
    allowCreateObligation: true,
  });

  return tx;
}

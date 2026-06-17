import { Transaction } from "@mysten/sui/transactions";

import { createSuilendExecutionContext } from "./create-suilend-client.ts";
import { requireExistingSuilendObligation } from "./resolve-obligation-cap.ts";
import { resolveSuilendCoinType } from "./resolve-suilend-coin-type.ts";

export interface BuildSuilendWithdrawTxParams {
  sender: string;
  asset: string;
  assetSymbol?: string;
  amount: bigint;
}

export async function buildSuilendWithdrawTx(
  params: BuildSuilendWithdrawTxParams,
): Promise<Transaction> {
  const { sender, asset, amount } = params;

  if (amount <= 0n) {
    throw new Error("withdraw amount must be positive");
  }

  const context = await createSuilendExecutionContext();
  const coinType = resolveSuilendCoinType(asset, context.parsedReserves);
  const { obligationOwnerCapId, obligationId } = await requireExistingSuilendObligation({
    sender,
    context,
  });

  const tx = new Transaction();
  tx.setSender(sender);

  await context.suilendClient.withdrawAndSendToUser(
    sender,
    obligationOwnerCapId,
    obligationId,
    coinType,
    amount.toString(),
    tx,
  );

  return tx;
}

import type { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";

import { createSuilendExecutionContext, type SuilendExecutionContext } from "./create-suilend-client.ts";
import {
  finalizeNewSuilendObligationCap,
  requireExistingSuilendObligation,
  resolveSuilendObligationForTx,
} from "./resolve-obligation-cap.ts";
import { resolveSuilendCoinType } from "./resolve-suilend-coin-type.ts";

export function resolveSuilendCoinTypeForAsset(
  asset: string,
  context: SuilendExecutionContext,
): string {
  return resolveSuilendCoinType(asset, context.parsedReserves);
}

export async function appendSuilendWithdraw(
  tx: Transaction,
  params: {
    sender: string;
    inputAsset: string;
    inputAmount: bigint;
    context?: SuilendExecutionContext;
  },
): Promise<TransactionObjectArgument> {
  const context = params.context ?? (await createSuilendExecutionContext());
  const coinType = resolveSuilendCoinTypeForAsset(params.inputAsset, context);
  const { obligationOwnerCapId, obligationId } = await requireExistingSuilendObligation({
    sender: params.sender,
    context,
  });

  const [withdrawCoin] = await context.suilendClient.withdraw(
    obligationOwnerCapId,
    obligationId,
    coinType,
    params.inputAmount.toString(),
    tx,
    true,
  );

  return withdrawCoin as TransactionObjectArgument;
}

export async function appendSuilendDeposit(
  tx: Transaction,
  params: {
    sender: string;
    outputAsset: string;
    outputCoin: TransactionObjectArgument;
    /** true when source is not Suilend (wallet/navi → suilend); false for suilend round-trip redeposit */
    allowCreateObligation: boolean;
    context?: SuilendExecutionContext;
  },
): Promise<void> {
  const context = params.context ?? (await createSuilendExecutionContext());
  const coinType = resolveSuilendCoinTypeForAsset(params.outputAsset, context);

  if (params.allowCreateObligation) {
    const { obligationOwnerCapId, didCreate } = await resolveSuilendObligationForTx({
      sender: params.sender,
      transaction: tx,
      context,
    });

    context.suilendClient.deposit(
      params.outputCoin,
      coinType,
      obligationOwnerCapId,
      tx,
    );

    finalizeNewSuilendObligationCap({
      didCreate,
      obligationOwnerCapId,
      sender: params.sender,
      transaction: tx,
    });
    return;
  }

  const { obligationOwnerCapId } = await requireExistingSuilendObligation({
    sender: params.sender,
    context,
  });

  context.suilendClient.deposit(
    params.outputCoin,
    coinType,
    obligationOwnerCapId,
    tx,
  );
}

import { Transaction } from "@mysten/sui/transactions";

import { createSuilendExecutionContext } from "./create-suilend-client.ts";
import {
  finalizeNewSuilendObligationCap,
  resolveSuilendObligationForTx,
} from "./resolve-obligation-cap.ts";
import { resolveSuilendCoinType } from "./resolve-suilend-coin-type.ts";

export interface BuildSuilendSupplyThenWithdrawTxParams {
  sender: string;
  asset: string;
  assetSymbol?: string;
  supplyAmount: bigint;
  withdrawAmount: bigint;
}

function resolveDisplaySymbol(
  asset: string,
  assetSymbol: string | undefined,
  resolvedSymbol: string,
): string {
  return assetSymbol ?? (asset.includes("::") ? resolvedSymbol : asset);
}

export async function buildSuilendSupplyThenWithdrawTx(
  params: BuildSuilendSupplyThenWithdrawTxParams,
): Promise<Transaction> {
  const { sender, asset, assetSymbol, supplyAmount, withdrawAmount } = params;

  if (supplyAmount <= 0n) {
    throw new Error("supply amount must be positive");
  }
  if (withdrawAmount <= 0n) {
    throw new Error("withdraw amount must be positive");
  }
  if (withdrawAmount > supplyAmount) {
    throw new Error("withdraw amount cannot exceed supply amount");
  }

  const context = await createSuilendExecutionContext();
  const coinType = resolveSuilendCoinType(asset, context.parsedReserves);
  const reserve = context.parsedReserves.find((item) => item.coinType === coinType);
  const symbol = resolveDisplaySymbol(
    asset,
    assetSymbol,
    reserve?.token?.symbol ?? reserve?.symbol ?? asset,
  );

  const tx = new Transaction();
  tx.setSender(sender);

  const { obligationOwnerCapId, obligationId, didCreate } =
    await resolveSuilendObligationForTx({
    sender,
    transaction: tx,
    context,
  });

  try {
    await context.suilendClient.depositIntoObligation(
      sender,
      coinType,
      supplyAmount.toString(),
      tx,
      obligationOwnerCapId,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("coin")) {
      throw new Error(`No ${symbol} coins in wallet for sender ${sender}`);
    }
    throw err;
  }

  const [withdrawCoin] = await context.suilendClient.withdraw(
    obligationOwnerCapId,
    obligationId,
    coinType,
    withdrawAmount.toString(),
    tx,
    false,
  );
  tx.transferObjects([withdrawCoin], sender);

  finalizeNewSuilendObligationCap({
    didCreate,
    obligationOwnerCapId,
    sender,
    transaction: tx,
  });

  return tx;
}

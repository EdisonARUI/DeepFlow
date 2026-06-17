import { Transaction } from "@mysten/sui/transactions";

import { createSuilendExecutionContext } from "./create-suilend-client.ts";
import {
  finalizeNewSuilendObligationCap,
  resolveSuilendObligationForTx,
} from "./resolve-obligation-cap.ts";
import { resolveSuilendCoinType } from "./resolve-suilend-coin-type.ts";

export interface BuildSuilendSupplyTxParams {
  sender: string;
  asset: string;
  assetSymbol?: string;
  amount: bigint;
}

function resolveDisplaySymbol(
  asset: string,
  assetSymbol: string | undefined,
  resolvedSymbol: string,
): string {
  return assetSymbol ?? (asset.includes("::") ? resolvedSymbol : asset);
}

export async function buildSuilendSupplyTx(
  params: BuildSuilendSupplyTxParams,
): Promise<Transaction> {
  const { sender, asset, assetSymbol, amount } = params;

  if (amount <= 0n) {
    throw new Error("supply amount must be positive");
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

  const { obligationOwnerCapId, didCreate } = await resolveSuilendObligationForTx({
    sender,
    transaction: tx,
    context,
  });

  try {
    await context.suilendClient.depositIntoObligation(
      sender,
      coinType,
      amount.toString(),
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

  finalizeNewSuilendObligationCap({
    didCreate,
    obligationOwnerCapId,
    sender,
    transaction: tx,
  });

  return tx;
}

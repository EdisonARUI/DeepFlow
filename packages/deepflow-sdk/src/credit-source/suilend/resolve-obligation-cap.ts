import { SuilendClient } from "@suilend/sdk";
import {
  createObligationIfNoneExists,
  sendObligationToUser,
} from "@suilend/sdk/lib/transactions";
import type { SuiGrpcClient } from "@mysten/sui/grpc";
import type { Transaction, TransactionResult } from "@mysten/sui/transactions";

import { LENDING_MARKET_TYPE } from "./constants.ts";
import type { SuilendExecutionContext } from "./create-suilend-client.ts";

export type ResolvedSuilendObligation = {
  obligationOwnerCapId: string | TransactionResult;
  obligationId: string;
  didCreate: boolean;
};

export async function resolveSuilendObligationForTx(params: {
  sender: string;
  transaction: Transaction;
  context: SuilendExecutionContext;
}): Promise<ResolvedSuilendObligation> {
  const { sender, transaction, context } = params;
  const { suilendClient, grpcClient } = context;

  const existingCap = await getFirstObligationOwnerCap(sender, grpcClient);
  const { obligationOwnerCapId, didCreate } = createObligationIfNoneExists(
    suilendClient,
    transaction,
    existingCap,
  );

  return {
    obligationOwnerCapId,
    obligationId: existingCap?.obligationId ?? "",
    didCreate,
  };
}

async function getFirstObligationOwnerCap(
  sender: string,
  grpcClient: SuiGrpcClient,
) {
  const caps = await SuilendClient.getObligationOwnerCaps(
    sender,
    [LENDING_MARKET_TYPE],
    grpcClient,
  );
  return caps[0];
}

export async function requireExistingSuilendObligation(params: {
  sender: string;
  context: SuilendExecutionContext;
}): Promise<{ obligationOwnerCapId: string; obligationId: string }> {
  const cap = await getFirstObligationOwnerCap(params.sender, params.context.grpcClient);

  if (!cap) {
    throw new Error(
      `No Suilend obligation found for sender ${params.sender}. Supply first or use bootstrap simulation.`,
    );
  }

  return {
    obligationOwnerCapId: cap.id,
    obligationId: cap.obligationId,
  };
}

export function finalizeNewSuilendObligationCap(params: {
  didCreate: boolean;
  obligationOwnerCapId: string | TransactionResult;
  sender: string;
  transaction: Transaction;
}): void {
  if (!params.didCreate) return;
  sendObligationToUser(
    params.obligationOwnerCapId,
    params.sender,
    params.transaction,
  );
}

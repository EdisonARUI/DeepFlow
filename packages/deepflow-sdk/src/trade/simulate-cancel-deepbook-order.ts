import type { Transaction } from "@mysten/sui/transactions";

import {
  devInspectTransaction,
  dryRunTransaction,
  type SimulationResult,
} from "../simulation/simulate-transaction.ts";
import { createSuiGrpcClient } from "../sui/client.ts";
import {
  buildCancelAllDeepbookOrdersTx,
  buildCancelDeepbookOrderTx,
  type BuildCancelAllDeepbookOrdersTxParams,
  type BuildCancelDeepbookOrderTxParams,
} from "./build-cancel-deepbook-order-tx.ts";

export type CancelOrderSimulationResult = SimulationResult & {
  transaction: Transaction;
};

export async function simulateCancelDeepbookOrder(
  params: BuildCancelDeepbookOrderTxParams,
): Promise<CancelOrderSimulationResult> {
  const transaction = buildCancelDeepbookOrderTx(params);
  const grpcClient = createSuiGrpcClient();
  const result = await dryRunTransaction({ client: grpcClient, transaction });
  return { ...result, transaction };
}

export async function simulateCancelAllDeepbookOrders(
  params: BuildCancelAllDeepbookOrdersTxParams,
): Promise<CancelOrderSimulationResult> {
  const transaction = buildCancelAllDeepbookOrdersTx(params);
  const grpcClient = createSuiGrpcClient();
  const result = await dryRunTransaction({ client: grpcClient, transaction });
  return { ...result, transaction };
}

export async function inspectCancelDeepbookOrder(
  params: BuildCancelDeepbookOrderTxParams,
): Promise<CancelOrderSimulationResult> {
  const transaction = buildCancelDeepbookOrderTx(params);
  const grpcClient = createSuiGrpcClient();
  const result = await devInspectTransaction({ client: grpcClient, transaction });
  return { ...result, transaction };
}

export async function inspectCancelAllDeepbookOrders(
  params: BuildCancelAllDeepbookOrdersTxParams,
): Promise<CancelOrderSimulationResult> {
  const transaction = buildCancelAllDeepbookOrdersTx(params);
  const grpcClient = createSuiGrpcClient();
  const result = await devInspectTransaction({ client: grpcClient, transaction });
  return { ...result, transaction };
}

import type { Transaction } from "@mysten/sui/transactions";

import {
  devInspectTransaction,
  dryRunTransaction,
  type SimulationResult,
} from "../simulation/simulate-transaction.ts";
import { createSuiGrpcClient, createSuiJsonRpcClient } from "../sui/client.ts";
import { buildTradeWalletSwapTx } from "./build-trade-wallet-swap-tx.ts";
import type { TradeSwapLegParams } from "./resolve-deepbook-swap.ts";

export interface TradeWalletSwapParams
  extends Omit<TradeSwapLegParams, "client"> {}

export type TradeWalletSwapSimulationResult = SimulationResult & {
  transaction: Transaction;
};

async function buildWalletSwapTransaction(
  params: TradeWalletSwapParams,
): Promise<Transaction> {
  const jsonRpcClient = createSuiJsonRpcClient();

  return buildTradeWalletSwapTx({
    ...params,
    client: jsonRpcClient,
  });
}

export async function simulateTradeWalletSwap(
  params: TradeWalletSwapParams,
): Promise<TradeWalletSwapSimulationResult> {
  const transaction = await buildWalletSwapTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await dryRunTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

export async function inspectTradeWalletSwap(
  params: TradeWalletSwapParams,
): Promise<TradeWalletSwapSimulationResult> {
  const transaction = await buildWalletSwapTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await devInspectTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

import type { Transaction } from "@mysten/sui/transactions";

import {
  devInspectTransaction,
  dryRunTransaction,
  type SimulationResult,
} from "../simulation/simulate-transaction.ts";
import { createSuiGrpcClient, createSuiJsonRpcClient } from "../sui/client.ts";
import { buildWalletSwapThenSupplyTx } from "./build-wallet-swap-then-supply-tx.ts";
import type { TradeSwapLegParams } from "./resolve-deepbook-swap.ts";

export interface TradeWalletNaviParams
  extends Omit<TradeSwapLegParams, "client"> {}

export type TradeWalletNaviSimulationResult = SimulationResult & {
  transaction: Transaction;
};

async function buildWalletNaviTransaction(
  params: TradeWalletNaviParams,
): Promise<Transaction> {
  const jsonRpcClient = createSuiJsonRpcClient();

  return buildWalletSwapThenSupplyTx({
    ...params,
    client: jsonRpcClient,
  });
}

/** Dry run：wallet input → DeepBook swap → NAVI supply output。 */
export async function simulateTradeWalletNavi(
  params: TradeWalletNaviParams,
): Promise<TradeWalletNaviSimulationResult> {
  const transaction = await buildWalletNaviTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await dryRunTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

export async function inspectTradeWalletNavi(
  params: TradeWalletNaviParams,
): Promise<TradeWalletNaviSimulationResult> {
  const transaction = await buildWalletNaviTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await devInspectTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

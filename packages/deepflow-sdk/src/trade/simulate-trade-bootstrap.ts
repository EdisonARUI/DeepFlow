import type { Transaction } from "@mysten/sui/transactions";

import {
  devInspectTransaction,
  dryRunTransaction,
  type SimulationResult,
} from "../simulation/simulate-transaction.ts";
import { createSuiGrpcClient, createSuiJsonRpcClient } from "../sui/client.ts";
import { buildTradeBootstrapTx } from "./build-trade-bootstrap-tx.ts";

export interface TradeBootstrapParams {
  sender: string;
  suiAmount: bigint;
  minUsdcOut: bigint;
  deepAmount: number;
  deepbookPoolKey?: string;
}

export type TradeBootstrapSimulationResult = SimulationResult & {
  transaction: Transaction;
};

async function buildTradeBootstrapTransaction(
  params: TradeBootstrapParams,
): Promise<Transaction> {
  const jsonRpcClient = createSuiJsonRpcClient();

  return buildTradeBootstrapTx({
    ...params,
    client: jsonRpcClient,
  });
}

/** Dry run：单 PTB 内 supply SUI → withdraw → swap → supply USDC。 */
export async function simulateTradeBootstrap(
  params: TradeBootstrapParams,
): Promise<TradeBootstrapSimulationResult> {
  const transaction = await buildTradeBootstrapTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await dryRunTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

/** devInspect：同上路径，跳过 checks。 */
export async function inspectTradeBootstrap(
  params: TradeBootstrapParams,
): Promise<TradeBootstrapSimulationResult> {
  const transaction = await buildTradeBootstrapTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await devInspectTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

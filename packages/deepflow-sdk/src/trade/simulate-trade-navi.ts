import type { Transaction } from "@mysten/sui/transactions";

import {
  devInspectTransaction,
  dryRunTransaction,
  type SimulationResult,
} from "../simulation/simulate-transaction.ts";
import { createSuiGrpcClient, createSuiJsonRpcClient } from "../sui/client.ts";
import { buildNaviTradeReturnTx } from "./build-navi-trade-return-tx.ts";
import { buildNaviTradeRoundTripTx } from "./build-navi-trade-round-trip-tx.ts";
import type { TradeSwapLegParams } from "./resolve-deepbook-swap.ts";

export interface TradeNaviSwapParams
  extends Omit<TradeSwapLegParams, "client"> {}

export type TradeNaviSwapSimulationResult = SimulationResult & {
  transaction: Transaction;
};

async function buildNaviRoundTripTransaction(
  params: TradeNaviSwapParams,
): Promise<Transaction> {
  const jsonRpcClient = createSuiJsonRpcClient();

  return buildNaviTradeRoundTripTx({
    ...params,
    client: jsonRpcClient,
  });
}

async function buildNaviReturnTransaction(
  params: TradeNaviSwapParams,
): Promise<Transaction> {
  const jsonRpcClient = createSuiJsonRpcClient();

  return buildNaviTradeReturnTx({
    ...params,
    client: jsonRpcClient,
  });
}

export async function simulateTradeNaviRoundTrip(
  params: TradeNaviSwapParams,
): Promise<TradeNaviSwapSimulationResult> {
  const transaction = await buildNaviRoundTripTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await dryRunTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

export async function inspectTradeNaviRoundTrip(
  params: TradeNaviSwapParams,
): Promise<TradeNaviSwapSimulationResult> {
  const transaction = await buildNaviRoundTripTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await devInspectTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

export async function simulateTradeNaviReturn(
  params: TradeNaviSwapParams,
): Promise<TradeNaviSwapSimulationResult> {
  const transaction = await buildNaviReturnTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await dryRunTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

export async function inspectTradeNaviReturn(
  params: TradeNaviSwapParams,
): Promise<TradeNaviSwapSimulationResult> {
  const transaction = await buildNaviReturnTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await devInspectTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

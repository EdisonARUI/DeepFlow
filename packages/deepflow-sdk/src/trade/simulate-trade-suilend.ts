import type { Transaction } from "@mysten/sui/transactions";

import {
  devInspectTransaction,
  dryRunTransaction,
  type SimulationResult,
} from "../simulation/simulate-transaction.ts";
import { createSuiGrpcClient, createSuiJsonRpcClient } from "../sui/client.ts";
import { buildNaviSwapThenSupplySuilendTx } from "./build-navi-swap-then-supply-suilend-tx.ts";
import { buildSuilendSwapThenSupplyNaviTx } from "./build-suilend-swap-then-supply-navi-tx.ts";
import { buildSuilendTradeReturnTx } from "./build-suilend-trade-return-tx.ts";
import { buildSuilendTradeRoundTripTx } from "./build-suilend-trade-round-trip-tx.ts";
import { buildWalletSwapThenSupplySuilendTx } from "./build-wallet-swap-then-supply-suilend-tx.ts";
import type { TradeSwapLegParams } from "./resolve-deepbook-swap.ts";

export interface TradeSuilendSwapParams extends Omit<TradeSwapLegParams, "client"> {
  client?: TradeSwapLegParams["client"];
}

export type TradeSuilendSimulationResult = SimulationResult & {
  transaction: Transaction;
};

async function runDryRun(transaction: Transaction): Promise<TradeSuilendSimulationResult> {
  const grpcClient = createSuiGrpcClient();
  const result = await dryRunTransaction({ client: grpcClient, transaction });
  return { ...result, transaction };
}

async function runInspect(transaction: Transaction): Promise<TradeSuilendSimulationResult> {
  const grpcClient = createSuiGrpcClient();
  const result = await devInspectTransaction({ client: grpcClient, transaction });
  return { ...result, transaction };
}

export async function simulateTradeWalletSuilend(
  params: TradeSuilendSwapParams,
): Promise<TradeSuilendSimulationResult> {
  const jsonRpcClient = params.client ?? createSuiJsonRpcClient();
  const transaction = await buildWalletSwapThenSupplySuilendTx({
    ...params,
    client: jsonRpcClient,
  });
  return runDryRun(transaction);
}

export async function inspectTradeWalletSuilend(
  params: TradeSuilendSwapParams,
): Promise<TradeSuilendSimulationResult> {
  const jsonRpcClient = params.client ?? createSuiJsonRpcClient();
  const transaction = await buildWalletSwapThenSupplySuilendTx({
    ...params,
    client: jsonRpcClient,
  });
  return runInspect(transaction);
}

export async function simulateTradeSuilendRoundTrip(
  params: TradeSuilendSwapParams,
): Promise<TradeSuilendSimulationResult> {
  const transaction = await buildSuilendTradeRoundTripTx(params);
  return runDryRun(transaction);
}

export async function inspectTradeSuilendRoundTrip(
  params: TradeSuilendSwapParams,
): Promise<TradeSuilendSimulationResult> {
  const transaction = await buildSuilendTradeRoundTripTx(params);
  return runInspect(transaction);
}

export async function simulateTradeSuilendReturn(
  params: TradeSuilendSwapParams,
): Promise<TradeSuilendSimulationResult> {
  const transaction = await buildSuilendTradeReturnTx(params);
  return runDryRun(transaction);
}

export async function inspectTradeSuilendReturn(
  params: TradeSuilendSwapParams,
): Promise<TradeSuilendSimulationResult> {
  const transaction = await buildSuilendTradeReturnTx(params);
  return runInspect(transaction);
}

export async function simulateTradeNaviSuilend(
  params: TradeSuilendSwapParams,
): Promise<TradeSuilendSimulationResult> {
  const jsonRpcClient = params.client ?? createSuiJsonRpcClient();
  const transaction = await buildNaviSwapThenSupplySuilendTx({
    ...params,
    client: jsonRpcClient,
  });
  return runDryRun(transaction);
}

export async function inspectTradeNaviSuilend(
  params: TradeSuilendSwapParams,
): Promise<TradeSuilendSimulationResult> {
  const jsonRpcClient = params.client ?? createSuiJsonRpcClient();
  const transaction = await buildNaviSwapThenSupplySuilendTx({
    ...params,
    client: jsonRpcClient,
  });
  return runInspect(transaction);
}

export async function simulateTradeSuilendNavi(
  params: TradeSuilendSwapParams,
): Promise<TradeSuilendSimulationResult> {
  const jsonRpcClient = params.client ?? createSuiJsonRpcClient();
  const transaction = await buildSuilendSwapThenSupplyNaviTx({
    ...params,
    client: jsonRpcClient,
  });
  return runDryRun(transaction);
}

export async function inspectTradeSuilendNavi(
  params: TradeSuilendSwapParams,
): Promise<TradeSuilendSimulationResult> {
  const jsonRpcClient = params.client ?? createSuiJsonRpcClient();
  const transaction = await buildSuilendSwapThenSupplyNaviTx({
    ...params,
    client: jsonRpcClient,
  });
  return runInspect(transaction);
}

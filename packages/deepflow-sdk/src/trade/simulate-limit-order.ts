import type { Transaction } from "@mysten/sui/transactions";

import {
  devInspectTransaction,
  dryRunTransaction,
  type SimulationResult,
} from "../simulation/simulate-transaction.ts";
import { createSuiGrpcClient, createSuiJsonRpcClient } from "../sui/client.ts";
import { buildNaviLimitOrderTx } from "./build-navi-limit-order-tx.ts";
import { buildSuilendLimitOrderTx } from "./build-suilend-limit-order-tx.ts";
import { buildWalletLimitOrderTx } from "./build-limit-order-core.ts";
import { resolveUserBalanceManager } from "./resolve-user-balance-manager.ts";
import type { TradeLimitOrderParams } from "./build-limit-order-core.ts";

export type LimitOrderFundSource = "wallet" | "navi" | "suilend";

export type LimitOrderSimulationParams = Omit<
  TradeLimitOrderParams,
  "managerId" | "client"
> & {
  fundSource: LimitOrderFundSource;
};

export type LimitOrderSimulationResult = SimulationResult & {
  transaction: Transaction;
};

async function resolveManagerId(sender: string): Promise<string | null> {
  const { managerId } = await resolveUserBalanceManager(sender);
  return managerId;
}

async function buildLimitOrderTransaction(
  params: LimitOrderSimulationParams,
): Promise<Transaction> {
  const jsonRpcClient = createSuiJsonRpcClient();
  const managerId = await resolveManagerId(params.sender);
  const common = {
    ...params,
    managerId,
    client: jsonRpcClient,
  };

  if (params.fundSource === "wallet") {
    return buildWalletLimitOrderTx(common);
  }
  if (params.fundSource === "navi") {
    return buildNaviLimitOrderTx(common);
  }
  return buildSuilendLimitOrderTx(common);
}

export async function simulateLimitOrder(
  params: LimitOrderSimulationParams,
): Promise<LimitOrderSimulationResult> {
  const transaction = await buildLimitOrderTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await dryRunTransaction({ client: grpcClient, transaction });
  return { ...result, transaction };
}

export async function inspectLimitOrder(
  params: LimitOrderSimulationParams,
): Promise<LimitOrderSimulationResult> {
  const transaction = await buildLimitOrderTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await devInspectTransaction({ client: grpcClient, transaction });
  return { ...result, transaction };
}

import type { Transaction } from "@mysten/sui/transactions";

import { buildNaviSupplyThenWithdrawTx } from "./credit-source/navi/build-navi-supply-then-withdraw-tx.ts";
import { buildNaviSupplyTx } from "./credit-source/navi/build-navi-supply-tx.ts";
import { buildNaviWithdrawTx } from "./credit-source/navi/build-navi-withdraw-tx.ts";
import { buildSuilendSupplyThenWithdrawTx } from "./credit-source/suilend/build-suilend-supply-then-withdraw-tx.ts";
import { buildSuilendSupplyTx } from "./credit-source/suilend/build-suilend-supply-tx.ts";
import { buildSuilendWithdrawTx } from "./credit-source/suilend/build-suilend-withdraw-tx.ts";
import { simulateDeepbookSupply } from "./supply-withdraw/simulate-deepbook-supply.ts";
import type {
  DeepbookSupplyParams,
  DeepbookSupplySimulationResult,
} from "./supply-withdraw/simulate-deepbook-supply.ts";
import {
  devInspectTransaction,
  dryRunTransaction,
  type SimulationResult,
} from "./simulation/simulate-transaction.ts";
import { createSuiGrpcClient, createSuiJsonRpcClient } from "./sui/client.ts";

export type SupplyWithdrawProtocol = "navi" | "suilend";
export type SupplyWithdrawOperation = "supply" | "withdraw";
export type SupplyFundSource = "wallet" | "deepbook";

export interface SupplyWithdrawParams {
  protocol?: SupplyWithdrawProtocol;
  sender: string;
  asset: string;
  /** 展示用资产符号（错误文案） */
  assetSymbol?: string;
  amount: bigint;
  operation: SupplyWithdrawOperation;
}

export type SupplyWithdrawSimulationResult = SimulationResult & {
  transaction: Transaction;
};

export interface SupplyThenWithdrawParams {
  protocol?: SupplyWithdrawProtocol;
  sender: string;
  asset: string;
  assetSymbol?: string;
  supplyAmount: bigint;
  withdrawAmount: bigint;
}

function resolveProtocol(protocol: SupplyWithdrawProtocol | undefined): SupplyWithdrawProtocol {
  return protocol ?? "navi";
}

async function buildSupplyWithdrawTransaction(
  params: SupplyWithdrawParams,
): Promise<Transaction> {
  const protocol = resolveProtocol(params.protocol);
  const { sender, asset, assetSymbol, amount, operation } = params;

  if (protocol === "suilend") {
    if (operation === "supply") {
      return buildSuilendSupplyTx({ sender, asset, assetSymbol, amount });
    }
    return buildSuilendWithdrawTx({ sender, asset, assetSymbol, amount });
  }

  const jsonRpcClient = createSuiJsonRpcClient();

  if (operation === "supply") {
    return buildNaviSupplyTx({
      sender,
      asset,
      assetSymbol,
      amount,
      client: jsonRpcClient,
    });
  }

  return buildNaviWithdrawTx({
    sender,
    asset,
    assetSymbol,
    amount,
    client: jsonRpcClient,
  });
}

async function buildSupplyThenWithdrawTransaction(
  params: SupplyThenWithdrawParams,
): Promise<Transaction> {
  const protocol = resolveProtocol(params.protocol);

  if (protocol === "suilend") {
    return buildSuilendSupplyThenWithdrawTx(params);
  }

  const jsonRpcClient = createSuiJsonRpcClient();
  return buildNaviSupplyThenWithdrawTx({
    ...params,
    client: jsonRpcClient,
  });
}

/** Dry run（含余额/gas 检查）验证 supply/withdraw PTB。 */
export async function simulateSupplyWithdraw(
  params: SupplyWithdrawParams,
): Promise<SupplyWithdrawSimulationResult> {
  const transaction = await buildSupplyWithdrawTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await dryRunTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

/** devInspect 等价（跳过 checks，可读 command return values）。 */
export async function inspectSupplyWithdraw(
  params: SupplyWithdrawParams,
): Promise<SupplyWithdrawSimulationResult> {
  const transaction = await buildSupplyWithdrawTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await devInspectTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

/** Dry run：单 PTB 内先 supply 再 withdraw（无持仓时 bootstrap 测试用）。 */
export async function simulateSupplyThenWithdraw(
  params: SupplyThenWithdrawParams,
): Promise<SupplyWithdrawSimulationResult> {
  const transaction = await buildSupplyThenWithdrawTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await dryRunTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

/** devInspect：单 PTB 内先 supply 再 withdraw。 */
export async function inspectSupplyThenWithdraw(
  params: SupplyThenWithdrawParams,
): Promise<SupplyWithdrawSimulationResult> {
  const transaction = await buildSupplyThenWithdrawTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await devInspectTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

export { simulateDeepbookSupply };
export type { DeepbookSupplyParams, DeepbookSupplySimulationResult };

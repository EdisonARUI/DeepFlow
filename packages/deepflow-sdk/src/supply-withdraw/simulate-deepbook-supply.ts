import type { Transaction } from "@mysten/sui/transactions";

import { createSuiGrpcClient, createSuiJsonRpcClient } from "../sui/client.ts";
import { dryRunTransaction, type SimulationResult } from "../simulation/simulate-transaction.ts";
import { buildDeepbookSupplyNaviTx } from "./build-deepbook-supply-navi-tx.ts";
import { buildDeepbookSupplySuilendTx } from "./build-deepbook-supply-suilend-tx.ts";

export type DeepbookSupplyProtocol = "navi" | "suilend";

export interface DeepbookSupplyParams {
  protocol?: DeepbookSupplyProtocol;
  sender: string;
  asset: string;
  assetSymbol?: string;
  amount: bigint;
  managerId: string;
}

export type DeepbookSupplySimulationResult = SimulationResult & {
  transaction: Transaction;
};

function resolveProtocol(protocol: DeepbookSupplyProtocol | undefined): DeepbookSupplyProtocol {
  return protocol ?? "navi";
}

async function buildDeepbookSupplyTransaction(
  params: DeepbookSupplyParams,
): Promise<Transaction> {
  if (!params.managerId) {
    throw new Error("No DeepBook BalanceManager yet. Place a limit order first.");
  }

  const protocol = resolveProtocol(params.protocol);

  if (protocol === "suilend") {
    return buildDeepbookSupplySuilendTx(params);
  }

  const jsonRpcClient = createSuiJsonRpcClient();
  return buildDeepbookSupplyNaviTx({
    ...params,
    client: jsonRpcClient,
  });
}

export async function simulateDeepbookSupply(
  params: DeepbookSupplyParams,
): Promise<DeepbookSupplySimulationResult> {
  const transaction = await buildDeepbookSupplyTransaction(params);
  const grpcClient = createSuiGrpcClient();
  const result = await dryRunTransaction({ client: grpcClient, transaction });

  return { ...result, transaction };
}

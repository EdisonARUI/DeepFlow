import { Transaction } from "@mysten/sui/transactions";

import { createDeepbookContractWithManager } from "./create-deepbook-config-with-manager.ts";
import { DEFAULT_BALANCE_MANAGER_KEY } from "./resolve-user-balance-manager.ts";

export interface BuildCancelDeepbookOrderTxParams {
  sender: string;
  poolKey: string;
  managerId: string;
  orderId: string;
}

export interface BuildCancelAllDeepbookOrdersTxParams {
  sender: string;
  poolKey: string;
  managerId: string;
}

export function buildCancelDeepbookOrderTx(
  params: BuildCancelDeepbookOrderTxParams,
): Transaction {
  const { sender, poolKey, managerId, orderId } = params;

  const tx = new Transaction();
  tx.setSender(sender);

  const deepBook = createDeepbookContractWithManager(sender, managerId);
  tx.add(deepBook.cancelLiveOrder(poolKey, DEFAULT_BALANCE_MANAGER_KEY, orderId));

  return tx;
}

export function buildCancelAllDeepbookOrdersTx(
  params: BuildCancelAllDeepbookOrdersTxParams,
): Transaction {
  const { sender, poolKey, managerId } = params;

  const tx = new Transaction();
  tx.setSender(sender);

  const deepBook = createDeepbookContractWithManager(sender, managerId);
  tx.add(deepBook.cancelAllOrders(poolKey, DEFAULT_BALANCE_MANAGER_KEY));

  return tx;
}

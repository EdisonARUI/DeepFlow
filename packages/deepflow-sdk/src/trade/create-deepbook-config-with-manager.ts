import {
  DeepBookConfig,
  DeepBookContract,
  type BalanceManager,
} from "@mysten/deepbook-v3";

import { SUI_NETWORK } from "../sui/client.ts";
import { DEFAULT_BALANCE_MANAGER_KEY } from "./resolve-user-balance-manager.ts";

export function createDeepbookConfigWithManager(
  sender: string,
  managerId: string,
  managerKey: string = DEFAULT_BALANCE_MANAGER_KEY,
): DeepBookConfig {
  const balanceManagers: Record<string, BalanceManager> = {
    [managerKey]: { address: managerId },
  };

  return new DeepBookConfig({
    address: sender,
    network: SUI_NETWORK,
    balanceManagers,
  });
}

export function createDeepbookContractWithManager(
  sender: string,
  managerId: string,
  managerKey: string = DEFAULT_BALANCE_MANAGER_KEY,
): DeepBookContract {
  return new DeepBookContract(createDeepbookConfigWithManager(sender, managerId, managerKey));
}

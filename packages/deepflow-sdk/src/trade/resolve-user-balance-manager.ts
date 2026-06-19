import { createDeepbookClient } from "../sui/deepbook-client.ts";

export const DEFAULT_BALANCE_MANAGER_KEY = "deepflow";

export type ResolvedBalanceManager = {
  managerKey: string;
  managerId: string | null;
};

/** Discover the user's DeepBook BalanceManager on mainnet (first owned manager). */
export async function resolveUserBalanceManager(
  owner: string,
): Promise<ResolvedBalanceManager> {
  const client = createDeepbookClient(owner);
  const ids = await client.deepbook.getBalanceManagerIds(owner);

  return {
    managerKey: DEFAULT_BALANCE_MANAGER_KEY,
    managerId: ids[0] ?? null,
  };
}

export function balanceManagerConfigEntry(managerId: string): Record<
  string,
  { address: string }
> {
  return {
    [DEFAULT_BALANCE_MANAGER_KEY]: { address: managerId },
  };
}

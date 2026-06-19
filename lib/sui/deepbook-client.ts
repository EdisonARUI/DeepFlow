import { deepbook, type BalanceManager } from "@mysten/deepbook-v3";
import { createSuiGrpcClient } from "./network";

const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export type DeepbookExtendedClient = ReturnType<typeof createDeepbookClient>;

export type CreateDeepbookClientOptions = {
  balanceManagers?: Record<string, BalanceManager>;
};

/** 创建带 DeepBook 扩展的 Sui gRPC 客户端（mainnet）。 */
export function createDeepbookClient(
  ownerAddress?: string,
  options?: CreateDeepbookClientOptions,
) {
  const address = ownerAddress ?? ZERO_ADDRESS;

  return createSuiGrpcClient().$extend(
    deepbook({
      address,
      balanceManagers: options?.balanceManagers,
    }),
  );
}

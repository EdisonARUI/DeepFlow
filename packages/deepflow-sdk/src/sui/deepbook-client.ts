import { deepbook } from "@mysten/deepbook-v3";

import { createSuiGrpcClient } from "./client.ts";

const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export type DeepbookExtendedClient = ReturnType<typeof createDeepbookClient>;

/** 创建带 DeepBook 扩展的 Sui gRPC 客户端（mainnet）。 */
export function createDeepbookClient(ownerAddress?: string) {
  const address = ownerAddress ?? ZERO_ADDRESS;

  return createSuiGrpcClient().$extend(
    deepbook({
      address,
    }),
  );
}

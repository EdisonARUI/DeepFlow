import {
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  SuilendClient,
} from "@suilend/sdk";
import { initializeSuilend } from "@suilend/sdk/lib/initialize";
import type { ParsedReserve } from "@suilend/sdk/parsers";

import { createSuiGrpcClient } from "../../sui/client.ts";

export type SuilendExecutionContext = {
  grpcClient: ReturnType<typeof createSuiGrpcClient>;
  suilendClient: SuilendClient;
  parsedReserves: ParsedReserve[];
};

let cachedContext: SuilendExecutionContext | undefined;

export async function createSuilendExecutionContext(): Promise<SuilendExecutionContext> {
  if (cachedContext) {
    return cachedContext;
  }

  const grpcClient = createSuiGrpcClient();
  const suilendClient = await SuilendClient.initialize(
    LENDING_MARKET_ID,
    LENDING_MARKET_TYPE,
    grpcClient,
  );
  const { lendingMarket } = await initializeSuilend(grpcClient, suilendClient);

  cachedContext = {
    grpcClient,
    suilendClient,
    parsedReserves: lendingMarket.reserves,
  };

  return cachedContext;
}

/** Test-only helper to reset module cache. */
export function resetSuilendExecutionContextCache(): void {
  cachedContext = undefined;
}

import {
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  SuilendClient,
} from "@suilend/sdk";
import { initializeSuilend } from "@suilend/sdk/lib/initialize";

import { createSuilendGrpcClient } from "./suilend-grpc-client";

export { LENDING_MARKET_ID, LENDING_MARKET_TYPE };

export async function createInitializedSuilendContext() {
  const grpcClient = createSuilendGrpcClient();
  const suilendClient = await SuilendClient.initialize(
    LENDING_MARKET_ID,
    LENDING_MARKET_TYPE,
    grpcClient,
  );
  const { lendingMarket } = await initializeSuilend(grpcClient, suilendClient);

  return { grpcClient, suilendClient, lendingMarket };
}

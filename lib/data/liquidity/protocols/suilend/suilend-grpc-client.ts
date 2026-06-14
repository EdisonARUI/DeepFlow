import { createSuiGrpcClient } from "@/lib/sui/network";

/** Suilend SDK 读/写路径使用的 mainnet gRPC client。 */
export function createSuilendGrpcClient() {
  return createSuiGrpcClient();
}

import { createSuiJsonRpcClient } from "@/lib/sui/network";

/** NAVI SDK 读路径使用的 mainnet JSON-RPC client。 */
export function createNaviRpcClient() {
  return createSuiJsonRpcClient();
}

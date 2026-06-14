import { createSuiJsonRpcClient } from "@/lib/sui/network";

/** 钱包 coin 余额查询使用的 mainnet JSON-RPC client。 */
export function createSuilendJsonRpcClient() {
  return createSuiJsonRpcClient();
}

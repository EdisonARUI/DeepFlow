import { SuiGrpcClient } from "@mysten/sui/grpc";
import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from "@mysten/sui/jsonRpc";

/** DeFi 数据层与钱包统一使用 mainnet，不再支持 testnet。 */
export const SUI_NETWORK = "mainnet" as const;

export const SUI_GRPC_URL = "https://fullnode.mainnet.sui.io:443" as const;

export function createSuiJsonRpcClient(): SuiJsonRpcClient {
  return new SuiJsonRpcClient({
    network: SUI_NETWORK,
    url: getJsonRpcFullnodeUrl(SUI_NETWORK),
  });
}

export function createSuiGrpcClient(): SuiGrpcClient {
  return new SuiGrpcClient({
    network: SUI_NETWORK,
    baseUrl: SUI_GRPC_URL,
  });
}

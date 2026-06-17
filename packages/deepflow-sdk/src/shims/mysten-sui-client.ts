// NAVI SDK expects legacy `@mysten/sui/client` exports (`getFullnodeUrl`, `SuiClient`).
// Deepflow uses `@mysten/sui` v2 where those moved to `@mysten/sui/jsonRpc`.
// Re-export from dist directly to avoid Vitest alias circular resolution.

export * from "../../../../node_modules/@mysten/sui/dist/client/index.mjs";
export {
  getJsonRpcFullnodeUrl as getFullnodeUrl,
  SuiJsonRpcClient as SuiClient,
} from "@mysten/sui/jsonRpc";

// Compatibility shim for NAVI SDK only (see `next.config.ts` scoped replacement).
//
// NAVI SDK expects legacy `@mysten/sui/client` exports (`getFullnodeUrl`, `SuiClient`).
// Deepflow uses `@mysten/sui` v2 where those moved to `@mysten/sui/jsonRpc`.

export * from "../../node_modules/@mysten/sui/dist/client/index.mjs";
export {
  getJsonRpcFullnodeUrl as getFullnodeUrl,
  SuiJsonRpcClient as SuiClient,
} from "@mysten/sui/jsonRpc";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const sdkRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@mysten/sui/client": path.resolve(sdkRoot, "src/shims/mysten-sui-client.ts"),
    },
  },
  test: {
    testTimeout: 60_000,
  },
});

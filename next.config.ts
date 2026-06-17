import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Turbopack resolveAlias does not support absolute paths; webpack does.
const mystenSuiClientShimRelative = "./lib/shims/mysten-sui-client.ts";
const mystenSuiClientShimAbsolute = path.join(__dirname, "lib/shims/mysten-sui-client.ts");
const bufferPolyfill = require.resolve("buffer/");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@mysten/dapp-kit-react",
    "@deepflow/sdk",
    "@suilend/sdk",
    "@suilend/sui-fe",
  ],
  // Keep recently visited routes warm in dev to reduce re-compiling
  // when switching between portfolio/liquidity/trading frequently.
  onDemandEntries: {
    maxInactiveAge: 10 * 60 * 1000,
    pagesBufferLength: 10,
  },
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    resolveAlias: {
      "@mysten/sui/client": mystenSuiClientShimRelative,
      "node:buffer": "buffer",
    },
  },
  webpack: (config, { isServer, webpack }) => {
    // NAVI SDK relies on Node.js builtins like `node:buffer` and on older
    // `@mysten/sui/client` exports (getFullnodeUrl/SuiClient). The shim re-exports
    // the real client from a physical path to avoid alias recursion.
    if (!isServer) {
      config.resolve = config.resolve ?? {};

      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        "@mysten/sui/client": mystenSuiClientShimAbsolute,
      };

      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        buffer: bufferPolyfill,
      };

      config.plugins = [
        ...(config.plugins ?? []),
        new webpack.NormalModuleReplacementPlugin(/^node:buffer$/, bufferPolyfill),
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
      ];
    }

    return config;
  },
};

export default nextConfig;

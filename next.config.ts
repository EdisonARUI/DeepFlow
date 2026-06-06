import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["@mysten/dapp-kit-react", "@deepflow/sdk"],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;

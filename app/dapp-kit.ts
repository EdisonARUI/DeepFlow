import { createDAppKit } from "@mysten/dapp-kit-react";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { SUI_GRPC_URL, SUI_NETWORK } from "@/lib/sui/network";

export const dAppKit = createDAppKit({
  networks: [SUI_NETWORK],
  createClient: (network) =>
    new SuiGrpcClient({ network, baseUrl: SUI_GRPC_URL }),
  slushWalletConfig: {
    appName: "DeepFlow",
  },
});

declare module "@mysten/dapp-kit-react" {
  interface Register {
    dAppKit: typeof dAppKit;
  }
}

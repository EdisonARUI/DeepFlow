import type { LiquidityPositionRaw } from "@/lib/data/liquidity/types";
import type { PortfolioTransactionView } from "@/lib/data/portfolio/types";

const MAINNET_USDC =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";
const MAINNET_DEEP =
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP";

/** Static USD prices for mock mode and live fallback (MVP). */
export const MOCK_TOKEN_USD_PRICES: Record<string, number> = {
  USDC: 1,
  SUI: 3.5,
  suiUSDe: 1,
  SUIUSDE: 1,
  WAL: 0.4,
  DEEP: 0.15,
  vSUI: 3.6,
};

export const MOCK_DEEPBOOK_RAW: LiquidityPositionRaw[] = [
  {
    protocol: "deepbook",
    protocolLabel: "[DEEPBOOK]",
    protocolColor: "#00ff41",
    asset: "USDC",
    coinType: MAINNET_USDC,
    supplyApyBps: 0,
    tvlUsd: 0,
    suppliedBalance: BigInt("975000000"),
    walletCoinBalance: BigInt(0),
    decimals: 6,
  },
  {
    protocol: "deepbook",
    protocolLabel: "[DEEPBOOK]",
    protocolColor: "#00ff41",
    asset: "DEEP",
    coinType: MAINNET_DEEP,
    supplyApyBps: 0,
    tvlUsd: 0,
    suppliedBalance: BigInt("525000000"),
    walletCoinBalance: BigInt(0),
    decimals: 6,
  },
];

export const MOCK_PORTFOLIO_TRANSACTIONS: PortfolioTransactionView[] = [
  {
    date: "2023-10-27 09:15",
    timestamp: Date.parse("2023-10-27T09:15:00Z"),
    type: "SUPPLY",
    asset: "vSUI",
    amount: "+500 vSUI",
    status: "COMPLETED",
    txHash: "0x21...fe90",
    txDigest:
      "0x2100000000000000000000000000000000000000000000000000000000fe90",
  },
  {
    date: "2023-10-26 18:42",
    timestamp: Date.parse("2023-10-26T18:42:00Z"),
    type: "BRIDGE",
    asset: "USDC",
    amount: "+10,000 USDC",
    status: "PENDING",
    txHash: "0xbb...a012",
    txDigest:
      "0xbb0000000000000000000000000000000000000000000000000000000000a012",
  },
  {
    date: "2023-10-26 14:10",
    timestamp: Date.parse("2023-10-26T14:10:00Z"),
    type: "WITHDRAW",
    asset: "DEEP",
    amount: "-5,000 DEEP",
    status: "COMPLETED",
    txHash: "0x14...8db3",
    txDigest:
      "0x14000000000000000000000000000000000000000000000000000000008db3",
  },
  {
    date: "2023-10-25 22:18",
    timestamp: Date.parse("2023-10-25T22:18:00Z"),
    type: "SUPPLY",
    asset: "USDC",
    amount: "+25,000 USDC",
    status: "COMPLETED",
    txHash: "0x99...d21f",
    txDigest:
      "0x9900000000000000000000000000000000000000000000000000000000d21f",
  },
  {
    date: "2023-10-25 11:05",
    timestamp: Date.parse("2023-10-25T11:05:00Z"),
    type: "WITHDRAW",
    asset: "SUI",
    amount: "-2,000 SUI",
    status: "COMPLETED",
    txHash: "0x7a...b45c",
    txDigest:
      "0x7a00000000000000000000000000000000000000000000000000000000b45c",
  },
];

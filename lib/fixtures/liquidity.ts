import type { LiquidityPositionRaw } from "@/lib/data/liquidity/types";

const MAINNET_USDC =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";
const MAINNET_SUI_USDE =
  "0x41d587e5336f1c86cad50d38a7136db99333bb9bda91cea4ba69115defeb1402::sui_usde::SUI_USDE";
const MAINNET_SUI =
  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";
const MAINNET_WAL =
  "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL";
const MAINNET_DEEP =
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP";

export const MOCK_LIQUIDITY_RAW: LiquidityPositionRaw[] = [
  {
    protocol: "navi",
    protocolLabel: "[NAVI]",
    protocolColor: "#18c8ff",
    asset: "USDC",
    coinType: MAINNET_USDC,
    supplyApyBps: 810,
    tvlUsd: 8_100_000,
    suppliedBalance: BigInt("12500500000"),
    walletCoinBalance: BigInt("5000000000"),
    decimals: 6,
  },
  {
    protocol: "navi",
    protocolLabel: "[NAVI]",
    protocolColor: "#18c8ff",
    asset: "suiUSDe",
    coinType: MAINNET_SUI_USDE,
    supplyApyBps: 810,
    tvlUsd: 8_100_000,
    suppliedBalance: BigInt("12500500000"),
    walletCoinBalance: BigInt("5000000000"),
    decimals: 6,
  },
  {
    protocol: "navi",
    protocolLabel: "[NAVI]",
    protocolColor: "#18c8ff",
    asset: "SUI",
    coinType: MAINNET_SUI,
    supplyApyBps: 640,
    tvlUsd: 4_200_000,
    suppliedBalance: BigInt("8200000000000"),
    walletCoinBalance: BigInt("2000000000000"),
    decimals: 9,
  },
  {
    protocol: "scallop",
    protocolLabel: "[SCALLOP]",
    protocolColor: "#ff9100",
    asset: "USDC",
    coinType: MAINNET_USDC,
    supplyApyBps: 720,
    tvlUsd: 5_300_000,
    suppliedBalance: BigInt("9100250000"),
    walletCoinBalance: BigInt("3000000000"),
    decimals: 6,
  },
  {
    protocol: "scallop",
    protocolLabel: "[SCALLOP]",
    protocolColor: "#ff9100",
    asset: "WAL",
    coinType: MAINNET_WAL,
    supplyApyBps: 580,
    tvlUsd: 1_100_000,
    suppliedBalance: BigInt("3400000000000"),
    walletCoinBalance: BigInt("1000000000000"),
    decimals: 9,
  },
  {
    protocol: "cetus",
    protocolLabel: "[CETUS]",
    protocolColor: "#72ff70",
    asset: "DEEP",
    coinType: MAINNET_DEEP,
    supplyApyBps: 450,
    tvlUsd: 2_800_000,
    suppliedBalance: BigInt("1850750000"),
    walletCoinBalance: BigInt("900000000"),
    decimals: 6,
  },
];

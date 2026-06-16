import type { DeepbookOrderRaw, TradingMarketRaw } from "@/lib/data/trading/types";

export const MOCK_TRADING_MARKETS: TradingMarketRaw[] = [
  {
    poolKey: "SUI_USDC",
    baseAsset: "SUI",
    quoteAsset: "USDC",
    midPrice: 3.45,
  },
  {
    poolKey: "DEEP_SUI",
    baseAsset: "DEEP",
    quoteAsset: "SUI",
    midPrice: 0.0842,
  },
  {
    poolKey: "WAL_SUI",
    baseAsset: "WAL",
    quoteAsset: "SUI",
    midPrice: 0.122,
  },
  {
    poolKey: "DEEP_USDC",
    baseAsset: "DEEP",
    quoteAsset: "USDC",
    midPrice: 0.29,
  },
  {
    poolKey: "SUI_SUIUSDE",
    baseAsset: "SUI",
    quoteAsset: "SUIUSDE",
    midPrice: 1.02,
  },
  {
    poolKey: "SUIUSDE_USDC",
    baseAsset: "SUIUSDE",
    quoteAsset: "USDC",
    midPrice: 1.0002,
  },
  {
    poolKey: "XBTC_USDC",
    baseAsset: "XBTC",
    quoteAsset: "USDC",
    midPrice: 95000,
  },
];

export const MOCK_DEEPBOOK_ORDERS: DeepbookOrderRaw[] = [
  {
    orderId: "mock-swap-1",
    poolKey: "SUI_USDC",
    side: "SELL",
    quantity: 1000,
    filledQuantity: 1000,
    status: "FILLED",
    placedAtMs: Date.now() - 86_400_000,
  },
  {
    orderId: "mock-swap-2",
    poolKey: "SUI_USDC",
    side: "BUY",
    quantity: 5500,
    filledQuantity: 5500,
    status: "FILLED",
    placedAtMs: Date.now() - 43_200_000,
  },
  {
    orderId: "mock-swap-3",
    poolKey: "SUI_USDC",
    side: "SELL",
    quantity: 2300,
    filledQuantity: 2300,
    status: "FILLED",
    placedAtMs: Date.now() - 21_600_000,
  },
  {
    orderId: "mock-swap-4",
    poolKey: "DEEP_SUI",
    side: "BUY",
    quantity: 12000,
    filledQuantity: 12000,
    status: "FILLED",
    placedAtMs: Date.now() - 10_800_000,
  },
  {
    orderId: "mock-swap-5",
    poolKey: "DEEP_USDC",
    side: "SELL",
    quantity: 800,
    filledQuantity: 800,
    status: "FILLED",
    placedAtMs: Date.now() - 3_600_000,
  },
];

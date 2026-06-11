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
    poolKey: "WUSDT_USDC",
    baseAsset: "WUSDT",
    quoteAsset: "USDC",
    midPrice: 1.0001,
  },
  {
    poolKey: "WAL_USDC",
    baseAsset: "WAL",
    quoteAsset: "USDC",
    midPrice: 0.42,
  },
];

export const MOCK_DEEPBOOK_ORDERS: DeepbookOrderRaw[] = [
  {
    orderId: "mock-1",
    poolKey: "SUI_USDC",
    side: "SELL",
    quantity: 1000,
    filledQuantity: 1000,
    status: "FILLED",
    placedAtMs: Date.now() - 86_400_000,
  },
  {
    orderId: "mock-2",
    poolKey: "SUI_USDC",
    side: "BUY",
    quantity: 5500,
    filledQuantity: 3200,
    status: "PLACED",
    placedAtMs: Date.now() - 43_200_000,
  },
  {
    orderId: "mock-3",
    poolKey: "SUI_USDC",
    side: "SELL",
    quantity: 2300,
    filledQuantity: 0,
    status: "CANCELED",
    placedAtMs: Date.now() - 21_600_000,
  },
  {
    orderId: "mock-4",
    poolKey: "DEEP_SUI",
    side: "BUY",
    quantity: 12000,
    filledQuantity: 12000,
    status: "FILLED",
    placedAtMs: Date.now() - 10_800_000,
  },
  {
    orderId: "mock-5",
    poolKey: "SUI_USDC",
    side: "SELL",
    quantity: 800,
    filledQuantity: 400,
    status: "PLACED",
    placedAtMs: Date.now() - 3_600_000,
  },
];

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
    kind: "swap",
    side: "SELL",
    quantity: 1000,
    filledQuantity: 1000,
    status: "FILLED",
    placedAtMs: Date.now() - 86_400_000,
  },
  {
    orderId: "mock-swap-2",
    poolKey: "SUI_USDC",
    kind: "swap",
    side: "BUY",
    quantity: 5500,
    filledQuantity: 5500,
    status: "FILLED",
    placedAtMs: Date.now() - 43_200_000,
  },
  {
    orderId: "mock-swap-3",
    poolKey: "SUI_USDC",
    kind: "swap",
    side: "SELL",
    quantity: 2300,
    filledQuantity: 2300,
    status: "FILLED",
    placedAtMs: Date.now() - 21_600_000,
  },
  {
    orderId: "mock-swap-4",
    poolKey: "DEEP_SUI",
    kind: "swap",
    side: "BUY",
    quantity: 12000,
    filledQuantity: 12000,
    status: "FILLED",
    placedAtMs: Date.now() - 10_800_000,
  },
  {
    orderId: "mock-swap-5",
    poolKey: "DEEP_USDC",
    kind: "swap",
    side: "SELL",
    quantity: 800,
    filledQuantity: 800,
    status: "FILLED",
    placedAtMs: Date.now() - 3_600_000,
  },
];

export const MOCK_LIMIT_ORDER_HISTORY: DeepbookOrderRaw[] = [
  {
    orderId: "mock-limit-filled-1",
    poolKey: "DEEP_SUI",
    kind: "limit",
    side: "BUY",
    quantity: 42,
    filledQuantity: 42,
    price: 0.0234,
    status: "FILLED",
    placedAtMs: Date.now() - 1_800_000,
  },
  {
    orderId: "mock-limit-canceled-1",
    poolKey: "SUI_USDC",
    kind: "limit",
    side: "SELL",
    quantity: 500,
    filledQuantity: 0,
    price: 3.55,
    status: "CANCELED",
    placedAtMs: Date.now() - 7_200_000,
  },
];

export const MOCK_OPEN_LIMIT_ORDERS = [
  {
    orderId: "mock-open-1",
    clientOrderId: "10001",
    poolKey: "SUI_USDC",
    side: "SELL" as const,
    pair: "SUI/USDC",
    price: "3.5500",
    quantity: "500.00",
    filledQuantity: "0.00",
    status: "OPEN" as const,
  },
  {
    orderId: "mock-open-2",
    clientOrderId: "10002",
    poolKey: "SUI_USDC",
    side: "BUY" as const,
    pair: "SUI/USDC",
    price: "3.4000",
    quantity: "1,200.00",
    filledQuantity: "300.00",
    status: "PARTIAL" as const,
  },
];

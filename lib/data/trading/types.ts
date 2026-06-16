export type DeepbookOrderStatus = "PLACED" | "FILLED" | "CANCELED" | "PARTIAL";

export type TradingMarketRaw = {
  poolKey: string;
  baseAsset: string;
  quoteAsset: string;
  midPrice: number;
};

export type TradingMarketView = {
  poolKey: string;
  pair: string;
  baseAsset: string;
  quoteAsset: string;
  price: string;
  /** quote per 1 base（卖出 base 换 quote 时使用） */
  rate: number;
};

export type DeepbookOrderRaw = {
  orderId: string;
  poolKey: string;
  side: "BUY" | "SELL";
  quantity: number;
  filledQuantity: number;
  status: DeepbookOrderStatus;
  placedAtMs: number;
};

export type DeepbookOrderView = {
  id: string;
  side: "BUY" | "SELL";
  pair: string;
  amount: string;
  status: DeepbookOrderStatus;
};

export type TradeQuoteView = {
  estimatedOutput: number;
  displayRate: number;
  feeLabel: string;
  deepRequired: number;
};

export type PtbStepStatus = "pending" | "active" | "done" | "error";

export type PtbStepView = {
  id: string;
  label: string;
  status: PtbStepStatus;
  description?: string;
};

export const DEFAULT_PTB_STEP_LABELS = [
  "WITHDRAW",
  "DEEPBOOK_TRADE",
  "SETTLE",
  "REDEPOSIT",
] as const;

export type CreditSourceOption = {
  id: string;
  protocol: string;
  label: string;
};

export type TradeFundLocation = "wallet" | "navi" | "suilend";

export type TradeExecutionRoute =
  | "wallet_wallet"
  | "wallet_navi"
  | "wallet_suilend"
  | "navi_navi"
  | "navi_wallet"
  | "navi_suilend"
  | "suilend_suilend"
  | "suilend_wallet"
  | "suilend_navi"
  | "unsupported";

import type {
  DeepbookOrderView,
  LimitOrderQuoteView,
  OpenLimitOrderView,
  OrderHistoryView,
  TradeQuoteView,
  TradingMarketView,
} from "./types";

export type ListMarketsResult = {
  markets: TradingMarketView[];
};

export type GetMarketQuoteParams = {
  poolKey: string;
  inputAmount: number;
  /** true = 卖出 base 换 quote；false = 卖出 quote 换 base */
  isSellBase: boolean;
};

export type GetLimitOrderQuoteParams = {
  poolKey: string;
  side: "BUY" | "SELL";
  price: number;
  quantityHuman: number;
};

export type ListUserOrdersParams = {
  owner?: string;
  poolKey?: string;
  limit?: number;
};

export type ListUserOrdersResult = {
  orders: DeepbookOrderView[];
  emptyMessage?: string;
};

export type ListOrderHistoryParams = {
  owner?: string;
  poolKey?: string;
  limit?: number;
};

export type ListOrderHistoryResult = {
  orders: OrderHistoryView[];
  emptyMessage?: string;
};

export type ListOpenOrdersParams = {
  owner?: string;
  poolKey?: string;
};

export type ListOpenOrdersResult = {
  orders: OpenLimitOrderView[];
  emptyMessage?: string;
  managerId?: string;
};

export interface TradingRepository {
  listMarkets(): Promise<ListMarketsResult>;
  getMarketQuote(params: GetMarketQuoteParams): Promise<TradeQuoteView>;
  getLimitOrderQuote(params: GetLimitOrderQuoteParams): Promise<LimitOrderQuoteView>;
  listUserOrders(params: ListUserOrdersParams): Promise<ListUserOrdersResult>;
  listOrderHistory(params: ListOrderHistoryParams): Promise<ListOrderHistoryResult>;
  listOpenOrders(params: ListOpenOrdersParams): Promise<ListOpenOrdersResult>;
}

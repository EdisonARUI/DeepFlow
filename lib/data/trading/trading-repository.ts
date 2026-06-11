import type {
  DeepbookOrderView,
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

export type ListUserOrdersParams = {
  owner?: string;
  poolKey?: string;
  limit?: number;
};

export type ListUserOrdersResult = {
  orders: DeepbookOrderView[];
  emptyMessage?: string;
};

export interface TradingRepository {
  listMarkets(): Promise<ListMarketsResult>;
  getMarketQuote(params: GetMarketQuoteParams): Promise<TradeQuoteView>;
  listUserOrders(params: ListUserOrdersParams): Promise<ListUserOrdersResult>;
}

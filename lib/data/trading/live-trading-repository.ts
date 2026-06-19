import { DeepbookTradingAdapter } from "./protocols/deepbook/deepbook-trading-adapter";
import type { TradingRepository } from "./trading-repository";

export class LiveTradingRepository implements TradingRepository {
  private readonly adapter = new DeepbookTradingAdapter();

  listMarkets() {
    return this.adapter.listMarkets();
  }

  getMarketQuote(params: Parameters<TradingRepository["getMarketQuote"]>[0]) {
    return this.adapter.getMarketQuote(params);
  }

  listUserOrders(params: Parameters<TradingRepository["listUserOrders"]>[0]) {
    return this.adapter.listUserOrders(params);
  }

  getLimitOrderQuote(params: Parameters<TradingRepository["getLimitOrderQuote"]>[0]) {
    return this.adapter.getLimitOrderQuote(params);
  }

  listOrderHistory(params: Parameters<TradingRepository["listOrderHistory"]>[0]) {
    return this.adapter.listOrderHistory(params);
  }

  listOpenOrders(params: Parameters<TradingRepository["listOpenOrders"]>[0]) {
    return this.adapter.listOpenOrders(params);
  }
}

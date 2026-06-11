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
}

import {
  MOCK_DEEPBOOK_ORDERS,
  MOCK_TRADING_MARKETS,
} from "@/lib/fixtures/trading";
import {
  mapToDeepbookOrderViews,
  mapToTradingMarketViews,
} from "./map-to-trading-view";
import type {
  GetMarketQuoteParams,
  ListMarketsResult,
  ListUserOrdersParams,
  ListUserOrdersResult,
  TradingRepository,
} from "./trading-repository";
import type { TradeQuoteView } from "./types";

export class MockTradingRepository implements TradingRepository {
  async listMarkets(): Promise<ListMarketsResult> {
    return { markets: mapToTradingMarketViews(MOCK_TRADING_MARKETS) };
  }

  async getMarketQuote(params: GetMarketQuoteParams): Promise<TradeQuoteView> {
    const market = MOCK_TRADING_MARKETS.find((m) => m.poolKey === params.poolKey);
    const rate = market?.midPrice ?? 1;
    const { inputAmount, isSellBase } = params;

    if (!Number.isFinite(inputAmount) || inputAmount <= 0) {
      return {
        estimatedOutput: 0,
        displayRate: isSellBase ? rate : 1 / rate,
        feeLabel: "~0.002 DEEP",
        deepRequired: 2000,
      };
    }

    const estimatedOutput = isSellBase ? inputAmount * rate : inputAmount / rate;
    const displayRate = isSellBase ? rate : 1 / rate;

    return {
      estimatedOutput,
      displayRate,
      feeLabel: "~0.002 DEEP",
      deepRequired: 2000,
    };
  }

  async listUserOrders(params: ListUserOrdersParams): Promise<ListUserOrdersResult> {
    const { poolKey, limit = 20 } = params;
    let orders = MOCK_DEEPBOOK_ORDERS;

    if (poolKey) {
      orders = orders.filter((o) => o.poolKey === poolKey);
    }

    return {
      orders: mapToDeepbookOrderViews(orders.slice(0, limit)),
    };
  }
}

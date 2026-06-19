import {
  MOCK_DEEPBOOK_ORDERS,
  MOCK_LIMIT_ORDER_HISTORY,
  MOCK_OPEN_LIMIT_ORDERS,
  MOCK_TRADING_MARKETS,
} from "@/lib/fixtures/trading";
import { mapToOrderHistoryViews } from "./map-to-order-history-view";
import { mapToTradingMarketViews } from "./map-to-trading-view";
import type {
  GetLimitOrderQuoteParams,
  GetMarketQuoteParams,
  ListMarketsResult,
  ListOpenOrdersParams,
  ListOpenOrdersResult,
  ListOrderHistoryParams,
  ListOrderHistoryResult,
  ListUserOrdersParams,
  ListUserOrdersResult,
  TradingRepository,
} from "./trading-repository";
import type { LimitOrderQuoteView, TradeQuoteView } from "./types";

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
    const result = await this.listOrderHistory(params);
    return {
      orders: result.orders.map((order) => ({
        id: order.id,
        side: order.side,
        pair: order.pair,
        amount: order.amount,
        status: order.status,
      })),
      emptyMessage: result.emptyMessage,
    };
  }

  async listOrderHistory(params: ListOrderHistoryParams): Promise<ListOrderHistoryResult> {
    const { poolKey, limit = 20, owner } = params;

    if (!owner) {
      return {
        orders: [],
        emptyMessage: "Connect wallet to view order history",
      };
    }

    let orders = [...MOCK_DEEPBOOK_ORDERS, ...MOCK_LIMIT_ORDER_HISTORY];

    if (poolKey) {
      orders = orders.filter((order) => order.poolKey === poolKey);
    }

    orders.sort((a, b) => b.placedAtMs - a.placedAtMs);

    const views = mapToOrderHistoryViews(orders.slice(0, limit));

    return {
      orders: views,
      emptyMessage: views.length === 0 ? "No DeepBook orders yet" : undefined,
    };
  }

  async getLimitOrderQuote(params: GetLimitOrderQuoteParams): Promise<LimitOrderQuoteView> {
    const market = MOCK_TRADING_MARKETS.find((m) => m.poolKey === params.poolKey);
    const depositAsset = params.side === "SELL" ? market?.baseAsset ?? "SUI" : market?.quoteAsset ?? "USDC";
    const lockedQuoteEstimate =
      params.side === "BUY"
        ? `${(params.price * params.quantityHuman).toFixed(4)} ${market?.quoteAsset ?? "USDC"}`
        : `${params.quantityHuman.toFixed(4)} ${market?.baseAsset ?? "SUI"}`;

    const minSizeHuman = params.poolKey === "DEEP_SUI" ? 10 : 1;
    const baseAsset = market?.baseAsset ?? "SUI";
    const quoteAsset = market?.quoteAsset ?? "USDC";
    const minOrderLabel =
      params.side === "BUY"
        ? `Min: ${(minSizeHuman * params.price).toFixed(4)} ${quoteAsset}`
        : params.poolKey === "DEEP_SUI"
          ? "Min: 10 DEEP"
          : `Min: 1 ${baseAsset}`;

    return {
      makerFeeLabel: "~0.001 SUI (maker input-fee)",
      lockedQuoteEstimate,
      depositAsset,
      minOrderLabel,
      lotBaseUnits: params.poolKey === "DEEP_SUI" ? 1_000_000n : 1_000_000_000n,
      minBaseUnits: params.poolKey === "DEEP_SUI" ? 10_000_000n : 1_000_000_000n,
    };
  }

  async listOpenOrders(params: ListOpenOrdersParams): Promise<ListOpenOrdersResult> {
    const { poolKey } = params;
    let orders = MOCK_OPEN_LIMIT_ORDERS;

    if (poolKey) {
      orders = orders.filter((order) => order.pair.includes(poolKey.split("_")[0]));
    }

    if (!params.owner) {
      return {
        orders: [],
        emptyMessage: "Connect wallet to view open limit orders",
      };
    }

    return {
      orders,
      managerId: "0xmock-balance-manager",
      emptyMessage: orders.length === 0 ? "No open limit orders" : undefined,
    };
  }
}

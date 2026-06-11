import { mainnetCoins, mainnetPools } from "@mysten/deepbook-v3";
import { createDeepbookClient } from "@/lib/sui/deepbook-client";
import {
  mapToDeepbookOrderViews,
  mapToTradingMarketViews,
} from "../../map-to-trading-view";
import type {
  DeepbookOrderRaw,
  DeepbookOrderStatus,
  TradingMarketRaw,
} from "../../types";
import type {
  GetMarketQuoteParams,
  ListMarketsResult,
  ListUserOrdersParams,
  ListUserOrdersResult,
} from "../../trading-repository";
import type { TradeQuoteView } from "../../types";
import { fetchIndexerOrders } from "./deepbook-indexer-client";

const FEATURED_POOL_KEYS = [
  "SUI_USDC",
  "DEEP_SUI",
  "WUSDT_USDC",
  "WAL_USDC",
] as const;

const MARKETS_CACHE_TTL_MS = 30_000;

let marketsCache: { expiresAt: number; markets: TradingMarketRaw[] } | null =
  null;

function resolveFeaturedPoolKeys(): string[] {
  return FEATURED_POOL_KEYS.filter((key) => key in mainnetPools);
}

function mapIndexerStatus(status: string, filled: number, total: number): DeepbookOrderStatus {
  const normalized = status.toUpperCase();
  if (normalized === "CANCELED" || normalized === "CANCELLED") return "CANCELED";
  if (normalized === "FILLED" || filled >= total) return "FILLED";
  if (filled > 0) return "PARTIAL";
  return "PLACED";
}

function mapIndexerSide(type: string): "BUY" | "SELL" {
  return type.toLowerCase().includes("bid") || type.toLowerCase() === "buy"
    ? "BUY"
    : "SELL";
}

function formatDeepFee(deepRequired: number): string {
  if (!Number.isFinite(deepRequired) || deepRequired <= 0) {
    return "~0 DEEP";
  }
  const scalar = mainnetCoins.DEEP?.scalar ?? 1e6;
  const human = deepRequired / scalar;
  return `~${human.toFixed(4)} DEEP`;
}

export class DeepbookTradingAdapter {
  async listMarkets(): Promise<ListMarketsResult> {
    const now = Date.now();
    if (marketsCache && marketsCache.expiresAt > now) {
      return { markets: mapToTradingMarketViews(marketsCache.markets) };
    }

    const client = createDeepbookClient();
    const poolKeys = resolveFeaturedPoolKeys();

    const markets: TradingMarketRaw[] = await Promise.all(
      poolKeys.map(async (poolKey) => {
        const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
        const midPrice = await client.deepbook.midPrice(poolKey);

        return {
          poolKey,
          baseAsset: pool.baseCoin,
          quoteAsset: pool.quoteCoin,
          midPrice,
        };
      }),
    );

    marketsCache = {
      markets,
      expiresAt: now + MARKETS_CACHE_TTL_MS,
    };

    return { markets: mapToTradingMarketViews(markets) };
  }

  async getMarketQuote(params: GetMarketQuoteParams): Promise<TradeQuoteView> {
    const { poolKey, inputAmount, isSellBase } = params;

    if (!Number.isFinite(inputAmount) || inputAmount <= 0) {
      const market = await this.getMarketMidPrice(poolKey);
      return {
        estimatedOutput: 0,
        displayRate: market,
        feeLabel: "~0 DEEP",
        deepRequired: 0,
      };
    }

    const client = createDeepbookClient();

    if (isSellBase) {
      const result = await client.deepbook.getQuoteQuantityOutInputFee(
        poolKey,
        inputAmount,
      );
      const displayRate =
        inputAmount > 0 ? result.quoteOut / inputAmount : await this.getMarketMidPrice(poolKey);

      return {
        estimatedOutput: result.quoteOut,
        displayRate,
        feeLabel: formatDeepFee(result.deepRequired),
        deepRequired: result.deepRequired,
      };
    }

    const result = await client.deepbook.getBaseQuantityOutInputFee(
      poolKey,
      inputAmount,
    );
    const displayRate =
      result.baseOut > 0
        ? inputAmount / result.baseOut
        : await this.getMarketMidPrice(poolKey);

    return {
      estimatedOutput: result.baseOut,
      displayRate,
      feeLabel: formatDeepFee(result.deepRequired),
      deepRequired: result.deepRequired,
    };
  }

  async listUserOrders(params: ListUserOrdersParams): Promise<ListUserOrdersResult> {
    const { owner, poolKey, limit = 20 } = params;

    if (!owner) {
      return {
        orders: [],
        emptyMessage: "连接钱包以查看 DeepBook 历史订单",
      };
    }

    const client = createDeepbookClient(owner);
    const managerIds = await client.deepbook.getBalanceManagerIds(owner);

    if (managerIds.length === 0) {
      return {
        orders: [],
        emptyMessage: "未找到 Balance Manager，请先在 DeepBook 创建并充值",
      };
    }

    const poolKeys = poolKey ? [poolKey] : resolveFeaturedPoolKeys();
    const orderRaws: DeepbookOrderRaw[] = [];

    for (const managerId of managerIds) {
      for (const key of poolKeys) {
        try {
          const indexerOrders = await fetchIndexerOrders({
            poolName: key,
            balanceManagerId: managerId,
            limit,
            statuses: ["Placed", "Filled", "Canceled"],
          });

          for (const order of indexerOrders) {
            orderRaws.push({
              orderId: order.order_id,
              poolKey: key,
              side: mapIndexerSide(order.type),
              quantity: order.original_quantity,
              filledQuantity: order.filled_quantity,
              status: mapIndexerStatus(
                order.current_status,
                order.filled_quantity,
                order.original_quantity,
              ),
              placedAtMs: order.placed_at,
            });
          }
        } catch {
          // 单池查询失败时跳过，避免整页报错
        }
      }
    }

    orderRaws.sort((a, b) => b.placedAtMs - a.placedAtMs);

    return {
      orders: mapToDeepbookOrderViews(orderRaws.slice(0, limit)),
    };
  }

  private async getMarketMidPrice(poolKey: string): Promise<number> {
    const client = createDeepbookClient();
    return client.deepbook.midPrice(poolKey);
  }
}

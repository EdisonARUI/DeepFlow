import { mainnetCoins, mainnetPools } from "@mysten/deepbook-v3";
import {
  fetchDeepbookMidPrice,
  fetchDeepbookMidPrices,
  resolveFeaturedPoolKeys,
} from "@/lib/data/pricing/deepbook-mid-price-service";
import { createDeepbookClient } from "@/lib/sui/deepbook-client";
import {
  mapToDeepbookOrderViews,
  mapToTradingMarketViews,
} from "../../map-to-trading-view";
import type { DeepbookOrderRaw, TradingMarketRaw } from "../../types";
import type {
  GetMarketQuoteParams,
  ListMarketsResult,
  ListUserOrdersParams,
  ListUserOrdersResult,
} from "../../trading-repository";
import type { TradeQuoteView } from "../../types";
import {
  enrichSwapsWithIndexerTrades,
  fetchIndexerTrades,
  type IndexerTrade,
} from "./deepbook-indexer-client";
import { parseDeepbookSwapTxs } from "./parse-deepbook-swap-txs";

function formatSwapFeeLabel(
  deepRequired: number,
  inputAsset: string,
): string {
  if (!Number.isFinite(deepRequired) || deepRequired <= 0) {
    return `手续费从 ${inputAsset} 扣除`;
  }
  const scalar = mainnetCoins.DEEP?.scalar ?? 1e6;
  const human = deepRequired / scalar;
  return `~${human.toFixed(4)} DEEP`;
}

async function enrichSwapsFromIndexer(
  swaps: DeepbookOrderRaw[],
): Promise<DeepbookOrderRaw[]> {
  if (swaps.length === 0) return swaps;

  const poolKeys = [...new Set(swaps.map((swap) => swap.poolKey))];
  const tradesByDigest = new Map<string, IndexerTrade[]>();

  const minPlacedAtMs = Math.min(...swaps.map((swap) => swap.placedAtMs));
  const maxPlacedAtMs = Math.max(...swaps.map((swap) => swap.placedAtMs));
  const startTime = Math.floor(minPlacedAtMs / 1000) - 60;
  const endTime = Math.floor(maxPlacedAtMs / 1000) + 60;

  await Promise.all(
    poolKeys.map(async (poolKey) => {
      try {
        const trades = await fetchIndexerTrades({
          poolName: poolKey,
          limit: 100,
          startTime,
          endTime,
        });
        for (const trade of trades) {
          const existing = tradesByDigest.get(trade.digest) ?? [];
          existing.push(trade);
          tradesByDigest.set(trade.digest, existing);
        }
      } catch {
        // Indexer 富化失败时降级为 RPC 解析结果
      }
    }),
  );

  return enrichSwapsWithIndexerTrades(swaps, tradesByDigest);
}

export class DeepbookTradingAdapter {
  async listMarkets(): Promise<ListMarketsResult> {
    const poolKeys = resolveFeaturedPoolKeys();
    const midPrices = await fetchDeepbookMidPrices(poolKeys);

    const markets: TradingMarketRaw[] = poolKeys
      .filter((poolKey) => midPrices[poolKey] !== undefined)
      .map((poolKey) => {
        const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
        return {
          poolKey,
          baseAsset: pool.baseCoin,
          quoteAsset: pool.quoteCoin,
          midPrice: midPrices[poolKey],
        };
      });

    return { markets: mapToTradingMarketViews(markets) };
  }

  async getMarketQuote(params: GetMarketQuoteParams): Promise<TradeQuoteView> {
    const { poolKey, inputAmount, isSellBase } = params;

    if (!Number.isFinite(inputAmount) || inputAmount <= 0) {
      const market = await this.getMarketMidPrice(poolKey);
      const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
      const inputAsset = isSellBase ? pool.baseCoin : pool.quoteCoin;
      return {
        estimatedOutput: 0,
        displayRate: market,
        feeLabel: formatSwapFeeLabel(0, inputAsset),
        deepRequired: 0,
      };
    }

    const client = createDeepbookClient();
    const pool = mainnetPools[poolKey as keyof typeof mainnetPools];

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
        feeLabel: formatSwapFeeLabel(result.deepRequired, pool.baseCoin),
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
      feeLabel: formatSwapFeeLabel(result.deepRequired, pool.quoteCoin),
      deepRequired: result.deepRequired,
    };
  }

  async listUserOrders(params: ListUserOrdersParams): Promise<ListUserOrdersResult> {
    const { owner, poolKey, limit = 20 } = params;

    if (!owner) {
      return {
        orders: [],
        emptyMessage: "连接钱包以查看 DeepBook swap 历史",
      };
    }

    try {
      const rpcSwaps = await parseDeepbookSwapTxs({
        owner,
        poolKey,
        limit,
      });
      const enrichedSwaps = await enrichSwapsFromIndexer(rpcSwaps);

      return {
        orders: mapToDeepbookOrderViews(enrichedSwaps),
        emptyMessage:
          enrichedSwaps.length === 0 ? "暂无 DeepBook swap 记录" : undefined,
      };
    } catch {
      return {
        orders: [],
        emptyMessage: "DeepBook swap 历史查询失败，请稍后重试",
      };
    }
  }

  private async getMarketMidPrice(poolKey: string): Promise<number> {
    const price = await fetchDeepbookMidPrice(poolKey);
    return price ?? 0;
  }
}

import { mainnetCoins, mainnetPools } from "@mysten/deepbook-v3";
import {
  balanceManagerConfigEntry,
  deepBookMul,
  DEFAULT_BALANCE_MANAGER_KEY,
  fetchPoolMakerFeeRaw,
  formatLimitOrderMinLabel,
  resolveLimitOrderDepositWithFee,
  resolveLimitOrderQuantityBounds,
  resolveTickAlignedLimitPrice,
  resolveUserBalanceManager,
} from "@deepflow/sdk/trade";
import {
  fetchDeepbookMidPrice,
  fetchDeepbookMidPrices,
  resolveFeaturedPoolKeys,
} from "@/lib/data/pricing/deepbook-mid-price-service";
import { createDeepbookClient } from "@/lib/sui/deepbook-client";
import { mapToOpenLimitOrderViews } from "../../map-open-limit-orders";
import { mapToOrderHistoryViews } from "../../map-to-order-history-view";
import { mapToTradingMarketViews } from "../../map-to-trading-view";
import type {
  LimitOrderQuoteView,
  TradeOrderHistoryRaw,
  TradingMarketRaw,
} from "../../types";
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
} from "../../trading-repository";
import type { TradeQuoteView } from "../../types";
import { parseDeepbookLimitOrderTxs } from "./parse-deepbook-limit-order-txs";
import { parseDeepbookSwapTxs } from "./parse-deepbook-swap-txs";

function formatSwapFeeLabel(
  deepRequired: number,
  inputAsset: string,
): string {
  if (!Number.isFinite(deepRequired) || deepRequired <= 0) {
    return `Fee deducted from ${inputAsset}`;
  }
  const scalar = mainnetCoins.DEEP?.scalar ?? 1e6;
  const human = deepRequired / scalar;
  return `~${human.toFixed(4)} DEEP`;
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
    const { owner, poolKey, limit = 20 } = params;

    if (!owner) {
      return {
        orders: [],
        emptyMessage: "Connect wallet to view order history",
      };
    }

    try {
      const [swapOrders, limitOrders] = await Promise.all([
        parseDeepbookSwapTxs({ owner, poolKey, limit }),
        parseDeepbookLimitOrderTxs({ owner, poolKey, limit }),
      ]);

      const merged: TradeOrderHistoryRaw[] = [
        ...swapOrders.map((order) => ({ ...order, kind: "swap" as const })),
        ...limitOrders,
      ];

      merged.sort((a, b) => b.placedAtMs - a.placedAtMs);

      const views = mapToOrderHistoryViews(merged.slice(0, limit));

      return {
        orders: views,
        emptyMessage: views.length === 0 ? "No DeepBook orders yet" : undefined,
      };
    } catch {
      return {
        orders: [],
        emptyMessage: "Failed to load order history. Please try again.",
      };
    }
  }

  async getLimitOrderQuote(params: GetLimitOrderQuoteParams): Promise<LimitOrderQuoteView> {
    const { poolKey, side, price, quantityHuman } = params;
    const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
    if (!pool) {
      throw new Error(`Unknown pool ${poolKey}`);
    }

    const depositAsset = side === "SELL" ? pool.baseCoin : pool.quoteCoin;
    const baseCoin = mainnetCoins[pool.baseCoin as keyof typeof mainnetCoins];
    const quoteCoin = mainnetCoins[pool.quoteCoin as keyof typeof mainnetCoins];

    let minOrderLabel = "—";
    let lotBaseUnits = 0n;
    let minBaseUnits = 0n;
    try {
      const bounds = await resolveLimitOrderQuantityBounds(poolKey);
      lotBaseUnits = bounds.lotBaseUnits;
      minBaseUnits = bounds.minBaseUnits;
      minOrderLabel = formatLimitOrderMinLabel({
        bounds,
        side,
        price,
        quoteAsset: pool.quoteCoin,
      });
    } catch {
      // ignore bounds fetch failure
    }

    if (quantityHuman <= 0 || price <= 0 || !baseCoin || !quoteCoin) {
      return {
        makerFeeLabel: "—",
        lockedQuoteEstimate:
          side === "BUY"
            ? `${(price * quantityHuman).toFixed(4)} ${pool.quoteCoin}`
            : `${quantityHuman.toFixed(4)} ${pool.baseCoin}`,
        depositAsset,
        minOrderLabel,
        lotBaseUnits,
        minBaseUnits,
      };
    }

    try {
      const alignedPrice = await resolveTickAlignedLimitPrice(poolKey, price);
      const quantityBaseUnits = BigInt(Math.round(quantityHuman * baseCoin.scalar));
      const makerFeeRaw = await fetchPoolMakerFeeRaw(poolKey);
      const resolved = resolveLimitOrderDepositWithFee({
        poolKey,
        side,
        price: alignedPrice,
        quantityBaseUnits,
        makerFeeRaw,
      });

      const depositScalar =
        side === "SELL" ? baseCoin.scalar : quoteCoin.scalar;
      const depositHuman = Number(resolved.depositAmount) / depositScalar;
      const principalHuman =
        side === "SELL"
          ? quantityHuman
          : Number(deepBookMul(resolved.inputQuantity, resolved.inputPrice)) /
            quoteCoin.scalar;
      const feeHuman = Math.max(0, depositHuman - principalHuman);

      return {
        makerFeeLabel: `~${feeHuman.toFixed(4)} ${depositAsset} (maker input-fee)`,
        lockedQuoteEstimate:
          side === "BUY"
            ? `${depositHuman.toFixed(4)} ${pool.quoteCoin} (incl. fee)`
            : `${depositHuman.toFixed(4)} ${pool.baseCoin} (incl. fee)`,
        depositAsset,
        minOrderLabel,
        lotBaseUnits,
        minBaseUnits,
      };
    } catch {
      return {
        makerFeeLabel: "Fee deducted from input asset",
        lockedQuoteEstimate:
          side === "BUY"
            ? `${(price * quantityHuman).toFixed(4)} ${pool.quoteCoin}`
            : `${quantityHuman.toFixed(4)} ${pool.baseCoin}`,
        depositAsset,
        minOrderLabel,
        lotBaseUnits,
        minBaseUnits,
      };
    }
  }

  async listOpenOrders(params: ListOpenOrdersParams): Promise<ListOpenOrdersResult> {
    const { owner, poolKey } = params;

    if (!owner) {
      return {
        orders: [],
        emptyMessage: "Connect wallet to view open limit orders",
      };
    }

    try {
      const { managerId } = await resolveUserBalanceManager(owner);
      if (!managerId) {
        return {
          orders: [],
          emptyMessage: "No DeepBook BalanceManager yet. Place a limit order first.",
        };
      }

      const client = createDeepbookClient(owner, {
        balanceManagers: balanceManagerConfigEntry(managerId),
      });

      const poolKeys = poolKey ? [poolKey] : resolveFeaturedPoolKeys();
      const viewsByPool = await Promise.all(
        poolKeys.map(async (key) => {
          const openOrderIds = await client.deepbook.accountOpenOrders(
            key,
            DEFAULT_BALANCE_MANAGER_KEY,
          );
          if (openOrderIds.length === 0) return [];

          const normalizedOrders = await Promise.all(
            openOrderIds.map(async (orderId) => {
              const order = await client.deepbook.getOrderNormalized(key, orderId);
              return order;
            }),
          );

          return mapToOpenLimitOrderViews(
            key,
            normalizedOrders.filter((order): order is NonNullable<typeof order> => order !== null),
          );
        }),
      );

      const orders = viewsByPool.flat();

      return {
        orders,
        managerId,
        emptyMessage: orders.length === 0 ? "No open limit orders" : undefined,
      };
    } catch {
      return {
        orders: [],
        emptyMessage: "Failed to load open limit orders. Please try again.",
      };
    }
  }

  private async getMarketMidPrice(poolKey: string): Promise<number> {
    const price = await fetchDeepbookMidPrice(poolKey);
    return price ?? 0;
  }
}

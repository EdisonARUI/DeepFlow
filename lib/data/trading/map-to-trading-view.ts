import type {
  DeepbookOrderRaw,
  DeepbookOrderView,
  TradingMarketRaw,
  TradingMarketView,
} from "./types";

export function poolKeyToPairLabel(poolKey: string): string {
  const [base, quote] = poolKey.split("_");
  return `${base} - ${quote}`;
}

export function poolKeyToSlashPair(poolKey: string): string {
  const [base, quote] = poolKey.split("_");
  return `${base}/${quote}`;
}

export function mapToTradingMarketView(raw: TradingMarketRaw): TradingMarketView {
  return {
    poolKey: raw.poolKey,
    pair: poolKeyToPairLabel(raw.poolKey),
    baseAsset: raw.baseAsset,
    quoteAsset: raw.quoteAsset,
    price: raw.midPrice.toFixed(4),
    rate: raw.midPrice,
  };
}

export function mapToTradingMarketViews(raws: TradingMarketRaw[]): TradingMarketView[] {
  return raws.map(mapToTradingMarketView);
}

function formatOrderAmount(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function mapToDeepbookOrderView(raw: DeepbookOrderRaw): DeepbookOrderView {
  return {
    id: raw.orderId,
    side: raw.side,
    pair: poolKeyToSlashPair(raw.poolKey),
    amount: formatOrderAmount(raw.quantity),
    status: raw.status,
  };
}

export function mapToDeepbookOrderViews(raws: DeepbookOrderRaw[]): DeepbookOrderView[] {
  return raws.map(mapToDeepbookOrderView);
}

import type { LiquidityPositionView } from "@/lib/data/liquidity/types";
import { MOCK_TOKEN_USD_PRICES } from "@/lib/fixtures/portfolio";
import { resolveExposureStyle, resolveTokenColor } from "./token-colors";
import type {
  AssetAllocationItem,
  ExposureProtocol,
  PortfolioSummaryView,
  PortfolioTransactionView,
  PortfolioView,
  ProtocolExposureItem,
  ProtocolFilter,
} from "./types";
import { EXPOSURE_PROTOCOLS, PROTOCOL_FILTERS } from "./types";

type PositionLike = Pick<
  LiquidityPositionView,
  "protocol" | "asset" | "coinType" | "suppliedBalance" | "walletCoinBalance" | "decimals"
>;

export type MapToPortfolioViewInput = {
  positions: PositionLike[];
  transactions: PortfolioTransactionView[];
  usdPrices?: Record<string, number>;
  priceWarning?: string;
  transactionWarning?: string;
};

function normalizeProtocol(protocol: string): string {
  return protocol.replace(/^\[|\]$/g, "").toLowerCase();
}

function normalizeAssetKey(asset: string): string {
  return asset.toUpperCase();
}

function resolveUsdPrice(asset: string, prices: Record<string, number>): number | undefined {
  if (asset in prices) return prices[asset];
  const upper = normalizeAssetKey(asset);
  if (upper in prices) return prices[upper];
  return undefined;
}

function balanceToUsd(
  balance: bigint,
  decimals: number,
  asset: string,
  prices: Record<string, number>,
): number {
  const price = resolveUsdPrice(asset, prices);
  if (price === undefined) return 0;
  const divisor = 10 ** decimals;
  return (Number(balance) / divisor) * price;
}

function dedupeWalletBalances(positions: PositionLike[]): Map<string, { asset: string; balance: bigint; decimals: number }> {
  const walletByCoin = new Map<string, { asset: string; balance: bigint; decimals: number }>();

  for (const position of positions) {
    if (position.walletCoinBalance <= BigInt(0)) continue;
    const existing = walletByCoin.get(position.coinType);
    if (!existing || position.walletCoinBalance > existing.balance) {
      walletByCoin.set(position.coinType, {
        asset: position.asset,
        balance: position.walletCoinBalance,
        decimals: position.decimals,
      });
    }
  }

  return walletByCoin;
}

function sumSuppliedUsd(positions: PositionLike[], prices: Record<string, number>): number {
  return positions.reduce(
    (sum, position) =>
      sum + balanceToUsd(position.suppliedBalance, position.decimals, position.asset, prices),
    0,
  );
}

function sumWalletUsd(positions: PositionLike[], prices: Record<string, number>): number {
  const walletByCoin = dedupeWalletBalances(positions);
  let total = 0;
  for (const entry of walletByCoin.values()) {
    total += balanceToUsd(entry.balance, entry.decimals, entry.asset, prices);
  }
  return total;
}

function buildSummary(
  positions: PositionLike[],
  prices: Record<string, number>,
): PortfolioSummaryView {
  const workingCapital = sumSuppliedUsd(positions, prices);
  const idleCapital = sumWalletUsd(positions, prices);
  const totalAssets = workingCapital + idleCapital;
  const utilizationRate =
    totalAssets > 0 ? (workingCapital / totalAssets) * 100 : 0;

  return {
    totalAssets,
    workingCapital,
    idleCapital,
    utilizationRate,
  };
}

function aggregateTokenBalances(
  entries: Array<{ asset: string; usdValue: number }>,
): AssetAllocationItem[] {
  const byAsset = new Map<string, number>();

  for (const entry of entries) {
    if (entry.usdValue <= 0) continue;
    byAsset.set(entry.asset, (byAsset.get(entry.asset) ?? 0) + entry.usdValue);
  }

  const total = [...byAsset.values()].reduce((sum, value) => sum + value, 0);
  if (total <= 0) return [];

  return [...byAsset.entries()]
    .map(([name, value]) => ({
      name,
      value,
      percent: Math.round((value / total) * 100),
      color: resolveTokenColor(name),
    }))
    .sort((a, b) => b.value - a.value);
}

function buildAllocationForFilter(
  positions: PositionLike[],
  filter: ProtocolFilter,
  prices: Record<string, number>,
): AssetAllocationItem[] {
  if (filter === "ALL") {
    const suppliedEntries = positions
      .filter((p) => p.suppliedBalance > BigInt(0))
      .map((p) => ({
        asset: p.asset,
        usdValue: balanceToUsd(p.suppliedBalance, p.decimals, p.asset, prices),
      }));

    const walletEntries = [...dedupeWalletBalances(positions).values()].map((entry) => ({
      asset: entry.asset,
      usdValue: balanceToUsd(entry.balance, entry.decimals, entry.asset, prices),
    }));

    return aggregateTokenBalances([...suppliedEntries, ...walletEntries]);
  }

  if (filter === "WALLET") {
    const walletEntries = [...dedupeWalletBalances(positions).values()].map((entry) => ({
      asset: entry.asset,
      usdValue: balanceToUsd(entry.balance, entry.decimals, entry.asset, prices),
    }));
    return aggregateTokenBalances(walletEntries);
  }

  if (filter === "DEEPBOOK") {
    const deepbookPositions = positions.filter(
      (p) => normalizeProtocol(p.protocol) === "deepbook",
    );
    return buildAllocationForPositions(deepbookPositions, prices, "supplied");
  }

  const protocolKey = filter.toLowerCase();
  const filtered = positions.filter((p) => normalizeProtocol(p.protocol) === protocolKey);
  return buildAllocationForPositions(filtered, prices, "supplied");
}

function buildAllocationForPositions(
  positions: PositionLike[],
  prices: Record<string, number>,
  mode: "supplied" | "wallet",
): AssetAllocationItem[] {
  const entries = positions
    .map((p) => {
      const balance = mode === "supplied" ? p.suppliedBalance : p.walletCoinBalance;
      return {
        asset: p.asset,
        usdValue: balanceToUsd(balance, p.decimals, p.asset, prices),
      };
    })
    .filter((e) => e.usdValue > 0);

  return aggregateTokenBalances(entries);
}

function buildExposure(
  positions: PositionLike[],
  prices: Record<string, number>,
): ProtocolExposureItem[] {
  const bucketValues = new Map<ExposureProtocol, number>();

  for (const protocol of EXPOSURE_PROTOCOLS) {
    bucketValues.set(protocol, 0);
  }

  for (const position of positions) {
    const protocol = normalizeProtocol(position.protocol);
    const bucket = protocol.toUpperCase() as ExposureProtocol;
    if (!EXPOSURE_PROTOCOLS.includes(bucket)) continue;

    const usd = balanceToUsd(
      position.suppliedBalance,
      position.decimals,
      position.asset,
      prices,
    );
    bucketValues.set(bucket, (bucketValues.get(bucket) ?? 0) + usd);
  }

  const walletUsd = sumWalletUsd(positions, prices);
  bucketValues.set("WALLET", walletUsd);

  const total = [...bucketValues.values()].reduce((sum, value) => sum + value, 0);

  return EXPOSURE_PROTOCOLS.map((name) => {
    const value = bucketValues.get(name) ?? 0;
    const style = resolveExposureStyle(name);
    return {
      name,
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
      color: style.color,
      textColor: style.textColor,
    };
  }).filter((item) => item.value > 0);
}

function detectMissingPrices(positions: PositionLike[], prices: Record<string, number>): string | undefined {
  const assets = new Set(positions.map((p) => p.asset));
  const missing = [...assets].filter((asset) => resolveUsdPrice(asset, prices) === undefined);
  if (missing.length === 0) return undefined;
  return `Missing USD prices for assets (${missing.join(", ")}); counted as $0.`;
}

export function mapToPortfolioView(input: MapToPortfolioViewInput): PortfolioView {
  const prices = input.usdPrices ?? MOCK_TOKEN_USD_PRICES;
  const missingPriceWarning = detectMissingPrices(input.positions, prices);

  const allocationByFilter = {} as Record<ProtocolFilter, AssetAllocationItem[]>;
  for (const filter of PROTOCOL_FILTERS) {
    allocationByFilter[filter] = buildAllocationForFilter(input.positions, filter, prices);
  }

  return {
    summary: buildSummary(input.positions, prices),
    allocationByFilter,
    exposure: buildExposure(input.positions, prices),
    transactions: input.transactions,
    priceWarning: input.priceWarning ?? missingPriceWarning,
    transactionWarning: input.transactionWarning,
  };
}

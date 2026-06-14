import { parseAmountToBaseUnits } from "@deepflow/sdk/amount/parse-base-units";

export type NaviSupplyPositionLike = {
  protocol: string;
  type: string;
  "navi-lending-supply"?: {
    amount: string;
    token: { symbol: string; decimals: number };
  };
  "navi-lending-emode-supply"?: {
    amount: string;
    token: { symbol: string; decimals: number };
  };
};

function normalizeSymbol(symbol: string): string {
  return symbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function isAllowedAsset(symbol: string, allowlist: readonly string[]): boolean {
  const normalized = normalizeSymbol(symbol);
  return allowlist.some((asset) => normalizeSymbol(asset) === normalized);
}

/** NAVI SDK returns human-readable decimal amounts; convert to on-chain base units. */
export function parseNaviSupplyAmountToBaseUnits(
  amount: string,
  decimals: number,
): bigint {
  try {
    const trimmed = amount.trim();
    if (!trimmed || trimmed === "0") {
      return BigInt(0);
    }
    return parseAmountToBaseUnits(trimmed, decimals);
  } catch {
    return BigInt(0);
  }
}

export function buildSupplyBalanceMap(
  positions: readonly NaviSupplyPositionLike[],
  allowlist: readonly string[],
): Map<string, bigint> {
  const balances = new Map<string, bigint>();

  for (const position of positions) {
    if (position.protocol !== "navi") continue;

    const supply =
      position.type === "navi-lending-supply"
        ? position["navi-lending-supply"]
        : position.type === "navi-lending-emode-supply"
          ? position["navi-lending-emode-supply"]
          : undefined;

    if (!supply) continue;

    const symbol = supply.token.symbol;
    if (!isAllowedAsset(symbol, allowlist)) continue;

    const key = normalizeSymbol(symbol);
    const amount = parseNaviSupplyAmountToBaseUnits(
      supply.amount,
      supply.token.decimals,
    );
    balances.set(key, (balances.get(key) ?? BigInt(0)) + amount);
  }

  return balances;
}

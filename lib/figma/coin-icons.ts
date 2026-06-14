const COIN_ICON_BY_ASSET: Record<string, string> = {
  SUI: "/figma/coin/SUI.png",
  USDC: "/figma/coin/USDC.png",
  DEEP: "/figma/coin/DEEP.png",
  WAL: "/figma/coin/WAL.png",
  suiUSDe: "/figma/coin/suiUSDe.png",
  SUIUSDE: "/figma/coin/suiUSDe.png",
  xBTC: "/figma/coin/xBTC.png",
  XBTC: "/figma/coin/xBTC.png",
};

export function resolveCoinIconPath(asset: string): string | undefined {
  if (asset in COIN_ICON_BY_ASSET) {
    return COIN_ICON_BY_ASSET[asset];
  }

  const upper = asset.toUpperCase();
  if (upper in COIN_ICON_BY_ASSET) {
    return COIN_ICON_BY_ASSET[upper];
  }

  return undefined;
}

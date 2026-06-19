export const FEATURED_POOL_KEYS = [
  "SUI_USDC",
  "DEEP_SUI",
  "WAL_SUI",
  "DEEP_USDC",
  "SUI_SUIUSDE",
  "SUIUSDE_USDC",
  "XBTC_USDC",
] as const;

export type FeaturedPoolKey = (typeof FEATURED_POOL_KEYS)[number];

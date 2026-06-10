export const NAV_ITEMS = [
  { href: "/portfolio", label: "PORTFOLIO", section: "PORTFOLIO" },
  { href: "/liquidity", label: "LIQUIDITY", section: "LIQUIDITY" },
  { href: "/trading", label: "TRADING", section: "TRADING" },
  { href: "/security", label: "SECURITY", section: "SECURITY" },
] as const;

export type MarketPair = {
  pair: string;
  price: string;
  baseAsset: string;
  quoteAsset: string;
  rate: number;
  baseBalance: number;
  quoteBalance: number;
  active?: boolean;
};

export const MARKET_PAIRS: MarketPair[] = [
  {
    pair: "SUI - USDC",
    price: "0.1129",
    baseAsset: "SUI",
    quoteAsset: "USDC",
    rate: 1.4515,
    baseBalance: 1452,
    quoteBalance: 0,
    active: true,
  },
  {
    pair: "DEEP - SUI",
    price: "0.0842",
    baseAsset: "DEEP",
    quoteAsset: "SUI",
    rate: 0.0842,
    baseBalance: 1850.75,
    quoteBalance: 8200,
    active: false,
  },
  {
    pair: "USDC - USDT",
    price: "1.0001",
    baseAsset: "USDC",
    quoteAsset: "USDT",
    rate: 1.0001,
    baseBalance: 12500.5,
    quoteBalance: 0,
    active: false,
  },
  {
    pair: "WAL - SUI",
    price: "0.0312",
    baseAsset: "WAL",
    quoteAsset: "SUI",
    rate: 0.0312,
    baseBalance: 3400,
    quoteBalance: 8200,
    active: false,
  },
];

export type OrderBookEntry = {
  side: "BUY" | "SELL";
  pair: string;
  amount: string;
};

export const ORDER_BOOK: OrderBookEntry[] = [
  { side: "SELL", pair: "SUI/USDC", amount: "1,000.00" },
  { side: "BUY", pair: "SUI/USDC", amount: "5,500.00" },
  { side: "SELL", pair: "SUI/USDC", amount: "2,300.00" },
  { side: "SELL", pair: "SUI/USDC", amount: "800.00" },
  { side: "SELL", pair: "SUI/USDC", amount: "4,100.00" },
  { side: "BUY", pair: "SUI/USDC", amount: "12,000.00" },
  { side: "SELL", pair: "SUI/USDC", amount: "650.00" },
  { side: "SELL", pair: "SUI/USDC", amount: "3,200.00" },
  { side: "BUY", pair: "SUI/USDC", amount: "7,800.00" },
  { side: "SELL", pair: "SUI/USDC", amount: "1,450.00" },
];

export const PTB_STEPS = ["FUNDS", "ROUTING", "SLIPPAGE", "DEPOSIT"] as const;

export type WhitelistEntry = {
  address: string;
  label: string;
  status: "ACTIVE";
};

export const WHITELIST: WhitelistEntry[] = [
  { address: "0x7a...9f12", label: "TREASURY_MAIN", status: "ACTIVE" },
  { address: "0x3b...e4a1", label: "HOT_WALLET_A", status: "ACTIVE" },
];

export type SessionKey = {
  keyId: string;
  status: "VALID";
  expires: string;
};

export const SESSION_KEYS: SessionKey[] = [
  { keyId: "0x82...a1", status: "VALID", expires: "02:45:12" },
  { keyId: "0x82...a2", status: "VALID", expires: "01:12:08" },
  { keyId: "0x82...a3", status: "VALID", expires: "03:58:44" },
  { keyId: "0x82...a4", status: "VALID", expires: "00:45:30" },
  { keyId: "0x82...a5", status: "VALID", expires: "04:22:17" },
];

export const NAV_ITEMS = [
  { href: "/portfolio", label: "PORTFOLIO", section: "PORTFOLIO" },
  { href: "/liquidity", label: "LIQUIDITY", section: "LIQUIDITY" },
  { href: "/trading", label: "TRADING", section: "TRADING" },
  { href: "/security", label: "SECURITY", section: "SECURITY" },
] as const;

export const PORTFOLIO_SUMMARY = {
  totalAssets: 10_000,
  workingCapital: 8_700,
  idleCapital: 1_300,
  utilizationRate: 87,
} as const;

function allocationValue(percent: number): number {
  return Math.round((PORTFOLIO_SUMMARY.totalAssets * percent) / 100);
}

export type AssetAllocationItem = {
  name: string;
  percent: number;
  value: number;
  color: string;
};

export const PROTOCOL_FILTERS = ["ALL", "NAVI", "SCALLOP", "CETUS", "DEEPBOOK"] as const;
export type ProtocolFilter = (typeof PROTOCOL_FILTERS)[number];

export const ASSET_ALLOCATION_BY_FILTER: Record<ProtocolFilter, AssetAllocationItem[]> = {
  ALL: [
    { name: "SUI", percent: 45, value: allocationValue(45), color: "#00ff41" },
    { name: "USDC", percent: 30, value: allocationValue(30), color: "#00e0ff" },
    { name: "DEEP", percent: 15, value: allocationValue(15), color: "#ffba20" },
    { name: "vSUI", percent: 10, value: allocationValue(10), color: "#e5e2e1" },
  ],
  NAVI: [
    { name: "USDC", percent: 45, value: allocationValue(45), color: "#00e0ff" },
    { name: "SUI", percent: 35, value: allocationValue(35), color: "#ffba20" },
    { name: "suiUSDe", percent: 20, value: allocationValue(20), color: "#72ff70" },
  ],
  SCALLOP: [
    { name: "USDC", percent: 55, value: allocationValue(55), color: "#00e0ff" },
    { name: "WAL", percent: 45, value: allocationValue(45), color: "#ff9100" },
  ],
  CETUS: [
    { name: "DEEP", percent: 55, value: allocationValue(55), color: "#e5e2e1" },
    { name: "SUI", percent: 45, value: allocationValue(45), color: "#ffba20" },
  ],
  DEEPBOOK: [
    { name: "USDC", percent: 65, value: allocationValue(65), color: "#00e0ff" },
    { name: "DEEP", percent: 35, value: allocationValue(35), color: "#e5e2e1" },
  ],
};

export type ProtocolExposureItem = {
  name: string;
  percent: number;
  value: number;
  color: string;
  textColor?: string;
};

export const PROTOCOL_EXPOSURE: ProtocolExposureItem[] = [
  { name: "NAVI", percent: 50, value: 5_000, color: "#00e0ff", textColor: "#001f25" },
  { name: "SCALLOP", percent: 30, value: 3_000, color: "#ffd792", textColor: "#00daf8" },
  { name: "DEEPBOOK", percent: 15, value: 1_500, color: "#00ff41", textColor: "#00daf8" },
  { name: "WALLET", percent: 5, value: 500, color: "#e5e2e1", textColor: "#00daf8" },
];

export type Transaction = {
  date: string;
  type: "SUPPLY" | "WITHDRAW" | "BRIDGE";
  asset: string;
  amount: string;
  status: "COMPLETED" | "PENDING";
  txHash: string;
};

export const TRANSACTIONS: Transaction[] = [
  {
    date: "2023-10-27 09:15",
    type: "SUPPLY",
    asset: "vSUI",
    amount: "+500 vSUI",
    status: "COMPLETED",
    txHash: "0x21...fe90",
  },
  {
    date: "2023-10-26 18:42",
    type: "BRIDGE",
    asset: "USDC",
    amount: "+10,000 USDC",
    status: "PENDING",
    txHash: "0xbb...a012",
  },
  {
    date: "2023-10-26 14:10",
    type: "WITHDRAW",
    asset: "DEEP",
    amount: "-5,000 DEEP",
    status: "COMPLETED",
    txHash: "0x14...8db3",
  },
  {
    date: "2023-10-25 22:18",
    type: "SUPPLY",
    asset: "USDC",
    amount: "+25,000 USDC",
    status: "COMPLETED",
    txHash: "0x99...d21f",
  },
  {
    date: "2023-10-25 11:05",
    type: "WITHDRAW",
    asset: "SUI",
    amount: "-2,000 SUI",
    status: "COMPLETED",
    txHash: "0x7a...b45c",
  },
];

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

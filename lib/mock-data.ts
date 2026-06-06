export const NAV_ITEMS = [
  { href: "/portfolio", label: "PORTFOLIO", section: "PORTFOLIO" },
  { href: "/liquidity", label: "LIQUIDITY", section: "LIQUIDITY" },
  { href: "/trading", label: "TRADING", section: "TRADING" },
  { href: "/security", label: "SECURITY", section: "SECURITY" },
] as const;

export const NET_WORTH = 1248392.42;

export const NET_WORTH_CHART = [
  { label: "30_DAYS_AGO", value: 980000 },
  { label: "20_DAYS_AGO", value: 1050000 },
  { label: "10_DAYS_AGO", value: 1180000 },
  { label: "CURRENT_CYCLE", value: 1248392 },
];

export const ASSET_ALLOCATION = [
  { name: "USDC", percent: 60, color: "#00e0ff" },
  { name: "SUI", percent: 25, color: "#ffba20" },
  { name: "DEEP", percent: 15, color: "#e5e2e1" },
];

export const PROTOCOL_FILTERS = ["ALL", "NAVI", "SCALLOP", "CETUS", "DEEPBOOK"] as const;

export type ProtocolAction = {
  date: string;
  action: "SUPPLY" | "WITHDRAW";
  protocol: string;
  asset: string;
  amount: string;
  status: "COMPLETED" | "PENDING";
  txHash: string;
};

export const PROTOCOL_ACTIONS: ProtocolAction[] = [
  {
    date: "2023-10-27 15:30",
    action: "SUPPLY",
    protocol: "NAVI",
    asset: "SUI",
    amount: "+10,000 SUI",
    status: "COMPLETED",
    txHash: "0x3f...9e21",
  },
  {
    date: "2023-10-27 09:15",
    action: "SUPPLY",
    protocol: "SCALLOP",
    asset: "USDC",
    amount: "+5,000 USDC",
    status: "COMPLETED",
    txHash: "0x21...fe90",
  },
  {
    date: "2023-10-26 18:42",
    action: "WITHDRAW",
    protocol: "NAVI",
    asset: "SUI",
    amount: "-2,000 SUI",
    status: "COMPLETED",
    txHash: "0x14...8db3",
  },
  {
    date: "2023-10-26 11:05",
    action: "WITHDRAW",
    protocol: "CETUS",
    asset: "DEEP",
    amount: "-500 DEEP",
    status: "PENDING",
    txHash: "0x7a...b45c",
  },
  {
    date: "2023-10-25 22:18",
    action: "SUPPLY",
    protocol: "NAVI",
    asset: "USDC",
    amount: "+25,000 USDC",
    status: "COMPLETED",
    txHash: "0x99...d21f",
  },
];

export type DeFiRow = {
  protocol: string;
  protocolColor: string;
  asset: string;
  tvl: string;
  apy: string;
  balance: string;
  selected?: boolean;
};

export const DEFI_ROWS: DeFiRow[] = [
  {
    protocol: "[NAVI]",
    protocolColor: "#18c8ff",
    asset: "USDC",
    tvl: "$8.1M",
    apy: "+8.1%",
    balance: "12,500.50",
    selected: true,
  },
  {
    protocol: "[NAVI]",
    protocolColor: "#18c8ff",
    asset: "suiUSDe",
    tvl: "$8.1M",
    apy: "+8.1%",
    balance: "12,500.50",
  },
  {
    protocol: "[NAVI]",
    protocolColor: "#18c8ff",
    asset: "SUI",
    tvl: "$4.2M",
    apy: "+6.4%",
    balance: "8,200.00",
  },
  {
    protocol: "[SCALLOP]",
    protocolColor: "#ff9100",
    asset: "USDC",
    tvl: "$5.3M",
    apy: "+7.2%",
    balance: "9,100.25",
  },
  {
    protocol: "[SCALLOP]",
    protocolColor: "#ff9100",
    asset: "WAL",
    tvl: "$1.1M",
    apy: "+5.8%",
    balance: "3,400.00",
  },
  {
    protocol: "[CETUS]",
    protocolColor: "#72ff70",
    asset: "DEEP",
    tvl: "$2.8M",
    apy: "+4.5%",
    balance: "1,850.75",
  },
];

export const MARKET_PAIRS = [
  { pair: "SUI - USDC", price: "0.1129", active: true },
  { pair: "DEEP - SUI", price: "0.0842", active: false },
  { pair: "USDC - USDT", price: "1.0001", active: false },
  { pair: "WAL - SUI", price: "0.0312", active: false },
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

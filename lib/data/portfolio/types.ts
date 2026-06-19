export const PROTOCOL_FILTERS = ["ALL", "NAVI", "SUILEND", "DEEPBOOK", "WALLET"] as const;
export type ProtocolFilter = (typeof PROTOCOL_FILTERS)[number];

export const EXPOSURE_PROTOCOLS = [
  "NAVI",
  "SUILEND",
  "SCALLOP",
  "CETUS",
  "DEEPBOOK",
  "WALLET",
] as const;
export type ExposureProtocol = (typeof EXPOSURE_PROTOCOLS)[number];

export type PortfolioSummaryView = {
  totalAssets: number;
  workingCapital: number;
  idleCapital: number;
  utilizationRate: number;
};

export type AssetAllocationItem = {
  name: string;
  percent: number;
  value: number;
  color: string;
};

export type ProtocolExposureItem = {
  name: ExposureProtocol;
  percent: number;
  value: number;
  color: string;
  textColor?: string;
};

export type PortfolioTransactionType =
  | "SUPPLY"
  | "WITHDRAW"
  | "BRIDGE"
  | "GENERIC";

export type PortfolioTransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export type PortfolioTransactionView = {
  date: string;
  timestamp: number;
  type: PortfolioTransactionType;
  asset: string;
  amount: string;
  status: PortfolioTransactionStatus;
  txHash: string;
  txDigest: string;
};

export type PortfolioView = {
  summary: PortfolioSummaryView;
  allocationByFilter: Record<ProtocolFilter, AssetAllocationItem[]>;
  exposure: ProtocolExposureItem[];
  transactions: PortfolioTransactionView[];
  priceWarning?: string;
  transactionWarning?: string;
};

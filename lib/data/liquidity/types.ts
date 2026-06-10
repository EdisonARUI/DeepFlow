export type LiquidityPositionRaw = {
  protocol: string;
  protocolLabel: string;
  protocolColor: string;
  asset: string;
  supplyApyBps: number;
  tvlUsd: number;
  walletBalance: bigint;
  decimals: number;
};

export type LiquidityPositionView = {
  id: string;
  protocol: string;
  protocolColor: string;
  asset: string;
  tvlUsd: number | null;
  supplyApyBps: number;
  walletBalance: bigint;
  decimals: number;
};

export function getLiquidityPositionId(protocolLabel: string, asset: string): string {
  return `${protocolLabel}-${asset}`;
}

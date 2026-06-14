export type LiquidityPositionRaw = {
  protocol: string;
  protocolLabel: string;
  protocolColor: string;
  asset: string;
  coinType: string;
  supplyApyBps: number;
  tvlUsd: number;
  /** NAVI 协议内已 supply 余额（Withdraw 可用） */
  suppliedBalance: bigint;
  /** 钱包内该 coinType 的持币余额（Supply 可用） */
  walletCoinBalance: bigint;
  decimals: number;
};

export type LiquidityPositionView = {
  id: string;
  protocolId: string;
  protocol: string;
  protocolColor: string;
  asset: string;
  coinType: string;
  tvlUsd: number | null;
  supplyApyBps: number;
  suppliedBalance: bigint;
  walletCoinBalance: bigint;
  decimals: number;
};

export function getLiquidityPositionId(protocolLabel: string, asset: string): string {
  return `${protocolLabel}-${asset}`;
}

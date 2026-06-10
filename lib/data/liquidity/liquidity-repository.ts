import type { LiquidityPositionView } from "./types";

export type ListPositionsParams = {
  owner?: string;
};

export type ListPositionsResult = {
  positions: LiquidityPositionView[];
  walletBalanceWarning?: string;
  configurationWarning?: string;
};

export interface LiquidityRepository {
  listPositions(params: ListPositionsParams): Promise<ListPositionsResult>;
}

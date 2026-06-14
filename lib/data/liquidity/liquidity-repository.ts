import type { LiquidityPositionView } from "./types";

export type ListPositionsParams = {
  owner?: string;
  bustCache?: boolean;
};

export type ListPositionsResult = {
  positions: LiquidityPositionView[];
  walletBalanceWarning?: string;
  configurationWarning?: string;
};

export interface LiquidityRepository {
  listPositions(params: ListPositionsParams): Promise<ListPositionsResult>;
}

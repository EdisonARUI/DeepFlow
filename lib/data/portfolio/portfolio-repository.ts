import type { PortfolioView } from "./types";

export type ListPortfolioParams = {
  owner?: string;
  transactionDays?: number;
};

export type ListPortfolioResult = PortfolioView;

export interface PortfolioRepository {
  listPortfolio(params: ListPortfolioParams): Promise<ListPortfolioResult>;
}

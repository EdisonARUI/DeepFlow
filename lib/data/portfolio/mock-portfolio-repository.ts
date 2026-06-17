import { MOCK_LIQUIDITY_RAW } from "@/lib/fixtures/liquidity";
import {
  MOCK_DEEPBOOK_RAW,
  MOCK_PORTFOLIO_TRANSACTIONS,
  MOCK_TOKEN_USD_PRICES,
} from "@/lib/fixtures/portfolio";
import { mapToLiquidityViews } from "@/lib/data/liquidity/map-to-liquidity-view";
import { mapToPortfolioView } from "./map-to-portfolio-view";
import type { ListPortfolioParams, PortfolioRepository } from "./portfolio-repository";

export class MockPortfolioRepository implements PortfolioRepository {
  async listPortfolio(params: ListPortfolioParams) {
    const positions = mapToLiquidityViews([...MOCK_LIQUIDITY_RAW, ...MOCK_DEEPBOOK_RAW]);
    const includeTransactions = params.includeTransactions ?? true;

    return mapToPortfolioView({
      positions,
      transactions: includeTransactions ? MOCK_PORTFOLIO_TRANSACTIONS : [],
      usdPrices: MOCK_TOKEN_USD_PRICES,
    });
  }
}

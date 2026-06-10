import { createLiquidityRepository } from "@/lib/data/liquidity/create-liquidity-repository";
import { MOCK_TOKEN_USD_PRICES } from "@/lib/fixtures/portfolio";
import { mapToPortfolioView } from "./map-to-portfolio-view";
import type { ListPortfolioParams, PortfolioRepository } from "./portfolio-repository";
import { listRecentTransactions } from "./sui-transaction-adapter";

export class LivePortfolioRepository implements PortfolioRepository {
  async listPortfolio(params: ListPortfolioParams) {
    const liquidityRepository = createLiquidityRepository();
    const days = params.transactionDays ?? 30;

    const [liquidityResult, transactionResult] = await Promise.all([
      liquidityRepository.listPositions({ owner: params.owner }),
      listRecentTransactions({ owner: params.owner, days }),
    ]);

    return mapToPortfolioView({
      positions: liquidityResult.positions,
      transactions: transactionResult.transactions,
      usdPrices: MOCK_TOKEN_USD_PRICES,
      priceWarning: liquidityResult.configurationWarning,
      transactionWarning: transactionResult.warning,
    });
  }
}

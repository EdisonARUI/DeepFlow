import { createLiquidityRepository } from "@/lib/data/liquidity/create-liquidity-repository";
import {
  fetchDeepbookUsdPrices,
  mergePriceWarnings,
  uniqueAssetsFromPositions,
} from "@/lib/data/pricing/deepbook-usd-price-oracle";
import { mapToPortfolioView } from "./map-to-portfolio-view";
import type { ListPortfolioParams, PortfolioRepository } from "./portfolio-repository";
import { listRecentTransactions } from "./sui-transaction-adapter";

export class LivePortfolioRepository implements PortfolioRepository {
  async listPortfolio(params: ListPortfolioParams) {
    const liquidityRepository = createLiquidityRepository();
    const days = params.transactionDays ?? 30;
    const includeTransactions = params.includeTransactions ?? true;

    const liquidityPromise = liquidityRepository.listPositions({
      owner: params.owner,
      bustCache: params.bustCache,
    });
    const transactionPromise = includeTransactions
      ? listRecentTransactions({ owner: params.owner, days })
      : Promise.resolve({ transactions: [], warning: undefined });

    const [liquidityResult, transactionResult] = await Promise.all([
      liquidityPromise,
      transactionPromise,
    ]);

    const assets = uniqueAssetsFromPositions(liquidityResult.positions);
    const { prices, warning: priceFetchWarning } = await fetchDeepbookUsdPrices(assets);

    return mapToPortfolioView({
      positions: liquidityResult.positions,
      transactions: transactionResult.transactions,
      usdPrices: prices,
      priceWarning: mergePriceWarnings(
        priceFetchWarning,
        liquidityResult.configurationWarning,
      ),
      transactionWarning: transactionResult.warning,
    });
  }
}

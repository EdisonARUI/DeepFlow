import {
  fetchDeepbookUsdPrices,
  mergePriceWarnings,
  uniqueAssetsFromPositions,
} from "@/lib/data/pricing/deepbook-usd-price-oracle";
import { mapToPortfolioView } from "./map-to-portfolio-view";
import type { ListPortfolioParams, PortfolioRepository } from "./portfolio-repository";

export class LivePortfolioRepository implements PortfolioRepository {
  async listPortfolio(params: ListPortfolioParams) {
    const [
      { createLiquidityRepository },
      { fetchDeepbookBalancePositions },
      { listRecentTransactions },
    ] = await Promise.all([
      import("@/lib/data/liquidity/create-liquidity-repository"),
      import("@/lib/data/deepbook/deepbook-balance-adapter"),
      import("./sui-transaction-adapter"),
    ]);

    const liquidityRepository = await createLiquidityRepository();
    const days = params.transactionDays ?? 30;
    const includeTransactions = params.includeTransactions ?? true;

    const liquidityPromise = liquidityRepository.listPositions({
      owner: params.owner,
      bustCache: params.bustCache,
    });
    const deepbookPromise = fetchDeepbookBalancePositions(params.owner);
    const transactionPromise = includeTransactions
      ? listRecentTransactions({ owner: params.owner, days })
      : Promise.resolve({ transactions: [], warning: undefined });

    const [liquidityResult, deepbookResult, transactionResult] = await Promise.all([
      liquidityPromise,
      deepbookPromise,
      transactionPromise,
    ]);

    const positions = [...liquidityResult.positions, ...deepbookResult.positions];
    const assets = uniqueAssetsFromPositions(positions);
    const { prices, warning: priceFetchWarning } = await fetchDeepbookUsdPrices(assets);

    return mapToPortfolioView({
      positions,
      transactions: transactionResult.transactions,
      usdPrices: prices,
      priceWarning: mergePriceWarnings(
        priceFetchWarning,
        liquidityResult.configurationWarning,
        deepbookResult.warning,
      ),
      transactionWarning: transactionResult.warning,
    });
  }
}

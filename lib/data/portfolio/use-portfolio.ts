"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { subscribeLiquidityPositionsChanged } from "@/lib/data/liquidity/liquidity-data-events";
import { createPortfolioRepository } from "./create-portfolio-repository";
import type { PortfolioView } from "./types";

const EMPTY_PORTFOLIO: PortfolioView = {
  summary: {
    totalAssets: 0,
    workingCapital: 0,
    idleCapital: 0,
    utilizationRate: 0,
  },
  allocationByFilter: {
    ALL: [],
    NAVI: [],
    SUILEND: [],
    WALLET: [],
  },
  exposure: [],
  transactions: [],
};

export function usePortfolio(transactionDays = 30) {
  const account = useCurrentAccount();
  const repository = useMemo(() => createPortfolioRepository(), []);
  const [portfolio, setPortfolio] = useState<PortfolioView>(EMPTY_PORTFOLIO);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPortfolio = useCallback(
    async (options?: { bustCache?: boolean }) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await repository.listPortfolio({
          owner: account?.address,
          transactionDays,
          bustCache: options?.bustCache,
        });
        setPortfolio(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load portfolio"));
        setPortfolio(EMPTY_PORTFOLIO);
      } finally {
        setIsLoading(false);
      }
    },
    [account?.address, repository, transactionDays],
  );

  useEffect(() => {
    void fetchPortfolio();
  }, [fetchPortfolio]);

  useEffect(() => {
    return subscribeLiquidityPositionsChanged(() => {
      void fetchPortfolio({ bustCache: true });
    });
  }, [fetchPortfolio]);

  const refetch = useCallback(
    (options?: { bustCache?: boolean }) => fetchPortfolio(options),
    [fetchPortfolio],
  );

  return {
    portfolio,
    isLoading,
    error,
    refetch,
  };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { subscribeLiquidityPositionsChanged } from "@/lib/data/liquidity/liquidity-data-events";
import { createPortfolioRepository } from "./create-portfolio-repository";
import type { PortfolioRepository } from "./portfolio-repository";
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
    DEEPBOOK: [],
    WALLET: [],
  },
  exposure: [],
  transactions: [],
};

export function usePortfolio(transactionDays = 30) {
  const account = useCurrentAccount();
  const [repository, setRepository] = useState<PortfolioRepository | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioView>(EMPTY_PORTFOLIO);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    void createPortfolioRepository()
      .then((repo) => {
        if (!cancelled) {
          setRepository(repo);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to init portfolio repository"));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchPortfolio = useCallback(
    async (options?: { bustCache?: boolean }) => {
      if (!repository) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const criticalResult = await repository.listPortfolio({
          owner: account?.address,
          transactionDays,
          bustCache: options?.bustCache,
          includeTransactions: false,
        });
        setPortfolio(criticalResult);
        setIsLoading(false);

        const fullResult = await repository.listPortfolio({
          owner: account?.address,
          transactionDays,
          bustCache: options?.bustCache,
          includeTransactions: true,
        });
        setPortfolio(fullResult);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load portfolio"));
        setPortfolio(EMPTY_PORTFOLIO);
        setIsLoading(false);
      }
    },
    [account?.address, repository, transactionDays],
  );

  useEffect(() => {
    if (!repository) {
      return;
    }

    void fetchPortfolio();
  }, [fetchPortfolio, repository]);

  useEffect(() => {
    if (!repository) {
      return;
    }

    return subscribeLiquidityPositionsChanged(() => {
      void fetchPortfolio({ bustCache: true });
    });
  }, [fetchPortfolio, repository]);

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

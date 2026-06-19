"use client";

import { useCallback, useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { createLiquidityRepository } from "./create-liquidity-repository";
import type { LiquidityRepository } from "./liquidity-repository";
import type { LiquidityPositionView } from "./types";

export type RefetchLiquidityPositionsOptions = {
  bustCache?: boolean;
  /** When true, refresh in background without setting isLoading (avoids full-page skeleton). */
  silent?: boolean;
};

export function useLiquidityPositions() {
  const account = useCurrentAccount();
  const [repository, setRepository] = useState<LiquidityRepository | null>(null);
  const [positions, setPositions] = useState<LiquidityPositionView[]>([]);
  const [walletBalanceWarning, setWalletBalanceWarning] = useState<string | undefined>();
  const [configurationWarning, setConfigurationWarning] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    void createLiquidityRepository()
      .then((repo) => {
        if (!cancelled) {
          setRepository(repo);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to init liquidity repository"));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchPositions = useCallback(
    async (options?: RefetchLiquidityPositionsOptions) => {
      if (!repository) {
        return;
      }

      if (!options?.silent) {
        setIsLoading(true);
        setError(null);
        setWalletBalanceWarning(undefined);
        setConfigurationWarning(undefined);
      }

      try {
        const result = await repository.listPositions({
          owner: account?.address,
          bustCache: options?.bustCache,
        });
        setPositions(result.positions);
        setWalletBalanceWarning(result.walletBalanceWarning);
        setConfigurationWarning(result.configurationWarning);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load liquidity positions"));
        setPositions([]);
        setWalletBalanceWarning(undefined);
        setConfigurationWarning(undefined);
      } finally {
        setIsLoading(false);
      }
    },
    [account?.address, repository],
  );

  useEffect(() => {
    if (!repository) {
      return;
    }

    void fetchPositions();
  }, [fetchPositions, repository]);

  const refetch = useCallback(
    (options?: RefetchLiquidityPositionsOptions) => fetchPositions(options),
    [fetchPositions],
  );

  return {
    positions,
    walletBalanceWarning,
    configurationWarning,
    isLoading,
    error,
    refetch,
  };
}

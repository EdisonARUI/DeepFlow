"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { createLiquidityRepository } from "./create-liquidity-repository";
import type { LiquidityPositionView } from "./types";

export type RefetchLiquidityPositionsOptions = {
  bustCache?: boolean;
};

export function useLiquidityPositions() {
  const account = useCurrentAccount();
  const repository = useMemo(() => createLiquidityRepository(), []);
  const [positions, setPositions] = useState<LiquidityPositionView[]>([]);
  const [walletBalanceWarning, setWalletBalanceWarning] = useState<string | undefined>();
  const [configurationWarning, setConfigurationWarning] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPositions = useCallback(
    async (options?: RefetchLiquidityPositionsOptions) => {
      setIsLoading(true);
      setError(null);
      setWalletBalanceWarning(undefined);
      setConfigurationWarning(undefined);

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
    void fetchPositions();
  }, [fetchPositions]);

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

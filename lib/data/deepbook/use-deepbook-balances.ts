"use client";

import { useCallback, useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { subscribeLiquidityPositionsChanged } from "@/lib/data/liquidity/liquidity-data-events";
import {
  deepbookEntriesToBalanceMap,
  fetchDeepbookBalances,
  type DeepbookBalanceEntry,
} from "./deepbook-balance-adapter";

export function useDeepbookBalances() {
  const account = useCurrentAccount();
  const [entries, setEntries] = useState<DeepbookBalanceEntry[]>([]);
  const [balanceByAsset, setBalanceByAsset] = useState<Record<string, bigint>>({});
  const [managerId, setManagerId] = useState<string | undefined>();
  const [warning, setWarning] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalances = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setWarning(undefined);

    try {
      const result = await fetchDeepbookBalances(account?.address);
      setEntries(result.entries);
      setBalanceByAsset(deepbookEntriesToBalanceMap(result.entries));
      setManagerId(result.managerId);
      setWarning(result.warning);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load DeepBook balances"));
      setEntries([]);
      setBalanceByAsset({});
      setManagerId(undefined);
      setWarning(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [account?.address]);

  useEffect(() => {
    void fetchBalances();
  }, [fetchBalances]);

  useEffect(() => {
    return subscribeLiquidityPositionsChanged(() => {
      void fetchBalances();
    });
  }, [fetchBalances]);

  const refetch = useCallback(() => fetchBalances(), [fetchBalances]);

  return {
    entries,
    balanceByAsset,
    managerId,
    warning,
    isLoading,
    error,
    refetch,
  };
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createTradingRepository } from "./create-trading-repository";
import type { TradingMarketView } from "./types";

export function useTradingMarkets() {
  const repository = useMemo(() => createTradingRepository(), []);
  const [markets, setMarkets] = useState<TradingMarketView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMarkets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await repository.listMarkets();
      setMarkets(result.markets);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load markets"));
      setMarkets([]);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void fetchMarkets();
  }, [fetchMarkets]);

  return {
    markets,
    isLoading,
    error,
    refetch: fetchMarkets,
  };
}

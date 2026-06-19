"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { createTradingRepository } from "./create-trading-repository";
import type { OpenLimitOrderView } from "./types";

export function useDeepbookOpenOrders(poolKey?: string) {
  const account = useCurrentAccount();
  const repository = useMemo(() => createTradingRepository(), []);
  const [orders, setOrders] = useState<OpenLimitOrderView[]>([]);
  const [managerId, setManagerId] = useState<string | undefined>();
  const [emptyMessage, setEmptyMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await repository.listOpenOrders({
        owner: account?.address,
        poolKey,
      });
      setOrders(result.orders);
      setManagerId(result.managerId);
      setEmptyMessage(result.emptyMessage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load open orders"));
      setOrders([]);
      setManagerId(undefined);
      setEmptyMessage(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, poolKey, repository]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    managerId,
    emptyMessage,
    isLoading,
    error,
    refetch: fetchOrders,
  };
}

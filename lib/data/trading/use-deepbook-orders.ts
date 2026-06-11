"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { createTradingRepository } from "./create-trading-repository";
import type { DeepbookOrderView } from "./types";

export function useDeepbookOrders(poolKey?: string) {
  const account = useCurrentAccount();
  const repository = useMemo(() => createTradingRepository(), []);
  const [orders, setOrders] = useState<DeepbookOrderView[]>([]);
  const [emptyMessage, setEmptyMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await repository.listUserOrders({
        owner: account?.address,
        poolKey,
        limit: 20,
      });
      setOrders(result.orders);
      setEmptyMessage(result.emptyMessage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load orders"));
      setOrders([]);
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
    emptyMessage,
    isLoading,
    error,
    refetch: fetchOrders,
  };
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { mapToOrderHistoryView } from "./map-to-order-history-view";
import { fetchSwapOrderFromDigest } from "./protocols/deepbook/parse-deepbook-swap-txs";
import { createTradingRepository } from "./create-trading-repository";
import type { OrderHistoryView } from "./types";

const REFETCH_AFTER_EXECUTION_DELAYS_MS = [0, 1500, 3000] as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useOrderHistory(poolKey?: string) {
  const account = useCurrentAccount();
  const repository = useMemo(() => createTradingRepository(), []);
  const [orders, setOrders] = useState<OrderHistoryView[]>([]);
  const [emptyMessage, setEmptyMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const refetchAfterExecutionRunId = useRef(0);

  const fetchOrders = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await repository.listOrderHistory({
          owner: account?.address,
          poolKey,
        });
        setOrders(result.orders);
        setEmptyMessage(result.emptyMessage);
        return result.orders;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load order history"));
        if (!options?.silent) {
          setOrders([]);
          setEmptyMessage(undefined);
        }
        return null;
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [account?.address, poolKey, repository],
  );

  const refetchAfterExecution = useCallback(
    async (digest: string) => {
      const owner = account?.address;
      if (!owner) return;

      const runId = ++refetchAfterExecutionRunId.current;

      try {
        const swap = await fetchSwapOrderFromDigest(digest, owner, poolKey);
        if (runId !== refetchAfterExecutionRunId.current) return;

        if (swap) {
          const optimistic = mapToOrderHistoryView(swap);
          setOrders((previous) => {
            const without = previous.filter((order) => order.id !== digest);
            return [optimistic, ...without];
          });
          setEmptyMessage(undefined);
        }
      } catch {
        // Optimistic parse is best-effort; full refetch below still runs.
      }

      for (const delayMs of REFETCH_AFTER_EXECUTION_DELAYS_MS) {
        if (runId !== refetchAfterExecutionRunId.current) return;
        if (delayMs > 0) {
          await sleep(delayMs);
        }

        const nextOrders = await fetchOrders({ silent: true });
        if (nextOrders?.some((order) => order.id === digest)) {
          break;
        }
      }
    },
    [account?.address, fetchOrders, poolKey],
  );

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    emptyMessage,
    isLoading,
    error,
    refetch: fetchOrders,
    refetchAfterExecution,
  };
}

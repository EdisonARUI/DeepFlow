"use client";

import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { OrderHistoryView } from "@/lib/data/trading/types";
import {
  OrderHistoryFilterToggle,
  type OrderHistoryFilter,
} from "./order-history-filter-toggle";

type OrderHistoryProps = {
  orders: OrderHistoryView[];
  isLoading?: boolean;
  emptyMessage?: string;
};

function emptyMessageForFilter(filter: OrderHistoryFilter): string {
  if (filter === "swap") return "No swap orders yet";
  if (filter === "limit") return "No limit orders yet";
  return "No DeepBook orders yet";
}

export function OrderHistory({ orders, isLoading, emptyMessage }: OrderHistoryProps) {
  const [filter, setFilter] = useState<OrderHistoryFilter>("all");

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.kind === filter);
  }, [filter, orders]);

  const displayEmptyMessage =
    emptyMessage ?? emptyMessageForFilter(filter);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex shrink-0 items-center justify-between gap-2 px-1">
        <p className="text-[10px] tracking-[0.8px] text-text-muted uppercase">History</p>
        <OrderHistoryFilterToggle value={filter} onChange={setFilter} />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {isLoading && (
          <p className="px-3 py-3 text-[12px] text-text-muted">Loading order history…</p>
        )}
        {!isLoading && filteredOrders.length === 0 && (
          <p className="px-3 py-3 text-[12px] text-text-muted">{displayEmptyMessage}</p>
        )}
        {!isLoading &&
          filteredOrders.map((order) => (
            <div
              key={`${order.kind}-${order.id}`}
              className={cn(
                "flex items-center justify-between border-l-2 py-2 pl-2.5 pr-3 text-[12px] tracking-[0.6px]",
                order.side === "BUY"
                  ? "border-accent-green bg-accent-green/5"
                  : "border-destructive bg-destructive/5",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span
                  className={cn(
                    "w-8 shrink-0",
                    order.side === "BUY" ? "text-accent-green" : "text-destructive",
                  )}
                >
                  {order.side}
                </span>
                <span className="min-w-0 truncate text-text-primary">
                  <span className="text-text-muted">{order.kind.toUpperCase()}</span> {order.pair}
                  {order.price ? (
                    <span className="text-text-muted"> @ {order.price}</span>
                  ) : null}
                  <span className="text-text-muted"> [{order.status}]</span>
                </span>
              </div>
              <span className="shrink-0 text-text-primary">{order.amount}</span>
            </div>
          ))}
      </ScrollArea>
    </div>
  );
}

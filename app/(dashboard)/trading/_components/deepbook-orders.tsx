"use client";

import { DashboardPanel } from "@/components/dashboard-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { DeepbookOrderView } from "@/lib/data/trading/types";

type DeepbookOrdersProps = {
  orders: DeepbookOrderView[];
  isLoading?: boolean;
  emptyMessage?: string;
};

export function DeepbookOrders({
  orders,
  isLoading,
  emptyMessage,
}: DeepbookOrdersProps) {
  return (
    <DashboardPanel
      title="ORDERS"
      className="h-full min-h-[500px] xl:min-h-[795px]"
      contentClassName="flex min-h-0 flex-col"
    >
      <ScrollArea className="min-h-0 flex-1">
        {isLoading && (
          <p className="px-3 py-3 text-[12px] text-text-muted">Loading swaps…</p>
        )}
        {!isLoading && orders.length === 0 && (
          <p className="px-3 py-3 text-[12px] text-text-muted">
            {emptyMessage ?? "No DeepBook swaps yet"}
          </p>
        )}
        {!isLoading &&
          orders.map((order) => (
            <div
              key={order.id}
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
                <span
                  className={cn(
                    "min-w-0 truncate",
                    order.side === "BUY" ? "text-accent-green" : "text-destructive",
                  )}
                >
                  {order.pair}
                  <span className="text-text-muted"> [{order.status}]</span>
                </span>
              </div>
              <span className="shrink-0 text-text-primary">{order.amount}</span>
            </div>
          ))}
      </ScrollArea>
    </DashboardPanel>
  );
}

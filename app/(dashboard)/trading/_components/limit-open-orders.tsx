"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { OpenLimitOrderView } from "@/lib/data/trading/types";
import type { CancelOrderStatus } from "@/lib/data/trading/use-cancel-deepbook-order";

type LimitOpenOrdersProps = {
  orders: OpenLimitOrderView[];
  isLoading?: boolean;
  emptyMessage?: string;
  managerId?: string;
  onCancelOrder?: (orderId: string, poolKey: string) => void;
  onCancelAll?: () => void;
  cancelStatus?: CancelOrderStatus;
};

export function LimitOpenOrders({
  orders,
  isLoading,
  emptyMessage,
  managerId,
  onCancelOrder,
  onCancelAll,
  cancelStatus,
}: LimitOpenOrdersProps) {
  const isCancelBusy = cancelStatus === "simulating" || cancelStatus === "executing";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 border-t border-white/10 pt-3">
      <p className="shrink-0 px-1 text-[10px] tracking-[0.8px] text-text-muted uppercase">
        Open Limit Orders
      </p>
      <ScrollArea className="min-h-0 flex-1">
        {isLoading && (
          <p className="px-3 py-3 text-[12px] text-text-muted">Loading open orders…</p>
        )}
        {!isLoading && orders.length === 0 && (
          <p className="px-3 py-3 text-[12px] text-text-muted">
            {emptyMessage ?? "No open limit orders"}
          </p>
        )}
        {!isLoading &&
          orders.map((order) => (
            <div
              key={order.orderId}
              className={cn(
                "flex items-center justify-between gap-2 border-l-2 py-2 pl-2.5 pr-3 text-[12px] tracking-[0.6px]",
                order.side === "BUY"
                  ? "border-accent-green bg-accent-green/5"
                  : "border-destructive bg-destructive/5",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-8 shrink-0",
                      order.side === "BUY" ? "text-accent-green" : "text-destructive",
                    )}
                  >
                    {order.side}
                  </span>
                  <span className="truncate text-text-primary">
                    {order.pair} @ {order.price}
                  </span>
                </div>
                <p className="mt-0.5 pl-10 text-text-muted">
                  {order.filledQuantity}/{order.quantity} · {order.status}
                </p>
              </div>
              {managerId && onCancelOrder && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isCancelBusy}
                  onClick={() => onCancelOrder(order.orderId, order.poolKey)}
                  className="h-6 shrink-0 rounded-full px-2 text-[10px] uppercase"
                >
                  Cancel
                </Button>
              )}
            </div>
          ))}
      </ScrollArea>

      {managerId && onCancelAll && orders.length > 0 && (
        <Button
          type="button"
          variant="outline"
          disabled={isCancelBusy}
          onClick={onCancelAll}
          className="h-8 w-full shrink-0 rounded-[20px] text-[11px] tracking-[0.6px] uppercase"
        >
          Cancel All
        </Button>
      )}
    </div>
  );
}

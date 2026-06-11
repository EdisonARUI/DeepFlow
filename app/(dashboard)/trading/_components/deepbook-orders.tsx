"use client";

import { FileText } from "lucide-react";
import { TerminalPanel } from "@/components/terminal-panel";
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
    <TerminalPanel
      className="h-full"
      contentClassName="p-0"
      title={
        <div className="flex items-center gap-2 text-text-muted">
          <FileText className="size-3" />
          <span className="text-[11px] font-bold tracking-[1.1px] uppercase">
            DEEPBOOK_ORDERS
          </span>
        </div>
      }
    >
      <ScrollArea className="h-[680px]">
        {isLoading && (
          <p className="px-3 py-3 text-[12px] text-text-muted">Loading orders…</p>
        )}
        {!isLoading && orders.length === 0 && (
          <p className="px-3 py-3 text-[12px] text-text-muted">
            {emptyMessage ?? "暂无历史订单"}
          </p>
        )}
        {!isLoading &&
          orders.map((order) => (
            <div
              key={order.id}
              className={cn(
                "flex items-center justify-between border-b border-border-muted/30 px-3 py-2 text-[12px] tracking-[0.6px]",
                order.side === "BUY" ? "text-accent-green" : "text-destructive",
              )}
            >
              <span>
                {order.side} {order.pair}{" "}
                <span className="text-text-muted">[{order.status}]</span>
              </span>
              <span>{order.amount}</span>
            </div>
          ))}
      </ScrollArea>
    </TerminalPanel>
  );
}

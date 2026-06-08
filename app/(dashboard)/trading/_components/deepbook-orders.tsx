import { FileText } from "lucide-react";
import { TerminalPanel } from "@/components/terminal-panel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ORDER_BOOK } from "@/lib/mock-data";

export function DeepbookOrders() {
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
        {ORDER_BOOK.map((order, i) => (
          <div
            key={`${order.side}-${order.amount}-${i}`}
            className={cn(
              "flex items-center justify-between border-b border-border-muted/30 px-3 py-2 text-[12px] tracking-[0.6px]",
              order.side === "BUY" ? "text-accent-green" : "text-destructive",
            )}
          >
            <span>
              {order.side} {order.pair}
            </span>
            <span>{order.amount}</span>
          </div>
        ))}
      </ScrollArea>
    </TerminalPanel>
  );
}

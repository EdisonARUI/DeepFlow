"use client";

import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PortfolioTransactionView } from "@/lib/data/portfolio/types";

const TIMEFRAMES = ["7_DAYS", "30_DAYS"] as const;
export type TransactionTimeframe = (typeof TIMEFRAMES)[number];

type TransactionHistoryProps = {
  transactions: PortfolioTransactionView[];
  timeframe: TransactionTimeframe;
  onTimeframeChange: (timeframe: TransactionTimeframe) => void;
};

export function TransactionHistory({
  transactions,
  timeframe,
  onTimeframeChange,
}: TransactionHistoryProps) {
  return (
    <TerminalPanel
      className="col-span-full"
      contentClassName="p-0"
      title={<TerminalLabel className="text-accent-green">TRANSACTION_HISTORY</TerminalLabel>}
      actions={
        <div className="flex gap-2">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf}
              variant="outline"
              size="sm"
              onClick={() => onTimeframeChange(tf)}
              className={cn(
                "h-auto rounded-none border-border-default px-2.5 py-0.5 text-[12px] tracking-[0.6px] uppercase",
                timeframe === tf
                  ? "border-accent-green text-accent-green"
                  : "bg-transparent text-text-muted",
              )}
            >
              {tf}
            </Button>
          ))}
        </div>
      }
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border-default hover:bg-transparent">
            {["DATE", "TYPE", "ASSET", "AMOUNT", "STATUS", "TX_HASH"].map((col) => (
              <TableHead
                key={col}
                className={cn(
                  "text-[11px] font-bold tracking-[0.6px] text-text-muted uppercase",
                  col === "TX_HASH" && "text-right",
                )}
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow className="border-border-muted/40">
              <TableCell colSpan={6} className="text-center text-sm text-text-muted">
                No transactions in this timeframe.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((row) => (
              <TableRow key={`${row.txHash}-${row.date}`} className="border-border-muted/40">
                <TableCell className="text-[12px] text-text-primary/70">{row.date}</TableCell>
                <TableCell className="text-[12px] font-bold text-text-primary uppercase">
                  {row.type}
                </TableCell>
                <TableCell className="text-[12px]">{row.asset}</TableCell>
                <TableCell
                  className={cn(
                    "text-[12px]",
                    row.amount.startsWith("+") ? "text-accent-cyan" : "text-accent-orange",
                  )}
                >
                  {row.amount}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    variant={
                      row.status === "COMPLETED"
                        ? "completed"
                        : row.status === "FAILED"
                          ? "pending"
                          : "pending"
                    }
                    dot
                  >
                    {row.status}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-right text-[12px] text-text-primary/50">
                  {row.txHash}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TerminalPanel>
  );
}

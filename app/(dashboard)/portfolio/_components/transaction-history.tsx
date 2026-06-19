"use client";

import { StatusBadge } from "@/components/status-badge";
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
import { getTransactionExplorerUrl } from "@/lib/sui/explorer";
import { DashboardPanel } from "@/components/dashboard-panel";

const TIMEFRAMES = ["7_DAYS", "30_DAYS"] as const;
export type TransactionTimeframe = (typeof TIMEFRAMES)[number];

type TransactionHistoryProps = {
  transactions: PortfolioTransactionView[];
  timeframe: TransactionTimeframe;
  onTimeframeChange: (timeframe: TransactionTimeframe) => void;
};

function TimeframeToggle({
  timeframe,
  onTimeframeChange,
}: {
  timeframe: TransactionTimeframe;
  onTimeframeChange: (timeframe: TransactionTimeframe) => void;
}) {
  return (
    <div className="flex h-8 items-center rounded-[20px] border border-accent-cyan-pill">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          type="button"
          onClick={() => onTimeframeChange(tf)}
          className={cn(
            "flex h-8 w-20 items-center justify-center rounded-[20px] text-[12px] tracking-[0.6px] uppercase",
            timeframe === tf
              ? "bg-accent-cyan-pill text-black"
              : "text-text-primary",
          )}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}

function openTransactionExplorer(txDigest: string) {
  window.open(getTransactionExplorerUrl(txDigest), "_blank", "noopener,noreferrer");
}

function handleRowKeyDown(event: React.KeyboardEvent, txDigest: string) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openTransactionExplorer(txDigest);
  }
}

export function TransactionHistory({
  transactions,
  timeframe,
  onTimeframeChange,
}: TransactionHistoryProps) {
  return (
    <DashboardPanel
      className="gap-2.5"
      contentClassName="overflow-hidden"
      title="TRANSACTION"
      actions={
        <TimeframeToggle timeframe={timeframe} onTimeframeChange={onTimeframeChange} />
      }
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border-muted/30 hover:bg-transparent">
            {["DATE", "TYPE", "ASSET", "AMOUNT", "STATUS", "TX_HASH"].map((col) => (
              <TableHead
                key={col}
                className={cn(
                  "p-4 text-[11px] font-bold tracking-[0.6px] text-text-muted uppercase",
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
              <TableCell colSpan={6} className="p-4 text-center text-sm text-text-muted">
                No transactions in this timeframe.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((row) => (
              <TableRow
                key={`${row.txDigest}-${row.date}`}
                role="link"
                tabIndex={0}
                onClick={() => openTransactionExplorer(row.txDigest)}
                onKeyDown={(event) => handleRowKeyDown(event, row.txDigest)}
                className="cursor-pointer border-border-muted/40 bg-[rgba(53,53,52,0.05)] hover:bg-[rgba(53,53,52,0.12)]"
              >
                <TableCell className="p-4 text-[12px] text-text-primary/70">{row.date}</TableCell>
                <TableCell className="p-4 text-[12px] font-bold text-text-primary uppercase">
                  {row.type}
                </TableCell>
                <TableCell className="p-4 text-[12px]">{row.asset}</TableCell>
                <TableCell
                  className={cn(
                    "p-4 text-[12px]",
                    row.amount.startsWith("+") ? "text-accent-cyan" : "text-accent-orange",
                  )}
                >
                  {row.amount}
                </TableCell>
                <TableCell className="p-4">
                  <StatusBadge
                    variant={
                      row.status === "COMPLETED"
                        ? "completed"
                        : row.status === "FAILED"
                          ? "pending"
                          : "pending"
                    }
                    dot
                    className={
                      row.status === "COMPLETED"
                        ? "border-accent-green/30 bg-accent-green/10 text-accent-green [&_span]:bg-accent-green"
                        : undefined
                    }
                  >
                    {row.status}
                  </StatusBadge>
                </TableCell>
                <TableCell className="p-4 text-right text-[12px] text-accent-cyan underline">
                  {row.txHash}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DashboardPanel>
  );
}

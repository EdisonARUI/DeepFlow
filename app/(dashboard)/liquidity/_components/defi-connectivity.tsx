"use client";

import { Building2 } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DEFI_ROWS, getDeFiRowKey } from "@/lib/mock-data";

type DeFiConnectivityProps = {
  selectedKey: string;
  onSelect: (key: string) => void;
};

export function DeFiConnectivity({ selectedKey, onSelect }: DeFiConnectivityProps) {
  return (
    <TerminalPanel
      contentClassName="p-0"
      title={
        <div className="flex items-center gap-2">
          <Building2 className="size-3.5 text-text-primary" />
          <TerminalLabel className="text-text-primary">DEFI_CONNECTIVITY</TerminalLabel>
        </div>
      }
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border-default hover:bg-transparent">
            {["PROTOCOL", "ASSET", "TVL", "APY", "BALANCE"].map((col, i) => (
              <TableHead
                key={col}
                className={cn(
                  "text-[11px] font-normal tracking-[0.6px] text-text-muted uppercase",
                  i > 0 && "text-right",
                )}
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEFI_ROWS.map((row) => {
            const rowKey = getDeFiRowKey(row);
            return (
              <TableRow
                key={rowKey}
                onClick={() => onSelect(rowKey)}
                className={cn(
                  "cursor-pointer border-border-muted/40 hover:bg-bg-secondary/60",
                  selectedKey === rowKey && "bg-accent-cyan/10",
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-2 text-[12px] tracking-[0.6px]">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: row.protocolColor }}
                    />
                    {row.protocol}
                  </div>
                </TableCell>
                <TableCell className="text-right text-[12px]">{row.asset}</TableCell>
                <TableCell className="text-right text-[12px] text-text-muted">
                  {row.tvl}
                </TableCell>
                <TableCell className="text-right text-[12px] text-accent-green">
                  {row.apy}
                </TableCell>
                <TableCell className="text-right text-[12px] text-[#a5eeff]">
                  {row.balance}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TerminalPanel>
  );
}

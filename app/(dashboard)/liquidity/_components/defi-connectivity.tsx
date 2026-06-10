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
import type { LiquidityPositionDisplay } from "@/lib/data/liquidity/liquidity-formatters";
import { cn } from "@/lib/utils";

type DeFiConnectivityProps = {
  positions: LiquidityPositionDisplay[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function DeFiConnectivity({ positions, selectedId, onSelect }: DeFiConnectivityProps) {
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
          {positions.map((position) => (
            <TableRow
              key={position.id}
              onClick={() => onSelect(position.id)}
              className={cn(
                "cursor-pointer border-border-muted/40 hover:bg-bg-secondary/60",
                selectedId === position.id && "bg-accent-cyan/10",
              )}
            >
              <TableCell>
                <div className="flex items-center gap-2 text-[12px] tracking-[0.6px]">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: position.protocolColor }}
                  />
                  {position.protocol}
                </div>
              </TableCell>
              <TableCell className="text-right text-[12px]">{position.asset}</TableCell>
              <TableCell className="text-right text-[12px] text-text-muted">
                {position.tvl}
              </TableCell>
              <TableCell className="text-right text-[12px] text-accent-green">
                {position.apy}
              </TableCell>
              <TableCell className="text-right text-[12px] text-[#a5eeff]">
                {position.suppliedBalanceDisplay}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TerminalPanel>
  );
}

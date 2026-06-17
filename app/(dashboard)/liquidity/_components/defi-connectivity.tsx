"use client";

import { AssetIcon } from "@/components/asset-icon";
import { DashboardPanel } from "@/components/dashboard-panel";
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

const COLUMNS = ["PROTOCOL", "ASSET", "TVL", "APY", "BALANCE"] as const;

export function DeFiConnectivity({ positions, selectedId, onSelect }: DeFiConnectivityProps) {
  return (
    <DashboardPanel title="DEFI" contentClassName="overflow-auto p-4">
      <Table>
        <TableHeader>
          <TableRow className="border-border-muted/30 hover:bg-transparent">
            {COLUMNS.map((col) => (
              <TableHead
                key={col}
                className="p-4 text-[11px] font-bold tracking-[0.6px] text-text-muted uppercase"
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position) => {
            const isSelected = selectedId === position.id;

            return (
              <TableRow
                key={position.id}
                onClick={() => onSelect(position.id)}
                className={cn(
                  "cursor-pointer border-border-muted/40 hover:bg-selection-highlight-hover!",
                  isSelected && "bg-selection-highlight hover:bg-selection-highlight!",
                )}
              >
                <TableCell className="p-4">
                  <div
                    className={cn(
                      "flex items-center gap-2 text-[12px] tracking-[0.6px]",
                      isSelected ? "text-black" : "text-text-primary",
                    )}
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: position.protocolColor }}
                    />
                    {position.protocol}
                  </div>
                </TableCell>
                <TableCell className="p-4">
                  <div
                    className={cn(
                      "flex items-center gap-2 text-[12px] tracking-[0.6px]",
                      isSelected ? "text-black" : "text-text-primary",
                    )}
                  >
                    <AssetIcon asset={position.asset} size="sm" />
                    {position.asset}
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    "p-4 text-[12px] tracking-[0.6px]",
                    isSelected ? "text-black/70" : "text-text-muted",
                  )}
                >
                  {position.totalSupply}
                </TableCell>
                <TableCell
                  className={cn(
                    "p-4 text-[12px] tracking-[0.6px]",
                    isSelected ? "text-black/80" : "text-accent-green",
                  )}
                >
                  {position.apr}
                </TableCell>
                <TableCell
                  className={cn(
                    "p-4 text-[12px] tracking-[0.6px]",
                    isSelected ? "text-black/80" : "text-[#a5eeff]",
                  )}
                >
                  {position.suppliedBalanceDisplay}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </DashboardPanel>
  );
}

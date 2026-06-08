"use client";

import { useMemo, useState } from "react";
import { Building2, Box } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  DEFI_ROWS,
  getDeFiRowKey,
  type DeFiRow,
} from "@/lib/mock-data";

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

type PositionManagementProps = {
  selectedRow: DeFiRow;
  onAssetChange: (key: string) => void;
};

export function PositionManagement({
  selectedRow,
  onAssetChange,
}: PositionManagementProps) {
  const [amount, setAmount] = useState("0.00");
  const [slider, setSlider] = useState([0]);

  const protocolAssets = useMemo(
    () => DEFI_ROWS.filter((row) => row.protocol === selectedRow.protocol),
    [selectedRow.protocol],
  );

  return (
    <Tabs defaultValue="supply">
      <TerminalPanel
        contentClassName="p-0"
        title={
          <div className="flex items-center gap-2">
            <Box className="size-3.5 text-text-primary" />
            <TerminalLabel className="text-text-primary">POSITION_MANAGEMENT</TerminalLabel>
          </div>
        }
        actions={
          <TabsList className="h-auto rounded-none bg-transparent p-0">
            <TabsTrigger
              value="supply"
              className="rounded-none border border-border-default px-4 py-1 text-[11px] uppercase data-[state=active]:border-accent-cyan data-[state=active]:bg-accent-cyan data-[state=active]:text-[var(--text-on-accent)]"
            >
              Supply
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              className="rounded-none border border-border-default px-4 py-1 text-[11px] uppercase data-[state=active]:border-accent-orange data-[state=active]:bg-accent-orange data-[state=active]:text-[var(--text-on-accent)]"
            >
              Withdraw
            </TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="supply" className="mt-0 p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-6">
              <div>
                <Label className="text-[11px] tracking-[1.1px] text-text-muted uppercase">
                  Supply_to{" "}
                  <span className="inline-flex items-center gap-1 text-accent-cyan">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: selectedRow.protocolColor }}
                    />
                    {selectedRow.protocol}
                  </span>
                </Label>
                <div className="mt-3 border border-border-default bg-bg-secondary p-4">
                  <div className="mb-2 flex justify-between text-[11px] text-text-muted uppercase">
                    <span>Input_amount</span>
                    <span>Wallet balance: {selectedRow.balance}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-auto flex-1 rounded-none border-0 bg-transparent p-0 text-3xl shadow-none focus-visible:ring-0"
                    />
                    <Select
                      value={selectedRow.asset}
                      onValueChange={(asset) => {
                        const row = protocolAssets.find((r) => r.asset === asset);
                        if (row) onAssetChange(getDeFiRowKey(row));
                      }}
                    >
                      <SelectTrigger className="w-28 rounded-none border-border-default bg-bg-panel">
                        <SelectValue placeholder={selectedRow.asset} />
                      </SelectTrigger>
                      <SelectContent>
                        {protocolAssets.map((row) => (
                          <SelectItem key={row.asset} value={row.asset}>
                            {row.asset}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Slider
                  value={slider}
                  onValueChange={(value) =>
                    setSlider(Array.isArray(value) ? [...value] : [value])
                  }
                  max={100}
                  step={25}
                  className="[&_[data-slot=slider-range]]:bg-accent-cyan [&_[data-slot=slider-thumb]]:border-accent-cyan"
                />
                <div className="flex justify-between text-[10px] text-text-muted uppercase">
                  {["0%", "25%", "50%", "75%", "100%"].map((mark) => (
                    <span key={mark}>{mark}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="border border-border-default bg-bg-secondary p-4">
              <TerminalLabel className="text-text-primary">TRANSACTION_OVERVIEW</TerminalLabel>
              <dl className="mt-4 space-y-3 text-[12px] tracking-[0.6px]">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Max supply</dt>
                  <dd>75%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Supply APR</dt>
                  <dd className="text-accent-green">{selectedRow.apy}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Gas fee</dt>
                  <dd>-</dd>
                </div>
              </dl>
              <Button className="mt-6 h-10 w-full rounded-none bg-accent-cyan text-[11px] font-bold tracking-[1.1px] text-[var(--text-on-accent)] uppercase hover:bg-accent-cyan/90">
                Supply
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="withdraw" className="mt-0 p-6 text-sm text-text-muted">
          Withdraw 表单占位（{selectedRow.protocol} / {selectedRow.asset}，静态 mock，与 Supply
          布局对称）。
        </TabsContent>
      </TerminalPanel>
    </Tabs>
  );
}

export function LiquidityPageSections() {
  const [selectedKey, setSelectedKey] = useState(getDeFiRowKey(DEFI_ROWS[0]));
  const selectedRow =
    DEFI_ROWS.find((row) => getDeFiRowKey(row) === selectedKey) ?? DEFI_ROWS[0];

  return (
    <>
      <DeFiConnectivity selectedKey={selectedKey} onSelect={setSelectedKey} />
      <PositionManagement selectedRow={selectedRow} onAssetChange={setSelectedKey} />
    </>
  );
}

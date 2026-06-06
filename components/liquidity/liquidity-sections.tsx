"use client";

import { useState } from "react";
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
import { DEFI_ROWS } from "@/lib/mock-data";

export function DeFiConnectivity() {
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
          {DEFI_ROWS.map((row) => (
            <TableRow
              key={`${row.protocol}-${row.asset}`}
              className={cn(
                "border-border-muted/40",
                row.selected && "bg-accent-cyan/10",
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
          ))}
        </TableBody>
      </Table>
    </TerminalPanel>
  );
}

export function PositionManagement() {
  const [amount, setAmount] = useState("0.00");
  const [slider, setSlider] = useState([0]);

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
                    <span className="size-1.5 rounded-full bg-accent-cyan" />
                    [NAVI]
                  </span>
                </Label>
                <div className="mt-3 border border-border-default bg-bg-secondary p-4">
                  <div className="mb-2 flex justify-between text-[11px] text-text-muted uppercase">
                    <span>Input_amount</span>
                    <span>Wallet balance: 0</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-auto flex-1 rounded-none border-0 bg-transparent p-0 text-3xl shadow-none focus-visible:ring-0"
                    />
                    <Select defaultValue="usdc">
                      <SelectTrigger className="w-28 rounded-none border-border-default bg-bg-panel">
                        <SelectValue placeholder="USDC" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usdc">USDC</SelectItem>
                        <SelectItem value="sui">SUI</SelectItem>
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
                  <dd className="text-accent-green">3.014%</dd>
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
          Withdraw 表单占位（静态 mock，与 Supply 布局对称）。
        </TabsContent>
      </TerminalPanel>
    </Tabs>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Zap } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MarketPair } from "@/lib/mock-data";
import {
  computeToAmount,
  formatBalance,
  getSwapAssets,
} from "./trading-utils";

type SwapWidgetProps = {
  pairData: MarketPair;
  isReversed: boolean;
  onToggleDirection: () => void;
};

export function SwapWidget({
  pairData,
  isReversed,
  onToggleDirection,
}: SwapWidgetProps) {
  const [fromAmount, setFromAmount] = useState("100.00");

  const { from, to, fromBalance, toBalance, displayRate } = useMemo(
    () => getSwapAssets(pairData, isReversed),
    [pairData, isReversed],
  );

  const parsedFromAmount = parseFloat(fromAmount) || 0;
  const toAmount = computeToAmount(parsedFromAmount, pairData, isReversed);

  return (
    <TerminalPanel
      className="h-full"
      contentClassName="flex flex-col gap-4 p-6"
      title={<TerminalLabel>SWAP_WIDGET</TerminalLabel>}
    >
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] text-text-muted uppercase">
          <span>From</span>
          <span>
            Balance: {formatBalance(fromBalance)} {from}
          </span>
        </div>
        <div className="flex items-center gap-3 border border-border-default bg-bg-secondary p-4">
          <Input
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="h-auto flex-1 rounded-none border-0 bg-transparent p-0 text-3xl shadow-none focus-visible:ring-0"
          />
          <Select value={from.toLowerCase()} disabled>
            <SelectTrigger className="w-24 rounded-none border-border-default">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={pairData.baseAsset.toLowerCase()}>
                {pairData.baseAsset}
              </SelectItem>
              <SelectItem value={pairData.quoteAsset.toLowerCase()}>
                {pairData.quoteAsset}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onToggleDirection}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border-default bg-bg-panel transition-colors hover:border-accent-cyan hover:bg-accent-cyan/10"
          aria-label="Swap direction"
        >
          <ArrowDownUp className="size-4 text-accent-cyan" />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] text-text-muted uppercase">
          <span>To</span>
          <span>
            Balance: {formatBalance(toBalance)} {to}
          </span>
        </div>
        <div className="flex items-center gap-3 border border-border-default bg-bg-secondary p-4">
          <Input
            readOnly
            value={toAmount > 0 ? toAmount.toFixed(2) : "0.00"}
            className="h-auto flex-1 rounded-none border-0 bg-transparent p-0 text-3xl shadow-none focus-visible:ring-0"
          />
          <Select value={to.toLowerCase()} disabled>
            <SelectTrigger className="w-24 rounded-none border-border-default">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={pairData.baseAsset.toLowerCase()}>
                {pairData.baseAsset}
              </SelectItem>
              <SelectItem value={pairData.quoteAsset.toLowerCase()}>
                {pairData.quoteAsset}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <dl className="space-y-2 border-t border-border-muted/40 pt-4 text-[12px] tracking-[0.6px]">
        <div className="flex justify-between">
          <dt className="text-text-muted">Rate</dt>
          <dd>
            1 {from} = {displayRate.toFixed(4)} {to}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-muted">Fee</dt>
          <dd className="text-accent-cyan">~0.002 DEEP</dd>
        </div>
      </dl>
      <Button className="mt-auto h-12 w-full rounded-none bg-accent-cyan text-sm font-bold tracking-[1.1px] text-[var(--text-on-accent)] uppercase hover:bg-accent-cyan/90">
        <Zap className="size-4" />
        Execute
      </Button>
    </TerminalPanel>
  );
}

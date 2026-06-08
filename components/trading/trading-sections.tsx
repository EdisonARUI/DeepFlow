"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  FileText,
  LayoutGrid,
  Network,
  Zap,
} from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  MARKET_PAIRS,
  ORDER_BOOK,
  PTB_STEPS,
  type MarketPair,
} from "@/lib/mock-data";

function formatBalance(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getSwapAssets(pair: MarketPair, isReversed: boolean) {
  const from = isReversed ? pair.quoteAsset : pair.baseAsset;
  const to = isReversed ? pair.baseAsset : pair.quoteAsset;
  const fromBalance = isReversed ? pair.quoteBalance : pair.baseBalance;
  const toBalance = isReversed ? pair.baseBalance : pair.quoteBalance;
  const displayRate = isReversed ? 1 / pair.rate : pair.rate;

  return { from, to, fromBalance, toBalance, displayRate };
}

function computeToAmount(
  fromAmount: number,
  pair: MarketPair,
  isReversed: boolean,
) {
  if (!Number.isFinite(fromAmount) || fromAmount <= 0) return 0;
  return isReversed ? fromAmount / pair.rate : fromAmount * pair.rate;
}

type MarketPairsProps = {
  selectedPair: string;
  onSelectPair: (pair: string) => void;
};

export function MarketPairs({ selectedPair, onSelectPair }: MarketPairsProps) {
  return (
    <TerminalPanel
      className="h-full"
      contentClassName="p-0"
      title={
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-3 text-accent-cyan" />
          <TerminalLabel>MARKET_PAIRS</TerminalLabel>
        </div>
      }
    >
      <ScrollArea className="h-[680px]">
        {MARKET_PAIRS.map((pair) => (
          <button
            key={pair.pair}
            type="button"
            onClick={() => onSelectPair(pair.pair)}
            className={cn(
              "flex w-full items-center justify-between border-b border-border-muted/40 px-3 py-3 text-left text-[12px] tracking-[0.6px]",
              selectedPair === pair.pair
                ? "border-l-2 border-l-accent-cyan bg-accent-cyan/10"
                : "hover:bg-bg-panel-header/50",
            )}
          >
            <span>{pair.pair}</span>
            <span className="text-text-muted">{pair.price}</span>
          </button>
        ))}
      </ScrollArea>
    </TerminalPanel>
  );
}

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

export function TradingWorkspace() {
  const [selectedPair, setSelectedPair] = useState(MARKET_PAIRS[0].pair);
  const [isReversed, setIsReversed] = useState(false);

  const pairData =
    MARKET_PAIRS.find((p) => p.pair === selectedPair) ?? MARKET_PAIRS[0];

  return (
    <>
      <MarketPairs
        selectedPair={selectedPair}
        onSelectPair={setSelectedPair}
      />
      <SwapWidget
        pairData={pairData}
        isReversed={isReversed}
        onToggleDirection={() => setIsReversed((prev) => !prev)}
      />
    </>
  );
}

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

export function PtbPipeline() {
  return (
    <TerminalPanel
      contentClassName="py-8"
      title={
        <div className="flex items-center gap-2">
          <Network className="size-4 text-accent-cyan" />
          <TerminalLabel>REAL-TIME PTB EXECUTION PIPELINE</TerminalLabel>
        </div>
      }
    >
      <div className="flex items-center justify-between px-8">
        {PTB_STEPS.map((step, index) => (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full border-2 border-accent-cyan">
                <span className="size-2 rounded-full bg-accent-cyan" />
              </div>
              <span className="text-[11px] tracking-[0.6px] text-accent-cyan uppercase">
                [{step}]
              </span>
            </div>
            {index < PTB_STEPS.length - 1 && (
              <div className="mx-2 h-px flex-1 bg-border-default" />
            )}
          </div>
        ))}
      </div>
    </TerminalPanel>
  );
}

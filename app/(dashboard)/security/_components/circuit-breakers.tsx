"use client";

import { Zap } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

export function CircuitBreakers() {
  return (
    <TerminalPanel
      className="col-span-12 lg:col-span-5"
      contentClassName="space-y-5 p-5"
      title={
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-accent-orange" />
          <TerminalLabel className="text-text-primary">CIRCUIT_BREAKERS</TerminalLabel>
        </div>
      }
    >
      <div className="space-y-2">
        <div className="flex justify-between text-[12px]">
          <span className="text-text-muted">Max slippage tolerance</span>
          <span className="text-accent-orange">0.5%</span>
        </div>
        <Slider defaultValue={[25]} max={100} className="[&_[data-slot=slider-range]]:bg-accent-orange" />
        <div className="flex justify-between text-[10px] text-text-muted uppercase">
          <span>0.1%</span>
          <span>2.0%</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[12px]">
          <span className="text-text-muted">Rollback threshold</span>
          <span className="text-destructive">$50,000</span>
        </div>
        <Progress value={50} className="h-2 bg-bg-secondary [&>div]:bg-destructive/70" />
      </div>
      <Button className="w-full rounded-none bg-accent-cyan text-[11px] font-bold tracking-[1.1px] text-[var(--text-on-accent)] uppercase">
        SET
      </Button>
    </TerminalPanel>
  );
}

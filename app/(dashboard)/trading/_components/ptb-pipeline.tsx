"use client";

import { Network } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { cn } from "@/lib/utils";
import type { PtbStepView } from "@/lib/data/trading/types";

type PtbPipelineProps = {
  steps: PtbStepView[];
};

export function PtbPipeline({ steps }: PtbPipelineProps) {
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
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2",
                  step.status === "done" && "border-accent-cyan bg-accent-cyan/20",
                  step.status === "active" && "border-accent-cyan animate-pulse",
                  step.status === "error" && "border-destructive",
                  step.status === "pending" && "border-border-default",
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    step.status === "done" && "bg-accent-cyan",
                    step.status === "active" && "bg-accent-cyan",
                    step.status === "error" && "bg-destructive",
                    step.status === "pending" && "bg-border-default",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[11px] tracking-[0.6px] uppercase",
                  step.status === "error" ? "text-destructive" : "text-accent-cyan",
                )}
              >
                [{step.label}]
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-px flex-1",
                  step.status === "done" ? "bg-accent-cyan/60" : "bg-border-default",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </TerminalPanel>
  );
}

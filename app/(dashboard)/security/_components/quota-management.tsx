"use client";

import { AlertTriangle } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export function QuotaManagement() {
  return (
    <TerminalPanel
      className="col-span-12 lg:col-span-5"
      contentClassName="space-y-5 p-5"
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-destructive" />
          <TerminalLabel className="text-text-primary">QUOTA_MGMT</TerminalLabel>
        </div>
      }
    >
      <div className="space-y-2">
        <div className="flex justify-between text-[12px]">
          <span className="text-text-muted">Current utilization</span>
          <span>
            <span className="text-destructive">$142,500</span>
            <span className="text-text-muted"> / $200,000</span>
          </span>
        </div>
        <Progress value={71} className="h-2 bg-bg-secondary [&>div]:bg-destructive/60" />
      </div>
      <div className="space-y-2">
        <span className="text-[11px] text-text-muted uppercase">Update daily limit</span>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center border border-border-default bg-bg-secondary px-3">
            <span className="text-text-muted">$</span>
            <Input
              defaultValue="200000"
              className="rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>
          <Button
            size="sm"
            className="rounded-none bg-accent-cyan text-[11px] font-bold text-[var(--text-on-accent)] uppercase"
          >
            SET
          </Button>
        </div>
      </div>
    </TerminalPanel>
  );
}

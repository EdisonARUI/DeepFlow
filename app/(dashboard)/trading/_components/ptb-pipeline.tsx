import { Network } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { PTB_STEPS } from "@/lib/mock-data";

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

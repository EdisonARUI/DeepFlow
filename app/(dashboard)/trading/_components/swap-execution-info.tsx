"use client";

type SwapExecutionInfoProps = {
  rateLabel: string;
  feeLabel: string;
};

export function SwapExecutionInfo({ rateLabel, feeLabel }: SwapExecutionInfoProps) {
  return (
    <div className="rounded-[20px] border border-border-default bg-bg-panel p-[9px]">
      <div className="flex items-start justify-between text-[12px] tracking-[0.6px]">
        <span className="text-text-muted">RATE</span>
        <span className="text-text-primary">{rateLabel}</span>
      </div>
      <div className="mt-1 flex items-start justify-between text-[12px] tracking-[0.6px]">
        <span className="text-text-muted">FEE</span>
        <span className="text-accent-cyan">{feeLabel}</span>
      </div>
    </div>
  );
}

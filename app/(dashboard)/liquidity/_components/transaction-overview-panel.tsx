import { TerminalLabel } from "@/components/terminal-label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TransactionOverviewRow = {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
};

type TransactionOverviewPanelProps = {
  rows: TransactionOverviewRow[];
  actionLabel: string;
  onAction?: () => void;
};

export function TransactionOverviewPanel({
  rows,
  actionLabel,
  onAction,
}: TransactionOverviewPanelProps) {
  return (
    <div className="flex flex-col justify-between border border-border-default bg-bg-secondary p-4">
      <div>
        <TerminalLabel className="border-b border-border-default pb-2 text-text-primary">
          TRANSACTION_OVERVIEW
        </TerminalLabel>
        <dl className="mt-4 space-y-3 text-[12px] tracking-[0.6px]">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between">
              <dt className="text-text-muted">{row.label}</dt>
              <dd className={cn(row.valueClassName)}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <Button
        type="button"
        onClick={onAction}
        className="mt-6 h-10 w-full rounded-none bg-accent-cyan text-[11px] font-bold tracking-[1.1px] text-[var(--text-on-accent)] uppercase hover:bg-accent-cyan/90"
      >
        {actionLabel}
      </Button>
    </div>
  );
}

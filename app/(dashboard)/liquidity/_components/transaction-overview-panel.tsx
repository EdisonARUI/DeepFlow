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
  isLoading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  statusMessage?: React.ReactNode;
  statusVariant?: "success" | "error";
};

export function TransactionOverviewPanel({
  rows,
  actionLabel,
  onAction,
  isLoading = false,
  loadingLabel = "Simulating...",
  disabled = false,
  statusMessage,
  statusVariant,
}: TransactionOverviewPanelProps) {
  const isActionDisabled = disabled || isLoading;

  return (
    <div className="flex h-full flex-col justify-between gap-4 rounded-[20px] bg-bg-secondary p-4">
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
        {statusMessage && (
          <p
            className={cn(
              "mt-3 text-[11px] tracking-[0.6px]",
              statusVariant === "success" && "text-accent-green",
              statusVariant === "error" && "text-destructive",
              !statusVariant && "text-text-muted",
            )}
          >
            {statusMessage}
          </p>
        )}
      </div>
      <Button
        type="button"
        onClick={onAction}
        disabled={isActionDisabled}
        className="h-8 w-full rounded-[20px] bg-accent-cyan text-[11px] font-bold tracking-[1.1px] text-[var(--text-on-accent)] uppercase hover:bg-accent-cyan/90 disabled:opacity-50"
      >
        {isLoading ? loadingLabel : actionLabel}
      </Button>
    </div>
  );
}

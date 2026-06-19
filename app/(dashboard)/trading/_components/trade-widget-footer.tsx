"use client";

import { Button } from "@/components/ui/button";
import { getTransactionExplorerUrl } from "@/lib/sui/explorer";

function truncateDigest(digest: string): string {
  if (digest.length <= 12) return digest;
  return `${digest.slice(0, 6)}...${digest.slice(-4)}`;
}

type TradeWidgetFooterProps = {
  error?: string;
  status: "idle" | "simulating" | "success" | "executing" | "executed" | "error";
  txDigest?: string;
  executionNote?: string;
  isBusy: boolean;
  onExecute: () => void;
};

export function TradeWidgetFooter({
  error,
  status,
  txDigest,
  executionNote,
  isBusy,
  onExecute,
}: TradeWidgetFooterProps) {
  const buttonLabel = (() => {
    if (status === "simulating") return "Simulating…";
    if (status === "executing") return "Signing…";
    return "Execute";
  })();

  return (
    <>
      {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
      {status === "success" ? (
        <p className="text-[12px] text-accent-green">Simulation passed</p>
      ) : null}
      {status === "executed" && txDigest ? (
        <p className="text-[12px] text-accent-green">
          {executionNote ? `${executionNote}: ` : "Transaction submitted: "}
          <a
            href={getTransactionExplorerUrl(txDigest)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan underline"
          >
            {truncateDigest(txDigest)}
          </a>
        </p>
      ) : null}

      <Button
        type="button"
        disabled={isBusy}
        onClick={onExecute}
        className="h-8 w-full rounded-[20px] bg-accent-cyan text-[11px] font-bold tracking-[0.6px] text-[var(--text-on-accent)] uppercase hover:bg-accent-cyan/90"
      >
        {buttonLabel}
      </Button>
    </>
  );
}

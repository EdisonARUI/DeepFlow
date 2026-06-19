"use client";

import { ArrowDownUp } from "lucide-react";

type TradeDirectionFlipProps = {
  onClick: () => void;
  ariaLabel?: string;
};

export function TradeDirectionFlip({
  onClick,
  ariaLabel = "Toggle direction",
}: TradeDirectionFlipProps) {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="flex size-[34px] cursor-pointer items-center justify-center rounded-full border border-border-default bg-bg-primary p-2.5 transition-colors hover:border-accent-cyan/40"
        aria-label={ariaLabel}
      >
        <ArrowDownUp className="size-4 text-text-primary" />
      </button>
    </div>
  );
}

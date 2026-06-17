"use client";

import { ConnectButton as DAppConnectButton } from "@mysten/dapp-kit-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const defaultButtonClassName = cn(
  "inline-flex items-center justify-center px-4 py-1.5",
  "bg-accent-cyan text-[11px] font-bold tracking-[1.1px] text-[var(--text-on-accent)] uppercase",
  "hover:bg-accent-cyan/90 transition-colors",
  "disabled:opacity-50",
);

const dashboardPlaceholderClassName = cn(
  "inline-flex h-8 min-w-[171px] items-center justify-center rounded-[50px] px-8",
  "bg-accent-cyan-pill text-base font-bold tracking-[0.6px] text-black uppercase",
  "opacity-50",
);

type ConnectButtonProps = {
  variant?: "default" | "dashboard";
};

export function ConnectButton({ variant = "default" }: ConnectButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className={variant === "dashboard" ? dashboardPlaceholderClassName : defaultButtonClassName}
      >
        {variant === "dashboard" ? "CONNECT_WALLET" : "LOADING..."}
      </button>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className="dashboard-connect-button inline-flex h-8 items-center">
        <DAppConnectButton>
          <span>CONNECT_WALLET</span>
        </DAppConnectButton>
      </div>
    );
  }

  return (
    <div className="[&_button]:rounded-none [&_button]:border-0 [&_button]:bg-accent-cyan [&_button]:px-4 [&_button]:py-1.5 [&_button]:text-[11px] [&_button]:font-bold [&_button]:tracking-[1.1px] [&_button]:text-[var(--text-on-accent)] [&_button]:uppercase [&_button]:hover:bg-accent-cyan/90">
      <DAppConnectButton />
    </div>
  );
}

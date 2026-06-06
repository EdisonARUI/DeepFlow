"use client";

import { ConnectButton as DAppConnectButton } from "@mysten/dapp-kit-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const buttonClassName = cn(
  "inline-flex items-center justify-center px-4 py-1.5",
  "bg-accent-cyan text-[11px] font-bold tracking-[1.1px] text-[var(--text-on-accent)] uppercase",
  "hover:bg-accent-cyan/90 transition-colors",
  "disabled:opacity-50",
);

export function ConnectButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button type="button" disabled className={buttonClassName}>
        LOADING...
      </button>
    );
  }

  return (
    <div className="[&_button]:bg-accent-cyan [&_button]:px-4 [&_button]:py-1.5 [&_button]:text-[11px] [&_button]:font-bold [&_button]:tracking-[1.1px] [&_button]:text-[var(--text-on-accent)] [&_button]:uppercase [&_button]:hover:bg-accent-cyan/90 [&_button]:rounded-none [&_button]:border-0">
      <DAppConnectButton />
    </div>
  );
}

"use client";

import { ConnectButton as DAppConnectButton } from "@mysten/dapp-kit-react";
import { useEffect, useState } from "react";

export function ConnectButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="px-4 py-1.5 text-[11px] tracking-[0.6px] text-[var(--text-muted)]"
      >
        LOADING...
      </button>
    );
  }

  return <DAppConnectButton />;
}

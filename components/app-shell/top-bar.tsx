"use client";

import { usePathname } from "next/navigation";
import { ConnectButton } from "@/components/connect-button";
import { NAV_ITEMS } from "@/lib/mock-data";

export function TopBar() {
  const pathname = usePathname();
  const section =
    NAV_ITEMS.find((item) => item.href === pathname)?.section ?? "TERMINAL";

  return (
    <header className="fixed top-0 right-0 left-64 z-30 flex h-16 items-center justify-between border-b border-border-default bg-bg-primary px-6">
      <div className="flex items-center gap-2 text-[11px] font-bold tracking-[1.1px] uppercase">
        <span className="text-text-muted">DEEPFLOW</span>
        <span className="text-border-default">/</span>
        <span className="text-accent-cyan">{section}</span>
      </div>
      <ConnectButton />
    </header>
  );
}

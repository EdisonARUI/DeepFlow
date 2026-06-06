"use client";

import Link from "next/link";
import { ConnectButton } from "./connect-button";

export function PageHeader({ section }: { section: string }) {
  return (
    <header className="mb-8 flex items-center justify-between border-b border-[var(--border-default)] pb-4">
      <div className="flex items-center gap-2 text-[11px] tracking-[1.1px]">
        <Link href="/" className="text-[var(--text-muted)] hover:underline">
          DEEPFLOW_TERMINAL
        </Link>
        <span className="text-[var(--border-default)]">/</span>
        <span className="text-[var(--accent-cyan)]">{section}</span>
      </div>
      <ConnectButton />
    </header>
  );
}

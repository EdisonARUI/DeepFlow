"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Droplets,
  PieChart,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/mock-data";

const ICONS = {
  PORTFOLIO: PieChart,
  LIQUIDITY: Droplets,
  TRADING: ArrowLeftRight,
  SECURITY: Shield,
} as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-border-default bg-bg-secondary">
      <div className="flex h-16 items-center gap-4 border-b border-border-default px-3">
        <div className="relative size-10 shrink-0">
          <img
            src="/figma/icons/logo.svg"
            alt="Deepflow"
            width={40}
            height={40}
            className="size-full object-contain"
          />
        </div>
        <span className="font-[family-name:var(--font-display)] text-2xl font-semibold text-accent-cyan">
          DEEPFLOW
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-auto py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.section];
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-[42px] items-center gap-4 px-5 py-3 text-[11px] font-bold tracking-[0.6px] uppercase transition-colors",
                active
                  ? "border-l-4 border-accent-cyan bg-accent-cyan/10 text-accent-cyan"
                  : "border-l-4 border-transparent text-text-muted hover:text-text-primary",
              )}
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

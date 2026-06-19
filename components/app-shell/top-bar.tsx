"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@/components/connect-button";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/mock-data";

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="mx-auto flex h-[60px] w-full max-w-[1280px] items-center justify-between rounded-[45px] bg-bg-dashboard-shell px-5">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-brand-badge">
          <img
            src="/figma/landing/brand-icon.svg"
            alt="Deepflow"
            width={20}
            height={14}
            className="h-[14px] w-5 object-contain"
          />
        </div>
        <nav className="flex items-center gap-5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex h-8 w-[120px] items-center justify-center rounded-[50px] text-base font-bold tracking-[0.6px] uppercase",
                  active
                    ? "bg-accent-cyan-pill text-black"
                    : "border border-black bg-white text-black",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <ConnectButton variant="dashboard" />
    </header>
  );
}

import Link from "next/link";
import { ConnectButton } from "@/components/connect-button";

const routes = [
  { href: "/portfolio", label: "PORTFOLIO" },
  { href: "/liquidity", label: "LIQUIDITY" },
  { href: "/trading", label: "TRADING" },
  { href: "/security", label: "SECURITY" },
] as const;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <p className="text-[11px] tracking-[1.1px] text-[var(--text-muted)]">
          DEEPFLOW_TERMINAL
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--accent-cyan)]">
          DEEPFLOW
        </h1>
        <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
          Sui DeFi 资金流转中间件 Dashboard。连接钱包以开始。
        </p>
      </div>

      <ConnectButton />

      <nav className="flex flex-wrap justify-center gap-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="border border-[var(--border-default)] px-4 py-2 text-[11px] tracking-[0.6px] text-[var(--text-primary)] transition-colors hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]"
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}

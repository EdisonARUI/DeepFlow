import { PageHeader } from "@/components/page-header";

export default function TradingPage() {
  return (
    <main className="min-h-screen p-6">
      <PageHeader section="TRADING" />
      <p className="text-sm text-[var(--text-muted)]">
        Trading 页面占位。下一轮将还原交易对、Swap 面板与 PTB 执行管线。
      </p>
    </main>
  );
}

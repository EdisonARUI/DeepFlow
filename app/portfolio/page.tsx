import { PageHeader } from "@/components/page-header";

export default function PortfolioPage() {
  return (
    <main className="min-h-screen p-6">
      <PageHeader section="PORTFOLIO" />
      <p className="text-sm text-[var(--text-muted)]">
        Portfolio 页面占位。下一轮将按 Figma 设计还原净值曲线、资产分布与操作历史。
      </p>
    </main>
  );
}

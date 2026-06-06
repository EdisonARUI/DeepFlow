import { PageHeader } from "@/components/page-header";

export default function SecurityPage() {
  return (
    <main className="min-h-screen p-6">
      <PageHeader section="SECURITY" />
      <p className="text-sm text-[var(--text-muted)]">
        Security 页面占位。下一轮将还原终点白名单、熔断器、配额与 Session Keys。
      </p>
    </main>
  );
}

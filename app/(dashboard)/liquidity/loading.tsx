"use client";

function SkeletonCard({ className }: { className?: string }) {
  return <div className={`rounded-[28px] bg-white/5 ${className ?? ""}`.trim()} aria-hidden />;
}

export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-5 rounded-[45px] bg-bg-dashboard-shell p-5">
      <SkeletonCard className="h-10 w-full" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <SkeletonCard className="h-[420px] xl:col-span-4" />
        <SkeletonCard className="h-[420px] xl:col-span-1" />
      </div>
    </div>
  );
}

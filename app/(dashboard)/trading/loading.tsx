"use client";

function SkeletonCard({ className }: { className?: string }) {
  return <div className={`rounded-[28px] bg-white/5 ${className ?? ""}`.trim()} aria-hidden />;
}

export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-5 rounded-[45px] bg-bg-dashboard-shell p-5">
      <SkeletonCard className="h-10 w-full" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[5fr_6fr_5fr]">
        <SkeletonCard className="h-[520px]" />
        <SkeletonCard className="h-[520px]" />
        <SkeletonCard className="h-[520px]" />
      </div>
    </div>
  );
}

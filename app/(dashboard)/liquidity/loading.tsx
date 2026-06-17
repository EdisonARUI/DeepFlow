"use client";

function SkeletonCard({ className }: { className?: string }) {
  return <div className={`rounded-[28px] bg-white/5 ${className ?? ""}`.trim()} aria-hidden />;
}

export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-5 rounded-[45px] bg-bg-dashboard-shell p-5">
      <SkeletonCard className="h-10 w-full" />
      <div className="flex flex-col gap-5 xl:flex-row">
        <SkeletonCard className="h-[420px] min-w-0 flex-1" />
        <SkeletonCard className="h-[420px] w-full shrink-0 xl:w-[420px]" />
      </div>
    </div>
  );
}

"use client";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`rounded-[28px] bg-white/5 ${className ?? ""}`.trim()} aria-hidden />;
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-black p-10">
      <header className="mx-auto flex h-[60px] w-full max-w-[1280px] animate-pulse items-center justify-between rounded-[45px] bg-bg-dashboard-shell px-5">
        <div className="h-8 w-[430px] rounded-[50px] bg-white/10" aria-hidden />
        <div className="h-8 w-40 rounded-[50px] bg-white/10" aria-hidden />
      </header>
      <main className="mx-auto mt-10 max-w-[1280px]">
        <div className="flex animate-pulse flex-col gap-5 rounded-[45px] bg-bg-dashboard-shell p-5">
          <SkeletonBlock className="h-10 w-full" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
            <SkeletonBlock className="h-28" />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SkeletonBlock className="h-72" />
            <SkeletonBlock className="h-72" />
          </div>
          <SkeletonBlock className="h-80" />
        </div>
      </main>
    </div>
  );
}

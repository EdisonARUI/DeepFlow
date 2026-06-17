"use client";

import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useEffect, useMemo, useState } from "react";
import { useLiquidityPositions } from "@/lib/data/liquidity/use-liquidity-positions";
import { toLiquidityPositionDisplay } from "@/lib/data/liquidity/liquidity-formatters";
import { DeFiConnectivity } from "./defi-connectivity";
import { PositionManagement } from "./position-management";

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`rounded-[28px] bg-white/5 ${className ?? ""}`.trim()} aria-hidden />
  );
}

function LiquidityWorkspaceSkeleton() {
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

function LiquidityShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 rounded-[45px] bg-bg-dashboard-shell p-5">{children}</div>
  );
}

export function LiquidityWorkspace() {
  const account = useCurrentAccount();
  const { positions, walletBalanceWarning, configurationWarning, isLoading, error, refetch } =
    useLiquidityPositions();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const displayPositions = useMemo(
    () => positions.map(toLiquidityPositionDisplay),
    [positions],
  );

  useEffect(() => {
    if (displayPositions.length === 0) {
      setSelectedId(null);
      return;
    }

    setSelectedId((current) => {
      if (current && displayPositions.some((position) => position.id === current)) {
        return current;
      }
      return displayPositions[0].id;
    });
  }, [displayPositions]);

  const selectedPosition =
    displayPositions.find((position) => position.id === selectedId) ?? displayPositions[0];

  if (isLoading) {
    return <LiquidityWorkspaceSkeleton />;
  }

  if (error) {
    return (
      <LiquidityShell>
        <p className="text-sm text-text-muted">Failed to load liquidity positions: {error.message}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-sm text-accent-cyan underline"
        >
          Retry
        </button>
      </LiquidityShell>
    );
  }

  if (!selectedPosition) {
    return (
      <LiquidityShell>
        <p className="text-sm text-text-muted">No liquidity pools found for the configured NAVI assets.</p>
        {configurationWarning && <p className="text-sm text-text-muted">{configurationWarning}</p>}
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-sm text-accent-cyan underline"
        >
          Retry
        </button>
      </LiquidityShell>
    );
  }

  return (
    <LiquidityShell>
      {walletBalanceWarning && (
        <p className="text-sm text-text-muted">{walletBalanceWarning}</p>
      )}
      <div className="flex flex-col gap-5 xl:flex-row">
        <div className="min-w-0 flex-1">
          <DeFiConnectivity
            positions={displayPositions}
            selectedId={selectedId!}
            onSelect={setSelectedId}
          />
        </div>
        <div className="w-full shrink-0 xl:w-[420px]">
          <PositionManagement
            positions={displayPositions}
            selectedPosition={selectedPosition}
            onAssetChange={setSelectedId}
            onPositionsRefetch={(options) => void refetch(options)}
          />
        </div>
      </div>
    </LiquidityShell>
  );
}

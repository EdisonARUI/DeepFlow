"use client";

import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useEffect, useMemo, useState } from "react";
import { useLiquidityPositions } from "@/lib/data/liquidity/use-liquidity-positions";
import { toLiquidityPositionDisplay } from "@/lib/data/liquidity/liquidity-formatters";
import { DeFiConnectivity } from "./defi-connectivity";
import { PositionManagement } from "./position-management";

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
    return (
      <div className="space-y-4 text-sm text-text-muted">
        <p>Loading liquidity positions…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 text-sm text-text-muted">
        <p>Failed to load liquidity positions: {error.message}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-accent-cyan underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!selectedPosition) {
    return (
      <div className="space-y-4 text-sm text-text-muted">
        <p>No liquidity pools found for the configured NAVI assets.</p>
        {configurationWarning && <p>{configurationWarning}</p>}
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-accent-cyan underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {!account && (
        <p className="text-sm text-text-muted">
          连接钱包以查看个人 supply 余额；当前展示的是 NAVI 市场池数据。
        </p>
      )}
      {walletBalanceWarning && (
        <p className="text-sm text-text-muted">{walletBalanceWarning}</p>
      )}
      <DeFiConnectivity
        positions={displayPositions}
        selectedId={selectedId!}
        onSelect={setSelectedId}
      />
      <PositionManagement
        positions={displayPositions}
        selectedPosition={selectedPosition}
        onAssetChange={setSelectedId}
        onPositionsRefetch={(options) => void refetch(options)}
      />
    </>
  );
}

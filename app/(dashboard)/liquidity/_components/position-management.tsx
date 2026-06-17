"use client";

import { useEffect, useState } from "react";
import { DashboardPanel } from "@/components/dashboard-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LiquidityPositionDisplay } from "@/lib/data/liquidity/liquidity-formatters";
import { useSupplyWithdrawSimulation } from "@/lib/data/liquidity/use-supply-withdraw-simulation";
import { getTransactionExplorerUrl } from "@/lib/sui/explorer";
import { SupplyPositionForm } from "./supply-position-form";
import { WithdrawPositionForm } from "./withdraw-position-form";

type PositionManagementProps = {
  positions: LiquidityPositionDisplay[];
  selectedPosition: LiquidityPositionDisplay;
  onAssetChange: (id: string) => void;
  onPositionsRefetch?: (options?: { bustCache?: boolean }) => void;
};

const TAB_TRIGGER_CLASS =
  "flex h-8 w-20 items-center justify-center rounded-[20px] border-0 bg-transparent p-0 text-[12px] tracking-[0.6px] text-text-primary uppercase shadow-none data-active:!bg-accent-cyan-pill data-active:!text-black";

function truncateDigest(digest: string): string {
  if (digest.length <= 12) return digest;
  return `${digest.slice(0, 6)}...${digest.slice(-4)}`;
}

export function PositionManagement({
  positions,
  selectedPosition,
  onAssetChange,
  onPositionsRefetch,
}: PositionManagementProps) {
  const [supplyAmount, setSupplyAmount] = useState("");
  const [supplySlider, setSupplySlider] = useState([0]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawSlider, setWithdrawSlider] = useState([0]);

  const supplySimulation = useSupplyWithdrawSimulation("supply", {
    onExecuted: () => onPositionsRefetch?.({ bustCache: true }),
  });
  const withdrawSimulation = useSupplyWithdrawSimulation("withdraw");

  useEffect(() => {
    supplySimulation.reset();
    setSupplyAmount("");
    setSupplySlider([0]);
  }, [selectedPosition.id, supplySimulation.reset]);

  useEffect(() => {
    withdrawSimulation.reset();
    setWithdrawAmount("");
    setWithdrawSlider([0]);
  }, [selectedPosition.id, withdrawSimulation.reset]);

  const supplyLoadingLabel =
    supplySimulation.status === "executing" ? "Signing..." : "Simulating...";

  const supplyStatusMessage = (() => {
    if (supplySimulation.status === "executed" && supplySimulation.txDigest) {
      const digest = supplySimulation.txDigest;
      return (
        <>
          Tx submitted:{" "}
          <a
            href={getTransactionExplorerUrl(digest)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan underline"
          >
            {truncateDigest(digest)}
          </a>
        </>
      );
    }
    if (supplySimulation.status === "success") {
      return "Simulation passed";
    }
    return supplySimulation.error;
  })();

  const withdrawStatusMessage =
    withdrawSimulation.status === "success"
      ? "Simulation passed"
      : withdrawSimulation.error;

  return (
    <Tabs defaultValue="supply">
      <DashboardPanel
        title="POSITION_MANAGEMENT"
        actions={
          <TabsList className="flex h-8 items-center rounded-[20px] border border-accent-cyan-pill bg-transparent p-0">
            <TabsTrigger value="supply" className={TAB_TRIGGER_CLASS}>
              Supply
            </TabsTrigger>
            <TabsTrigger value="withdraw" className={TAB_TRIGGER_CLASS}>
              Withdraw
            </TabsTrigger>
          </TabsList>
        }
        contentClassName="min-h-0"
      >
        <TabsContent value="supply" className="mt-0">
          <SupplyPositionForm
            positions={positions}
            selectedPosition={selectedPosition}
            onAssetChange={onAssetChange}
            amount={supplyAmount}
            onAmountChange={setSupplyAmount}
            slider={supplySlider}
            onSliderChange={setSupplySlider}
            onSimulate={() =>
              void supplySimulation.simulate({
                position: selectedPosition,
                amount: supplyAmount,
              })
            }
            isSimulating={supplySimulation.isSimulating}
            loadingLabel={supplyLoadingLabel}
            disabled={!supplySimulation.isWalletConnected}
            simulationStatus={supplySimulation.status}
            statusMessage={supplyStatusMessage}
          />
        </TabsContent>
        <TabsContent value="withdraw" className="mt-0">
          <WithdrawPositionForm
            positions={positions}
            selectedPosition={selectedPosition}
            onAssetChange={onAssetChange}
            amount={withdrawAmount}
            onAmountChange={setWithdrawAmount}
            slider={withdrawSlider}
            onSliderChange={setWithdrawSlider}
            onSimulate={() =>
              void withdrawSimulation.simulate({
                position: selectedPosition,
                amount: withdrawAmount,
              })
            }
            isSimulating={withdrawSimulation.isSimulating}
            disabled={!withdrawSimulation.isWalletConnected}
            simulationStatus={withdrawSimulation.status}
            statusMessage={withdrawStatusMessage}
          />
        </TabsContent>
      </DashboardPanel>
    </Tabs>
  );
}

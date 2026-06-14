"use client";

import { useEffect, useState } from "react";
import { Box } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
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

const tabTriggerClassName =
  "rounded-none border border-border-default px-4 py-1 text-[11px] uppercase data-[state=active]:border-accent-cyan data-[state=active]:bg-accent-cyan data-[state=active]:text-[var(--text-on-accent)]";

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
      <TerminalPanel
        contentClassName="p-0"
        title={
          <div className="flex items-center gap-2">
            <Box className="size-3.5 text-text-primary" />
            <TerminalLabel className="text-text-primary">POSITION_MANAGEMENT</TerminalLabel>
          </div>
        }
        actions={
          <TabsList className="h-auto rounded-none bg-transparent p-0">
            <TabsTrigger value="supply" className={tabTriggerClassName}>
              Supply
            </TabsTrigger>
            <TabsTrigger value="withdraw" className={tabTriggerClassName}>
              Withdraw
            </TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="supply" className="mt-0 p-6">
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
        <TabsContent value="withdraw" className="mt-0 p-6">
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
      </TerminalPanel>
    </Tabs>
  );
}

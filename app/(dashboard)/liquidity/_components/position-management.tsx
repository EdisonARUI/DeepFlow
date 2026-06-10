"use client";

import { useState } from "react";
import { Box } from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LiquidityPositionDisplay } from "@/lib/data/liquidity/liquidity-formatters";
import { SupplyPositionForm } from "./supply-position-form";
import { WithdrawPositionForm } from "./withdraw-position-form";

type PositionManagementProps = {
  positions: LiquidityPositionDisplay[];
  selectedPosition: LiquidityPositionDisplay;
  onAssetChange: (id: string) => void;
};

const tabTriggerClassName =
  "rounded-none border border-border-default px-4 py-1 text-[11px] uppercase data-[state=active]:border-accent-cyan data-[state=active]:bg-accent-cyan data-[state=active]:text-[var(--text-on-accent)]";

export function PositionManagement({
  positions,
  selectedPosition,
  onAssetChange,
}: PositionManagementProps) {
  const [supplyAmount, setSupplyAmount] = useState("0.00");
  const [supplySlider, setSupplySlider] = useState([0]);
  const [withdrawAmount, setWithdrawAmount] = useState("0.00");
  const [withdrawSlider, setWithdrawSlider] = useState([0]);

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
          />
        </TabsContent>
      </TerminalPanel>
    </Tabs>
  );
}

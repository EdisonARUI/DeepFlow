"use client";

import { useMemo } from "react";
import type { LiquidityPositionDisplay } from "@/lib/data/liquidity/liquidity-formatters";
import { PositionAmountInput } from "./position-amount-input";
import { PositionPercentageSlider } from "./position-percentage-slider";
import { PositionProtocolBanner } from "./position-protocol-banner";
import { TransactionOverviewPanel } from "./transaction-overview-panel";

type WithdrawPositionFormProps = {
  positions: LiquidityPositionDisplay[];
  selectedPosition: LiquidityPositionDisplay;
  onAssetChange: (id: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  slider: number[];
  onSliderChange: (value: number[]) => void;
};

export function WithdrawPositionForm({
  positions,
  selectedPosition,
  onAssetChange,
  amount,
  onAmountChange,
  slider,
  onSliderChange,
}: WithdrawPositionFormProps) {
  const protocolAssets = useMemo(
    () => positions.filter((position) => position.protocol === selectedPosition.protocol),
    [positions, selectedPosition.protocol],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3">
        <PositionProtocolBanner
          mode="withdraw"
          protocol={selectedPosition.protocol}
          protocolColor={selectedPosition.protocolColor}
        />
        <PositionAmountInput
          balanceLabel="Pool Balance"
          balance={selectedPosition.balance}
          amount={amount}
          onAmountChange={onAmountChange}
          selectedAsset={selectedPosition.asset}
          assets={protocolAssets.map((position) => position.asset)}
          onAssetChange={(asset) => {
            const position = protocolAssets.find((item) => item.asset === asset);
            if (position) onAssetChange(position.id);
          }}
        />
        <PositionPercentageSlider value={slider} onValueChange={onSliderChange} />
      </div>
      <TransactionOverviewPanel
        rows={[
          { label: "Max Withdraw", value: "75%" },
          {
            label: "Pool Size",
            value: selectedPosition.balance,
            valueClassName: "text-accent-green",
          },
          { label: "Gas Fee", value: "-" },
        ]}
        actionLabel="Withdraw"
      />
    </div>
  );
}

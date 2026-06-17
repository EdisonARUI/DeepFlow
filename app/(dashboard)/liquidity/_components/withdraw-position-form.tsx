"use client";

import { useMemo } from "react";
import {
  formatAmountFromPercentage,
  percentageFromAmount,
  type LiquidityPositionDisplay,
} from "@/lib/data/liquidity/liquidity-formatters";
import type { SimulationStatus } from "@/lib/data/liquidity/use-supply-withdraw-simulation";
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
  onSimulate: () => void;
  isSimulating: boolean;
  disabled: boolean;
  simulationStatus: SimulationStatus;
  statusMessage?: string;
};

export function WithdrawPositionForm({
  positions,
  selectedPosition,
  onAssetChange,
  amount,
  onAmountChange,
  slider,
  onSliderChange,
  onSimulate,
  isSimulating,
  disabled,
  simulationStatus,
  statusMessage,
}: WithdrawPositionFormProps) {
  const protocolAssets = useMemo(
    () => positions.filter((position) => position.protocol === selectedPosition.protocol),
    [positions, selectedPosition.protocol],
  );

  const statusVariant =
    simulationStatus === "success" ? "success" : simulationStatus === "error" ? "error" : undefined;

  const maxBalance = selectedPosition.suppliedBalance;

  const handleSliderChange = (value: number[]) => {
    onSliderChange(value);
    const pct = value[0] ?? 0;
    onAmountChange(formatAmountFromPercentage(maxBalance, selectedPosition.decimals, pct));
  };

  const handleAmountChange = (value: string) => {
    onAmountChange(value);
    onSliderChange([
      percentageFromAmount(value, maxBalance, selectedPosition.decimals),
    ]);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <PositionProtocolBanner
          mode="withdraw"
          protocol={selectedPosition.protocol}
          protocolColor={selectedPosition.protocolColor}
        />
        <PositionAmountInput
          balanceLabel="Pool Balance"
          balance={selectedPosition.suppliedBalanceDisplay}
          amount={amount}
          onAmountChange={handleAmountChange}
          selectedAsset={selectedPosition.asset}
          assets={protocolAssets.map((position) => position.asset)}
          onAssetChange={(asset) => {
            const position = protocolAssets.find((item) => item.asset === asset);
            if (position) onAssetChange(position.id);
          }}
        />
        <PositionPercentageSlider value={slider} onValueChange={handleSliderChange} />
      </div>
      <TransactionOverviewPanel
        rows={[
          { label: "Max Withdraw", value: "75%" },
          {
            label: "Pool Size",
            value: selectedPosition.suppliedBalanceDisplay,
            valueClassName: "text-accent-green",
          },
        ]}
        actionLabel="Withdraw"
        onAction={onSimulate}
        isLoading={isSimulating}
        disabled={disabled}
        statusMessage={statusMessage}
        statusVariant={statusVariant}
      />
    </div>
  );
}

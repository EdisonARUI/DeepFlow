"use client";

import { useMemo } from "react";
import {
  formatAmountFromPercentage,
  getUniqueProtocolOptions,
  percentageFromAmount,
  resolvePositionIdForSelection,
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
  loadingLabel: string;
  disabled: boolean;
  simulationStatus: SimulationStatus;
  statusMessage?: React.ReactNode;
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
  loadingLabel,
  disabled,
  simulationStatus,
  statusMessage,
}: WithdrawPositionFormProps) {
  const protocolAssets = useMemo(
    () => positions.filter((position) => position.protocol === selectedPosition.protocol),
    [positions, selectedPosition.protocol],
  );

  const protocolOptions = useMemo(
    () => getUniqueProtocolOptions(positions),
    [positions],
  );

  const handleProtocolChange = (protocol: string) => {
    const nextId = resolvePositionIdForSelection(
      positions,
      protocol,
      selectedPosition.asset,
    );
    if (nextId) onAssetChange(nextId);
  };

  const statusVariant =
    simulationStatus === "success" || simulationStatus === "executed"
      ? "success"
      : simulationStatus === "error"
        ? "error"
        : undefined;

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
    <div className="flex flex-col justify-between gap-5">
      <div className="flex flex-col gap-5">
        <PositionProtocolBanner
          mode="withdraw"
          protocol={selectedPosition.protocol}
          protocolColor={selectedPosition.protocolColor}
          protocols={protocolOptions}
          onProtocolChange={handleProtocolChange}
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
          footer={
            <PositionPercentageSlider value={slider} onValueChange={handleSliderChange} />
          }
        />
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
        loadingLabel={loadingLabel}
        disabled={disabled}
        statusMessage={statusMessage}
        statusVariant={statusVariant}
        actionPlacement="outside"
      />
    </div>
  );
}

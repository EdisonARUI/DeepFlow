import { DeFiConnectivity, PositionManagement } from "@/components/liquidity/liquidity-sections";

export default function LiquidityPage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 p-6">
      <DeFiConnectivity />
      <PositionManagement />
    </div>
  );
}

import { AssetDistribution } from "./_components/asset-distribution";
import { NetWorthChart } from "./_components/net-worth-chart";
import { ProtocolActionsHistory } from "./_components/protocol-actions-history";

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-6 p-6">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <NetWorthChart />
        <AssetDistribution />
      </div>
      <ProtocolActionsHistory />
    </div>
  );
}

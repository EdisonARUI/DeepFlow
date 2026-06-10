import { AssetComposition } from "./_components/asset-composition";
import { PortfolioSummaryStats } from "./_components/portfolio-summary-stats";
import { ProtocolExposure } from "./_components/protocol-exposure";
import { TransactionHistory } from "./_components/transaction-history";

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-6 p-6">
      <PortfolioSummaryStats />
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <AssetComposition />
        <ProtocolExposure />
      </div>
      <TransactionHistory />
    </div>
  );
}

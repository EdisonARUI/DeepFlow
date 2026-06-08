import {
  DeepbookOrders,
  PtbPipeline,
  TradingWorkspace,
} from "@/components/trading/trading-sections";

export default function TradingPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-4 p-4">
      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[260px_1fr_260px]">
        <TradingWorkspace />
        <DeepbookOrders />
      </div>
      <PtbPipeline />
    </div>
  );
}

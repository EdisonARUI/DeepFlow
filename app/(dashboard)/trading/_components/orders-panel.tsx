"use client";

import { DashboardPanel } from "@/components/dashboard-panel";
import type { OpenLimitOrderView, OrderHistoryView } from "@/lib/data/trading/types";
import type { CancelOrderStatus } from "@/lib/data/trading/use-cancel-deepbook-order";
import { LimitOpenOrders } from "./limit-open-orders";
import { OrderHistory } from "./order-history";

type OrdersPanelProps = {
  historyOrders: OrderHistoryView[];
  openOrders: OpenLimitOrderView[];
  isLoadingHistory?: boolean;
  isLoadingOpen?: boolean;
  historyEmptyMessage?: string;
  openEmptyMessage?: string;
  managerId?: string;
  onCancelOrder?: (orderId: string, poolKey: string) => void;
  onCancelAll?: () => void;
  cancelStatus?: CancelOrderStatus;
};

export function OrdersPanel({
  historyOrders,
  openOrders,
  isLoadingHistory,
  isLoadingOpen,
  historyEmptyMessage,
  openEmptyMessage,
  managerId,
  onCancelOrder,
  onCancelAll,
  cancelStatus,
}: OrdersPanelProps) {
  return (
    <DashboardPanel
      title="ORDERS"
      className="h-full min-h-[500px] xl:min-h-[795px]"
      contentClassName="flex min-h-0 flex-1 flex-col gap-0"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <OrderHistory
          orders={historyOrders}
          isLoading={isLoadingHistory}
          emptyMessage={historyEmptyMessage}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <LimitOpenOrders
          orders={openOrders}
          isLoading={isLoadingOpen}
          emptyMessage={openEmptyMessage}
          managerId={managerId}
          onCancelOrder={onCancelOrder}
          onCancelAll={onCancelAll}
          cancelStatus={cancelStatus}
        />
      </div>
    </DashboardPanel>
  );
}

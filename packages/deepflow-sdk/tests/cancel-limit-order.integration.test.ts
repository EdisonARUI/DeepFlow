import { beforeAll, describe, it } from "vitest";

import {
  inspectCancelAllDeepbookOrders,
  inspectCancelDeepbookOrder,
  simulateCancelAllDeepbookOrders,
  simulateCancelDeepbookOrder,
} from "../src/trade/simulate-cancel-deepbook-order.ts";
import {
  assertSimulationOk,
  integrationReady,
  poolKey,
  resolveManagerAndOpenOrder,
  sender,
} from "./helpers/limit-order-integration.ts";

describe.skipIf(!integrationReady)("Cancel limit order mainnet integration", () => {
  let managerId: string | null = null;
  let openOrderId: string | undefined;

  beforeAll(async () => {
    try {
      const resolved = await resolveManagerAndOpenOrder(poolKey);
      managerId = resolved.managerId;
      openOrderId = resolved.openOrderId;
    } catch {
      managerId = null;
      openOrderId = undefined;
    }
  });

  it("dry-runs cancel single open order", async (ctx) => {
    if (!managerId || !openOrderId) {
      ctx.skip();
      return;
    }

    const result = await simulateCancelDeepbookOrder({
      sender: sender!,
      poolKey,
      managerId,
      orderId: openOrderId,
    });
    assertSimulationOk(result, "dryRun");
  });

  it("devInspects cancel single open order", async (ctx) => {
    if (!managerId || !openOrderId) {
      ctx.skip();
      return;
    }

    const result = await inspectCancelDeepbookOrder({
      sender: sender!,
      poolKey,
      managerId,
      orderId: openOrderId,
    });
    assertSimulationOk(result, "devInspect");
  });

  it("dry-runs cancel all orders", async (ctx) => {
    if (!managerId) {
      ctx.skip();
      return;
    }

    const result = await simulateCancelAllDeepbookOrders({
      sender: sender!,
      poolKey,
      managerId,
    });
    assertSimulationOk(result, "dryRun");
  });

  it("devInspects cancel all orders", async (ctx) => {
    if (!managerId) {
      ctx.skip();
      return;
    }

    const result = await inspectCancelAllDeepbookOrders({
      sender: sender!,
      poolKey,
      managerId,
    });
    assertSimulationOk(result, "devInspect");
  });
});

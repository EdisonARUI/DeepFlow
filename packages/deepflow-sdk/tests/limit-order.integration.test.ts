import { beforeAll, describe, it } from "vitest";

import {
  inspectLimitOrder,
  simulateLimitOrder,
} from "../src/trade/simulate-limit-order.ts";
import {
  assertSimulationOk,
  buildLimitOrderParams,
  buildWalletBuyLimitOrderParams,
  buildWalletSellLimitOrderParams,
  canSimulateNaviLimitSell,
  canSimulateSuilendLimitSell,
  hasSuilendObligation,
  integrationReady,
  referralId,
  withReferral,
} from "./helpers/limit-order-integration.ts";

describe.skipIf(!integrationReady)("Limit order wallet mainnet integration", () => {
  it("dry-runs wallet SELL limit order", async () => {
    const params = await buildWalletSellLimitOrderParams();
    const result = await simulateLimitOrder(params);
    assertSimulationOk(result, "dryRun");
  });

  it("devInspects wallet SELL limit order", async () => {
    const params = await buildWalletSellLimitOrderParams();
    const result = await inspectLimitOrder(params);
    assertSimulationOk(result, "devInspect");
  });

  it("dry-runs wallet BUY limit order", async () => {
    const params = await buildWalletBuyLimitOrderParams();
    const result = await simulateLimitOrder(params);
    assertSimulationOk(result, "dryRun");
  });

  it("devInspects wallet BUY limit order", async () => {
    const params = await buildWalletBuyLimitOrderParams();
    const result = await inspectLimitOrder(params);
    assertSimulationOk(result, "devInspect");
  });
});

describe.skipIf(!integrationReady)("Limit order NAVI mainnet integration", () => {
  let canRun = false;

  beforeAll(async () => {
    canRun = await canSimulateNaviLimitSell();
  });

  it("dry-runs NAVI SELL limit order", async (ctx) => {
    if (!canRun) {
      ctx.skip();
      return;
    }

    const params = await buildLimitOrderParams({ fundSource: "navi", side: "SELL" });
    const result = await simulateLimitOrder(params);
    assertSimulationOk(result, "dryRun");
  });

  it("devInspects NAVI SELL limit order", async (ctx) => {
    if (!canRun) {
      ctx.skip();
      return;
    }

    const params = await buildLimitOrderParams({ fundSource: "navi", side: "SELL" });
    const result = await inspectLimitOrder(params);
    assertSimulationOk(result, "devInspect");
  });
});

describe.skipIf(!integrationReady)("Limit order Suilend mainnet integration", () => {
  let canRun = false;

  beforeAll(async () => {
    canRun = await canSimulateSuilendLimitSell();
  });

  it("dry-runs Suilend SELL limit order", async (ctx) => {
    if (!canRun) {
      ctx.skip();
      return;
    }

    const params = await buildLimitOrderParams({ fundSource: "suilend", side: "SELL" });
    const result = await simulateLimitOrder(params);
    assertSimulationOk(result, "dryRun");
  });

  it("devInspects Suilend SELL limit order", async (ctx) => {
    if (!canRun) {
      ctx.skip();
      return;
    }

    const params = await buildLimitOrderParams({ fundSource: "suilend", side: "SELL" });
    const result = await inspectLimitOrder(params);
    assertSimulationOk(result, "devInspect");
  });
});

describe.skipIf(!integrationReady || !withReferral || !referralId)(
  "Limit order referral bootstrap (deferred)",
  () => {
    it("dry-runs wallet SELL limit order with referral", async () => {
      const params = await buildLimitOrderParams({ fundSource: "wallet", side: "SELL" });
      const result = await simulateLimitOrder(params);
      assertSimulationOk(result, "dryRun");
    });

    it("devInspects wallet SELL limit order with referral", async () => {
      const params = await buildLimitOrderParams({ fundSource: "wallet", side: "SELL" });
      const result = await inspectLimitOrder(params);
      assertSimulationOk(result, "devInspect");
    });
  },
);

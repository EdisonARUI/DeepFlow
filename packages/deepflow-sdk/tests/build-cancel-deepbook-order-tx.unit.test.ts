import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCancelLiveOrder = vi.fn(() => () => undefined);
const mockCancelAllOrders = vi.fn(() => () => undefined);

vi.mock("@mysten/deepbook-v3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mysten/deepbook-v3")>();
  return {
    ...actual,
    DeepBookContract: vi.fn().mockImplementation(function MockDeepBookContract() {
      return {
        cancelLiveOrder: mockCancelLiveOrder,
        cancelAllOrders: mockCancelAllOrders,
      };
    }),
  };
});

const { buildCancelDeepbookOrderTx, buildCancelAllDeepbookOrdersTx } = await import(
  "../src/trade/build-cancel-deepbook-order-tx.ts"
);

describe("buildCancelDeepbookOrderTx (unit)", () => {
  beforeEach(() => {
    mockCancelLiveOrder.mockClear();
    mockCancelAllOrders.mockClear();
  });

  it("calls cancelLiveOrder with pool, manager key, and order id", () => {
    buildCancelDeepbookOrderTx({
      sender: "0xabc",
      poolKey: "SUI_USDC",
      managerId: "0xmanager",
      orderId: "12345",
    });

    expect(mockCancelLiveOrder).toHaveBeenCalledWith("SUI_USDC", "deepflow", "12345");
  });

  it("calls cancelAllOrders for the manager", () => {
    buildCancelAllDeepbookOrdersTx({
      sender: "0xabc",
      poolKey: "SUI_USDC",
      managerId: "0xmanager",
    });

    expect(mockCancelAllOrders).toHaveBeenCalledWith("SUI_USDC", "deepflow");
  });
});

import { mainnetCoins, mainnetPackageIds, mainnetPools } from "@mysten/deepbook-v3";
import { describe, expect, it } from "vitest";

import {
  parseSwapFromTransaction,
  type RpcSwapTransactionBlock,
} from "./parse-deepbook-swap-txs";

const OWNER = "0xabc123";
const DIGEST = "0xswapdigest";
const TIMESTAMP = "1710000000000";
const DEEPBOOK_PACKAGE = mainnetPackageIds.DEEPBOOK_PACKAGE_ID;
const SUI_USDC_POOL = mainnetPools.SUI_USDC.address;
const SUI_TYPE = mainnetCoins.SUI.type;
const USDC_TYPE = mainnetCoins.USDC.type;

function baseTx(overrides: Partial<RpcSwapTransactionBlock> = {}): RpcSwapTransactionBlock {
  return {
    digest: DIGEST,
    timestampMs: TIMESTAMP,
    effects: { status: { status: "success" } },
    ...overrides,
  };
}

function swapMoveCall(functionName: string) {
  return {
    transaction: {
      data: {
        transaction: {
          transactions: [
            {
              MoveCall: {
                package: DEEPBOOK_PACKAGE,
                module: "pool",
                function: functionName,
              },
            },
          ],
        },
      },
    },
  };
}

describe("parseSwapFromTransaction", () => {
  it("parses wallet_wallet swap from dual-coin balanceChanges", () => {
    const tx = baseTx({
      ...swapMoveCall("swap_exact_quantity"),
      balanceChanges: [
        {
          owner: { AddressOwner: OWNER },
          coinType: SUI_TYPE,
          amount: "-1000000000",
        },
        {
          owner: { AddressOwner: OWNER },
          coinType: USDC_TYPE,
          amount: "3450000",
        },
      ],
    });

    const swap = parseSwapFromTransaction(tx, OWNER);
    expect(swap).toMatchObject({
      orderId: DIGEST,
      poolKey: "SUI_USDC",
      kind: "swap",
      side: "SELL",
      quantity: 1,
      filledQuantity: 1,
      status: "FILLED",
    });
  });

  it("parses cross-protocol wallet_navi swap from OrderFilled when only input coin changes", () => {
    const tx = baseTx({
      ...swapMoveCall("swap_exact_quantity"),
      balanceChanges: [
        {
          owner: { AddressOwner: OWNER },
          coinType: SUI_TYPE,
          amount: "-2000000000",
        },
      ],
      events: [
        {
          type: `@deepbook/core::order_info::OrderFilled`,
          parsedJson: {
            pool_id: SUI_USDC_POOL,
            taker_is_bid: false,
            base_quantity: "2000000000",
          },
        },
      ],
    });

    const swap = parseSwapFromTransaction(tx, OWNER);
    expect(swap).toMatchObject({
      poolKey: "SUI_USDC",
      side: "SELL",
      quantity: 2,
      status: "FILLED",
    });
  });

  it("falls back to single-coin balanceChanges with swap function side when events are absent", () => {
    const tx = baseTx({
      ...swapMoveCall("swap_exact_base_for_quote"),
      balanceChanges: [
        {
          owner: { AddressOwner: OWNER },
          coinType: mainnetCoins.DEEP.type,
          amount: "-5000000",
        },
      ],
    });

    const swap = parseSwapFromTransaction(tx, OWNER, "DEEP_USDC");
    expect(swap).toMatchObject({
      poolKey: "DEEP_USDC",
      side: "SELL",
      quantity: 5,
      status: "FILLED",
    });
  });

  it("returns null when swap move call is missing", () => {
    const tx = baseTx({
      balanceChanges: [
        {
          owner: { AddressOwner: OWNER },
          coinType: SUI_TYPE,
          amount: "-1000000000",
        },
      ],
    });

    expect(parseSwapFromTransaction(tx, OWNER)).toBeNull();
  });
});

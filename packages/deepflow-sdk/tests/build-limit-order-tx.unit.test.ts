import { Transaction } from "@mysten/sui/transactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResolveNaviPoolKey = vi.fn();
const mockGetPool = vi.fn();
const mockGetCoins = vi.fn();
const mockMergeCoinsPTB = vi.fn();
const mockResolveTickAlignedLimitPrice = vi.fn();
const mockPoolTradeParams = vi.fn();

vi.mock("../src/credit-source/navi/resolve-navi-pool-key.ts", () => ({
  resolveNaviPoolKey: (...args: unknown[]) => mockResolveNaviPoolKey(...args),
}));

vi.mock("../src/trade/resolve-limit-order-price.ts", () => ({
  resolveTickAlignedLimitPrice: (...args: unknown[]) =>
    mockResolveTickAlignedLimitPrice(...args),
}));

vi.mock("../src/sui/deepbook-client.ts", () => ({
  createDeepbookClient: () => ({
    deepbook: {
      poolTradeParams: (...args: unknown[]) => mockPoolTradeParams(...args),
    },
  }),
}));

vi.mock("@naviprotocol/lending", () => ({
  getPool: (...args: unknown[]) => mockGetPool(...args),
  getCoins: (...args: unknown[]) => mockGetCoins(...args),
  mergeCoinsPTB: (...args: unknown[]) => mockMergeCoinsPTB(...args),
}));

vi.mock("@mysten/deepbook-v3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mysten/deepbook-v3")>();
  return {
    ...actual,
    mainnetPools: {
      SUI_USDC: {
        address: "0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407",
        baseCoin: "SUI",
        quoteCoin: "USDC",
      },
      DEEP_SUI: {
        address: "0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22",
        baseCoin: "DEEP",
        quoteCoin: "SUI",
      },
    },
    mainnetCoins: {
      SUI: {
        type: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
        scalar: 1_000_000_000,
      },
      USDC: {
        type: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c5807c381e5adf98::usdc::USDC",
        scalar: 1_000_000,
      },
      DEEP: {
        type: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
        scalar: 1_000_000,
      },
    },
    mainnetPackageIds: {
      DEEPBOOK_PACKAGE_ID: "0x0e735f8c93a95722efd73521aca7a7652c0bb71ed1daf41b26dfd7d1ff71f748",
      REGISTRY_ID: "0xaf16199a2dff736e9f07a845f23c5da6df6f756eddb631aed9d24a93efc4549d",
    },
  };
});

const { buildWalletLimitOrderTx } = await import("../src/trade/build-limit-order-core.ts");
const {
  appendLimitOrderLeg,
  resolveLimitOrderDepositWithFee,
} = await import("../src/trade/resolve-deepbook-limit-order.ts");

const SUI_COIN_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";
const sender = "0x0000000000000000000000000000000000000000000000000000000000000001";
const client = {} as never;
const MAKER_FEE_RAW = 2_500_000n;

function mockDepositCoin(tx: Transaction) {
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(1000n)]);
  return coin;
}

function moveTarget(command: unknown): string | undefined {
  if (
    command &&
    typeof command === "object" &&
    "MoveCall" in command &&
    command.MoveCall &&
    typeof command.MoveCall === "object" &&
    "function" in command.MoveCall
  ) {
    const fn = command.MoveCall.function as string;
    const module = command.MoveCall.module as string;
    return `${module}::${fn}`;
  }
  return undefined;
}

function placeLimitOrderPayWithDeep(tx: Transaction): boolean | undefined {
  const data = tx.getData();
  const command = data.commands.find((entry) => moveTarget(entry) === "pool::place_limit_order");
  if (
    !command ||
    typeof command !== "object" ||
    !("MoveCall" in command) ||
    !command.MoveCall ||
    typeof command.MoveCall !== "object" ||
    !("arguments" in command.MoveCall)
  ) {
    return undefined;
  }

  const payWithDeepArg = (command.MoveCall.arguments as unknown[])[9] as
    | { Input?: number }
    | undefined;
  const inputIndex = payWithDeepArg?.Input;
  if (inputIndex === undefined) {
    return undefined;
  }

  const input = data.inputs[inputIndex];
  if (
    input &&
    typeof input === "object" &&
    "Pure" in input &&
    input.Pure &&
    typeof input.Pure === "object" &&
    "bytes" in input.Pure
  ) {
    return input.Pure.bytes === "AQ==";
  }

  return undefined;
}

describe("buildWalletLimitOrderTx / appendLimitOrderLeg (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveNaviPoolKey.mockResolvedValue(SUI_COIN_TYPE);
    mockGetPool.mockResolvedValue({ suiCoinType: SUI_COIN_TYPE });
    mockGetCoins.mockResolvedValue(["0xcoin"]);
    mockMergeCoinsPTB.mockImplementation((tx: Transaction) => mockDepositCoin(tx));
    mockResolveTickAlignedLimitPrice.mockImplementation(
      async (_poolKey: string, price: number) => price,
    );
    mockPoolTradeParams.mockResolvedValue({
      makerFee: Number(MAKER_FEE_RAW) / 1_000_000_000,
      takerFee: 0.0025,
      stakeRequired: 0,
    });
  });

  it("bootstraps BalanceManager when managerId is null with register before share", async () => {
    const tx = await buildWalletLimitOrderTx({
      sender,
      poolKey: "SUI_USDC",
      side: "SELL",
      price: 2.5,
      quantityBaseUnits: 1_000_000_000n,
      managerId: null,
      client,
      clientOrderId: "12345",
    });

    const targets = tx.getData().commands.map(moveTarget).filter(Boolean);

    expect(targets).toContain("balance_manager::new_with_custom_owner");
    expect(targets).not.toContain("balance_manager::mint_trade_cap");
    expect(targets.indexOf("balance_manager::register_balance_manager")).toBeLessThan(
      targets.indexOf("pool::place_limit_order"),
    );
    expect(targets.indexOf("balance_manager::deposit")).toBeLessThan(
      targets.indexOf("pool::place_limit_order"),
    );
    expect(targets.indexOf("pool::place_limit_order")).toBeLessThan(
      targets.indexOf("transfer::public_share_object"),
    );
    expect(targets).toContain("balance_manager::deposit");
    expect(targets).toContain("balance_manager::generate_proof_as_owner");
    expect(targets).toContain("pool::place_limit_order");
    expect(placeLimitOrderPayWithDeep(tx)).toBe(false);
  });

  it("merges wallet coin using fee-inclusive deposit amount for SELL", async () => {
    const quantityBaseUnits = 1_000_000_000n;
    const resolved = resolveLimitOrderDepositWithFee({
      poolKey: "SUI_USDC",
      side: "SELL",
      price: 2.5,
      quantityBaseUnits,
      makerFeeRaw: MAKER_FEE_RAW,
    });

    await buildWalletLimitOrderTx({
      sender,
      poolKey: "SUI_USDC",
      side: "SELL",
      price: 2.5,
      quantityBaseUnits,
      managerId: "0x1111111111111111111111111111111111111111111111111111111111111111",
      client,
    });

    expect(mockMergeCoinsPTB).toHaveBeenCalledWith(
      expect.any(Transaction),
      ["0xcoin"],
      expect.objectContaining({ balance: Number(resolved.depositAmount) }),
    );
    expect(resolved.depositAmount).toBeGreaterThan(quantityBaseUnits);
  });

  it("reuses existing managerId without bootstrap calls", () => {
    const tx = new Transaction();
    tx.setSender(sender);
    const existingManager =
      "0x1111111111111111111111111111111111111111111111111111111111111111";
    const depositCoin = mockDepositCoin(tx);

    appendLimitOrderLeg(tx, {
      sender,
      poolKey: "DEEP_SUI",
      inputPrice: 3_000_000n,
      inputQuantity: 10_000_000n,
      isBid: true,
      depositCoin,
      depositCoinType: SUI_COIN_TYPE,
      managerId: existingManager,
      clientOrderId: "999",
    });

    const targets = tx.getData().commands.map(moveTarget).filter(Boolean);

    expect(targets).not.toContain("balance_manager::new_with_custom_owner");
    expect(targets).toContain("balance_manager::deposit");
    expect(targets).toContain("pool::place_limit_order");
    expect(placeLimitOrderPayWithDeep(tx)).toBe(false);
  });
});

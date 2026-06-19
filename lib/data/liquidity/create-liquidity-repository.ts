import type { LiquidityRepository } from "./liquidity-repository";
import type { LiquidityProtocolAdapter } from "./protocols/types";

export type LiquidityDataSource = "mock" | "live";

function resolveDataSource(): LiquidityDataSource {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE;
  return source === "live" ? "live" : "mock";
}

export async function createLiquidityRepository(): Promise<LiquidityRepository> {
  const source = resolveDataSource();

  if (source === "live") {
    const protocolCsv = process.env.NEXT_PUBLIC_LIQUIDITY_PROTOCOLS ?? "navi";
    const enabledProtocolIds = protocolCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as LiquidityProtocolAdapter["protocolId"][];

    const adapterModules = await Promise.all(
      enabledProtocolIds.map(async (id) => {
        switch (id) {
          case "navi": {
            const { NaviLiquidityAdapter } = await import("./protocols/navi/navi-liquidity-adapter");
            return new NaviLiquidityAdapter();
          }
          case "suilend": {
            const { SuilendLiquidityAdapter } = await import(
              "./protocols/suilend/suilend-liquidity-adapter"
            );
            return new SuilendLiquidityAdapter();
          }
          default:
            return null;
        }
      }),
    );

    const adapters = adapterModules.filter((adapter) => adapter !== null);

    if (adapters.length === 0) {
      throw new Error(
        "No supported liquidity protocol adapters enabled. Set NEXT_PUBLIC_LIQUIDITY_PROTOCOLS including `navi` or `suilend`.",
      );
    }

    const { LiquidityAggregatorRepository } = await import(
      "./protocols/liquidity-aggregator-repository"
    );
    return new LiquidityAggregatorRepository(adapters);
  }

  const { MockLiquidityRepository } = await import("./mock-liquidity-repository");
  return new MockLiquidityRepository();
}

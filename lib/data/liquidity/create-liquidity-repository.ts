import type { LiquidityRepository } from "./liquidity-repository";
import { MockLiquidityRepository } from "./mock-liquidity-repository";
import { LiquidityAggregatorRepository } from "./protocols/liquidity-aggregator-repository";
import type { LiquidityProtocolAdapter } from "./protocols/types";
import { NaviLiquidityAdapter } from "./protocols/navi/navi-liquidity-adapter";
import { SuilendLiquidityAdapter } from "./protocols/suilend/suilend-liquidity-adapter";

export type LiquidityDataSource = "mock" | "live";

function resolveDataSource(): LiquidityDataSource {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE;
  return source === "live" ? "live" : "mock";
}

export function createLiquidityRepository(): LiquidityRepository {
  const source = resolveDataSource();

  if (source === "live") {
    const protocolCsv = process.env.NEXT_PUBLIC_LIQUIDITY_PROTOCOLS ?? "navi";
    const enabledProtocolIds = protocolCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as LiquidityProtocolAdapter["protocolId"][];

    const adapters = enabledProtocolIds.flatMap((id): LiquidityProtocolAdapter[] => {
      switch (id) {
        case "navi":
          return [new NaviLiquidityAdapter()];
        case "suilend":
          return [new SuilendLiquidityAdapter()];
        // Future protocols:
        // case "scallop": return [new ScallopLiquidityAdapter()]
        // case "cetus": return [new CetusLiquidityAdapter()]
        default:
          return [];
      }
    });

    if (adapters.length === 0) {
      throw new Error(
        "No supported liquidity protocol adapters enabled. Set NEXT_PUBLIC_LIQUIDITY_PROTOCOLS including `navi` or `suilend`.",
      );
    }

    return new LiquidityAggregatorRepository(adapters);
  }

  return new MockLiquidityRepository();
}

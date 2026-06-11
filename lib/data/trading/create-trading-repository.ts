import { LiveTradingRepository } from "./live-trading-repository";
import { MockTradingRepository } from "./mock-trading-repository";
import type { TradingRepository } from "./trading-repository";

export type TradingDataSource = "mock" | "live";

function resolveDataSource(): TradingDataSource {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE;
  return source === "live" ? "live" : "mock";
}

export function createTradingRepository(): TradingRepository {
  const source = resolveDataSource();
  return source === "live" ? new LiveTradingRepository() : new MockTradingRepository();
}

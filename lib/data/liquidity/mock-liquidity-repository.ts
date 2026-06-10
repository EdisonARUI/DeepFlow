import { MOCK_LIQUIDITY_RAW } from "@/lib/fixtures/liquidity";
import { mapToLiquidityViews } from "./map-to-liquidity-view";
import type { LiquidityRepository, ListPositionsParams } from "./liquidity-repository";

export class MockLiquidityRepository implements LiquidityRepository {
  async listPositions(_params: ListPositionsParams) {
    return { positions: mapToLiquidityViews(MOCK_LIQUIDITY_RAW) };
  }
}

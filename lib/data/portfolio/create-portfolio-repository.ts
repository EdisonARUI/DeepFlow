import type { PortfolioRepository } from "./portfolio-repository";
import { LivePortfolioRepository } from "./live-portfolio-repository";
import { MockPortfolioRepository } from "./mock-portfolio-repository";

export type PortfolioDataSource = "mock" | "live";

function resolveDataSource(): PortfolioDataSource {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE;
  return source === "live" ? "live" : "mock";
}

export function createPortfolioRepository(): PortfolioRepository {
  const source = resolveDataSource();
  return source === "live" ? new LivePortfolioRepository() : new MockPortfolioRepository();
}

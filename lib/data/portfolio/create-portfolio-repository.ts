import type { PortfolioRepository } from "./portfolio-repository";

export type PortfolioDataSource = "mock" | "live";

function resolveDataSource(): PortfolioDataSource {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE;
  return source === "live" ? "live" : "mock";
}

export async function createPortfolioRepository(): Promise<PortfolioRepository> {
  const source = resolveDataSource();

  if (source === "live") {
    const { LivePortfolioRepository } = await import("./live-portfolio-repository");
    return new LivePortfolioRepository();
  }

  const { MockPortfolioRepository } = await import("./mock-portfolio-repository");
  return new MockPortfolioRepository();
}

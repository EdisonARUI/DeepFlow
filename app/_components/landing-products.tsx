import { LandingProductLiquidity } from "./landing-product-liquidity";
import { LandingPortfolioPrefetch } from "./landing-portfolio-prefetch";
import { LandingProductPortfolio } from "./landing-product-portfolio";
import { LandingProductTrading } from "./landing-product-trading";

export function LandingProducts() {
  return (
    <div className="flex flex-col gap-[10px]">
      <LandingPortfolioPrefetch />
      <LandingProductPortfolio />
      <LandingProductLiquidity />
      <LandingProductTrading />
    </div>
  );
}

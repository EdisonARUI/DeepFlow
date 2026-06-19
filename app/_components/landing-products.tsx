import { LandingProductLiquidity } from "./landing-product-liquidity";
import { LandingProductPortfolio } from "./landing-product-portfolio";
import { LandingProductTrading } from "./landing-product-trading";

export function LandingProducts() {
  return (
    <div className="flex flex-col gap-[10px]">
      <LandingProductPortfolio />
      <LandingProductLiquidity />
      <LandingProductTrading />
    </div>
  );
}

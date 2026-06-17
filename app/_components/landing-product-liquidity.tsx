import { LandingProductSection } from "./landing-product-section";

export function LandingProductLiquidity() {
  return (
    <LandingProductSection
      id="landing-liquidity"
      headline={["UNIFY", "LIQUIDITY"]}
      description="Submit a single execution request and let DeepFlow automatically withdraw from your authorized DeFi yield positions, route capital where it is needed, and redeposit when execution completes — keeping assets productive between trades."
      previewSrc="/figma/landing/liquidity.png"
      previewAlt="DeepFlow Liquidity Management"
      href="/liquidity"
      reversed
    />
  );
}

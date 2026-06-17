import { LandingProductSection } from "./landing-product-section";

export function LandingProductPortfolio() {
  return (
    <LandingProductSection
      id="landing-portfolio"
      headline={["TRACK", "YOUR PORTFOLIO"]}
      description="Command your complete DeFi portfolio on the Sui network with ease. Navigate intuitively and stay informed on your real-time asset distribution, working capital, and cross-protocol transactions. Maximize your overall utilization rate and ensure no token ever sits idle."
      previewSrc="/figma/landing/portfolio.png"
      previewAlt="DeepFlow Portfolio Dashboard"
      href="/portfolio"
    />
  );
}

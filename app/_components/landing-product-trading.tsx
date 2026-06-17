import { LandingProductSection } from "./landing-product-section";

export function LandingProductTrading() {
  return (
    <LandingProductSection
      id="landing-trading"
      headline={["TRADING", "ON DEEPBOOK"]}
      description="Execute DeepBook trades inside an atomic Sui PTB flow: withdraw, trade, settle, and redeposit in one rollback-safe pipeline with slippage protection and destination lock enforced by policy."
      previewSrc="/figma/landing/trading.png"
      previewAlt="DeepFlow Trading Terminal"
      href="/trading"
    />
  );
}

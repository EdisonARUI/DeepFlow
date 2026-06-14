"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LaunchAppLink } from "./launch-app-link";

type ProductTab = "portfolio" | "liquidity" | "trading";

const TABS: { id: ProductTab; label: string }[] = [
  { id: "portfolio", label: "Portfolio" },
  { id: "liquidity", label: "Liquidity" },
  { id: "trading", label: "Trading" },
];

const PRODUCT_CONTENT: Record<
  ProductTab,
  { title: string; description: string; preview: "dashboard" | "placeholder"; placeholderLabel: string }
> = {
  portfolio: {
    title: "Portfolio",
    description:
      "Command your complete DeFi portfolio on the Sui network with ease. Navigate intuitively and stay informed on your real-time asset distribution, working capital, and cross-protocol transactions. Maximize your overall utilization rate and ensure no token ever sits idle.",
    preview: "dashboard",
    placeholderLabel: "Portfolio Dashboard",
  },
  liquidity: {
    title: "Liquidity",
    description:
      "Submit a single execution request and let DeepFlow automatically withdraw from your authorized DeFi yield positions, route capital where it is needed, and redeposit when execution completes — keeping assets productive between trades.",
    preview: "placeholder",
    placeholderLabel: "Liquidity Management",
  },
  trading: {
    title: "Trading",
    description:
      "Execute DeepBook trades inside an atomic Sui PTB flow: withdraw, trade, settle, and redeposit in one rollback-safe pipeline with slippage protection and destination lock enforced by policy.",
    preview: "placeholder",
    placeholderLabel: "Trading Terminal",
  },
};

function ProductPreview({
  preview,
  placeholderLabel,
}: {
  preview: "dashboard" | "placeholder";
  placeholderLabel: string;
}) {
  if (preview === "dashboard") {
    return (
      <img
        src="/figma/landing/portfolio-dashboard.png"
        alt="DeepFlow Portfolio Dashboard"
        className="size-full object-cover object-left-top"
      />
    );
  }

  return (
    <div className="flex size-full flex-col items-center justify-center gap-4 bg-[rgba(0,224,255,0.03)] p-8">
      <p className="font-mono text-[11px] tracking-[1.1px] text-accent-cyan">
        DEEPFLOW_TERMINAL
      </p>
      <p className="text-center font-[family-name:var(--font-display)] text-2xl font-semibold text-text-primary">
        {placeholderLabel}
      </p>
      <p className="max-w-xs text-center text-sm text-text-muted">
        Preview coming soon — launch the app to explore the live workspace.
      </p>
    </div>
  );
}

export function LandingProducts() {
  const [activeTab, setActiveTab] = useState<ProductTab>("portfolio");
  const content = PRODUCT_CONTENT[activeTab];

  return (
    <section className="bg-gradient-to-br from-[#0b0f10] to-[#101415] py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-5 md:gap-8 md:px-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-2.56px] text-[#e0e3e5] md:text-[48px] md:leading-[70.4px]">
            Products
          </h2>
          <div className="flex gap-8 border-b border-[rgba(59,73,76,0.3)]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "border-b-2 pb-2.5 text-base transition-colors",
                  activeTab === tab.id
                    ? "border-accent-cyan text-accent-cyan"
                    : "border-transparent text-[#bac9cd] hover:text-text-primary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="relative overflow-hidden rounded-lg border border-[rgba(0,224,255,0.2)] shadow-[0px_0px_30px_0px_rgba(0,224,255,0.05)] lg:col-span-7">
            <div className="aspect-[671/538] w-full opacity-90">
              <ProductPreview
                preview={content.preview}
                placeholderLabel={content.placeholderLabel}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_20px_0px_rgba(0,0,0,0.8)]" />
          </div>
          <div className="flex flex-col gap-5 lg:col-span-5">
            <h3 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.8px] text-[#e0e3e5] md:text-[40px] md:leading-[48px]">
              {content.title}
            </h3>
            <p className="text-lg leading-[28.8px] text-[#bac9cd]">
              {content.description}
            </p>
            <LaunchAppLink variant="text" />
          </div>
        </div>
      </div>
    </section>
  );
}

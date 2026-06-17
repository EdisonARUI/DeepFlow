"use client";

import dynamic from "next/dynamic";
import { EnsureSiteIcon } from "@/components/ensure-site-icon";

const Providers = dynamic(
  () => import("./providers").then((mod) => mod.Providers),
  { ssr: false },
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EnsureSiteIcon />
      <Providers>{children}</Providers>
    </>
  );
}

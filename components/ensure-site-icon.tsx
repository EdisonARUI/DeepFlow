"use client";

import { useEffect } from "react";

const SITE_ICONS = [
  { rel: "shortcut icon", href: "/icon.png", type: "image/png" },
  { rel: "icon", href: "/icon.png", type: "image/png", sizes: "192x192" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
] as const;

export function EnsureSiteIcon() {
  useEffect(() => {
    for (const icon of SITE_ICONS) {
      const selector = `link[rel="${icon.rel}"][href="${icon.href}"]`;
      if (document.head.querySelector(selector)) continue;

      const link = document.createElement("link");
      link.rel = icon.rel;
      link.href = icon.href;
      link.type = icon.type;
      if ("sizes" in icon) link.sizes = icon.sizes;
      document.head.appendChild(link);
    }

    const img = new Image();
    img.src = new URL("/icon.png", window.location.origin).href;
  }, []);

  return null;
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DeepFlow",
    short_name: "DeepFlow",
    description: "Sui DeFi atomic execution dashboard",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#babbff",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/brand/app-icon-badge.png",
        sizes: "1280x1280",
        type: "image/png",
      },
    ],
  };
}

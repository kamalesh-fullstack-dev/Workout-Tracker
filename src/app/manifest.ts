import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Iron Log",
    short_name: "Iron Log",
    description:
      "Track workouts, hit PRs, and get smart weight & rep suggestions.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f6f3",
    theme_color: "#c2192b",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon/512-maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

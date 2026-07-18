import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fat Fitness Community",
    short_name: "Fat Fitness",
    description: "Personal fitness journey and peer support platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3faf3",
    theme_color: "#3a9448",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

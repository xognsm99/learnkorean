import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Korean Work - 한국어 학습",
    short_name: "Korean Work",
    description:
      "Master Korean language skills for the workplace. 직장에서 사용하는 한국어를 배워보세요.",
    start_url: "/ko/korean-work/learn",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0891b2",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

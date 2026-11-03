import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IMPACT MOB Facturare & Livrare",
    short_name: "IMPACT MOB",
    description: "Aplicație internă IMPACT MOB pentru facturare și documente.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef1f4",
    theme_color: "#0f766e",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}

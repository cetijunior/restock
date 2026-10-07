import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["MarketLogo.png"],
      manifest: {
        name: "Market Lami · Furnizim",
        short_name: "Furnizim",
        description: "Lista e furnizimit për Market Lami",
        lang: "sq",
        theme_color: "#0c0f0e",
        background_color: "#0c0f0e",
        display: "standalone",
        icons: [{ src: "MarketLogo.png", sizes: "1024x1024", type: "image/png", purpose: "any" }],
      },
    }),
  ],
});

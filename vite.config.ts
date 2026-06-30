import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  publicDir: "static",
  plugins: [
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      manifest: {
        name: "Train With Me",
        short_name: "TrainWithMe",
        description: "Plan and track strength, running, and sprint training locally.",
        start_url: "./",
        scope: "./",
        display: "standalone",
        background_color: "#f5f7fb",
        theme_color: "#2f6fed",
        icons: [
          {
            src: "./icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "./icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "./icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: "index.html",
        globPatterns: ["**/*.{html,js,css,json,webmanifest,woff2,png,svg,ico}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "train-with-me-pages",
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});

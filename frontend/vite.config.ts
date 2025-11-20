import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  envPrefix: "VITE_",
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        manualChunks: {
          "chart-vendors": ["chart.js", "react-chartjs-2", "chartjs-adapter-date-fns"],
          "map-vendors": ["leaflet", "react-leaflet"],
        },
      },
    },
  },
});

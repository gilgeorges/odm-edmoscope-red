import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

/**
 * Vite config for the EDMoScope UI catalogue.
 *
 * Dev:   npm run catalogue   (served at localhost)
 * Build: npm run build:catalogue   (outputs to catalogue/dist/)
 */
export default defineConfig({
  root: "catalogue",
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@edmoscope-ui": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});

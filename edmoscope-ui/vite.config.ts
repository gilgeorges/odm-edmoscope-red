import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

/**
 * Vite config for the EDMoScope UI catalogue.
 *
 * Dev:   npx vite catalogue/          (served at localhost)
 * Build: npx vite build catalogue/    (outputs to catalogue/dist/)
 *
 * The base path is set to the GitHub Pages project URL so asset paths
 * resolve correctly when deployed to https://<owner>.github.io/<repo>/.
 * Override with VITE_BASE env var for other deployment targets.
 */
export default defineConfig({
  root: "catalogue",
  base: process.env["VITE_BASE"] ?? "/odm-edmoscope-red/",
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

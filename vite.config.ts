import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// Standard Vite React SPA configuration for static hosting (Netlify / Vercel).
// The TanStack Start / Cloudflare SSR config is intentionally disabled here
// so that `npm run build` produces a normal dist/index.html + dist/assets/* output.
// Backend lives in /server and is deployed independently.
//
// @tailwindcss/vite MUST be listed here — Tailwind v4 uses a Vite plugin
// (not PostCSS) to process @import "tailwindcss" and generate utility classes.
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    tailwindcss(), // Tailwind v4: processes @import "tailwindcss" in styles.css
    react(),
    tsconfigPaths(),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "index.html",
    },
  },
});

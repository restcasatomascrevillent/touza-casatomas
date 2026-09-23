/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { VitePWA } from "vite-plugin-pwa";
import { loadEnv } from "vite";
import { cartaSSG } from "./scripts/carta-ssg-plugin.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  // `ssgOptions` lo lee vite-react-ssg (no Vite): ahí se generan sitemap.xml y
  // robots.txt con la URL base real, en lugar de tenerlos fijos en public/.
  ssgOptions: {
    onFinished: async (dir: string) => {
      const env = loadEnv(mode, process.cwd(), "VITE_");
      const { generarSitemapYRobots } = await import("./scripts/generar-sitemap.mjs");
      // OJO: este respaldo debe coincidir con el de `src/lib/site.ts`. Son dos
      // porque aquel corre en el bundle (`import.meta.env`) y este en Node
      // (`loadEnv`), y no pueden compartir módulo. El dominio real está sin
      // decidir; mientras tanto se usa la URL de Vercel, que existe. Antes
      // caía en `https://touzabar.es`, que no resuelve, y el sitemap listaba
      // 5 URLs de un dominio inexistente aunque el HTML ya fuera correcto.
      await generarSitemapYRobots(
        dir,
        env.VITE_SITE_URL || "https://touza-restaurant-website.vercel.app",
      );
    },
  },
  plugins: [
    react(),
    // Trae la carta de Supabase en build y la expone en `virtual:touza/carta`.
    cartaSSG(),
    VitePWA({
      registerType: 'autoUpdate',
      // robots.txt ya no está en public/: lo genera el build (ver ssgOptions).
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Touza Cocktail Bar',
        short_name: 'Touza',
        description: 'Cocktail Bar Premium en Crevillente. Cócteles de autor, ambiente único y eventos privados.',
        theme_color: '#D4A574',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
}));

/// <reference types="vitest" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { VitePWA } from "vite-plugin-pwa";
import { loadEnv } from "vite";
import { cartaSSG } from "./scripts/carta-ssg-plugin.mjs";
import { calcularVersion } from "./scripts/version.mjs";

/**
 * Publica /version.json con la versión M.N de Touza (docs/PROCESO-DE-CAMBIOS.md), para
 * saber qué versión tiene la demo y cuál producción. Solo en el build del cliente: el SSG
 * compila también para servidor y ahí no hace falta.
 */
function versionJsonPlugin(): Plugin {
  let ssr = false;
  const version = calcularVersion();
  return {
    name: "version-json",
    apply: "build",
    configResolved(config) {
      ssr = !!config.build.ssr;
      if (!ssr) console.log(`Versión ${version.version} · ${version.entorno} · ${version.commit ?? "sin commit"}${version.aviso ? ` · AVISO: ${version.aviso}` : ""}`);
    },
    generateBundle() {
      if (!ssr) this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify(version) });
    },
  };
}

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
      // (`loadEnv`), y no pueden compartir módulo. Dominio real desde el
      // 10/11/2026: touza.restaurantecasatomascrevillente.es. Antes
      // caía en `https://touzabar.es`, que no resuelve, y el sitemap listaba
      // 5 URLs de un dominio inexistente aunque el HTML ya fuera correcto.
      await generarSitemapYRobots(
        dir,
        env.VITE_SITE_URL || "https://touza.restaurantecasatomascrevillente.es",
      );
      // vite-react-ssg necesita dist/.vite/{manifest,ssr-manifest}.json para
      // prerenderizar, pero ya ha terminado: si se quedan, Vercel los publica
      // (~120 KB, legibles por cualquiera en /.vite/…) sin que nada los use.
      const { rm } = await import("node:fs/promises");
      await rm(path.join(dir, ".vite"), { recursive: true, force: true });
    },
  },
  plugins: [
    react(),
    // Trae la carta de Supabase en build y la expone en `virtual:touza/carta`.
    cartaSSG(),
    versionJsonPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      // robots.txt ya no está en public/: lo genera el build (ver ssgOptions).
      includeAssets: ['favicon.ico'],
      // Precache mínimo. Antes el SW precacheaba TODO el build en la primera
      // visita a cualquier ruta (6 HTML + 21 chunks JS, ~440 KB brotli, incluido
      // el chunk de three.js que el móvil nunca usa), y tras cada deploy volvía
      // a bajar todo lo que cambiaba. Eso se paga en Fast Data Transfer de
      // Vercel. Ahora solo se precachea CSS + iconos; el JS y las imágenes se
      // cachean en runtime *cuando la página los usa* (ya los ha descargado, así
      // que no cuesta bytes extra), y los HTML con NetworkFirst.
      workbox: {
        globPatterns: ['**/*.css'], // favicon.ico entra por includeAssets
        // Con SSG cada ruta tiene su propio HTML: no hay fallback de SPA
        // (además index.html ya no está en el precache).
        navigateFallback: null,
        // Borra cachés de precache de versiones antiguas de Workbox. Las
        // entradas del precache actual que ya no están en el manifest las
        // elimina Workbox al activar el SW nuevo (libera los ~440 KB viejos).
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Ficheros con hash (inmutables): JS, CSS e imágenes AVIF/WebP.
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/assets/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'touza-assets',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // HTML prerenderizado: siempre red primero (contenido fresco tras
            // deploy); la copia en caché solo sirve sin conexión.
            urlPattern: ({ request, sameOrigin }) => sameOrigin && request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'touza-pages',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 10 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      // Único manifest del sitio: el plugin genera /manifest.webmanifest e
      // inyecta su <link rel="manifest">. No añadas otro en index.html ni en
      // public/: había un public/manifest.json duplicado enlazado antes que
      // este, y el navegador usaba ese (el primero).
      manifest: {
        name: 'Touza Cocktail Bar',
        short_name: 'Touza',
        description: 'Cocktail Bar Premium en Crevillente. Cócteles de autor, champagne, vinos y whisky.',
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

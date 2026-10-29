// ============================================================================
// Build SSG completo para el CI, SIN tocar Supabase.
// ----------------------------------------------------------------------------
// El build normal descarga la carta de Supabase (scripts/carta-ssg-plugin.mjs)
// y se aborta sin credenciales o sin cócteles. Aquí se levanta un servidor HTTP
// local que responde a `/rest/v1/...` con filas de prueba (un cóctel, que el
// build exige; algo de vinos, bebidas y platos; `[]` para lo demás), se apunta
// VITE_SUPABASE_URL a él y se construye como en Vercel. Así el CI comprueba el
// prerender de todas las páginas sin depender de la red ni de datos reales.
// Uso: `npm run build:ci`.
// ============================================================================
import http from "node:http";
import { spawn } from "node:child_process";

const PUERTO = Number(process.env.CI_SUPABASE_PORT ?? 54329);
const URL_FALSA = `http://127.0.0.1:${PUERTO}`;

const FILAS = {
  Cocteles: [
    {
      id: "c1",
      nombre: "Cóctel CI",
      descripcion: "Fila de prueba del CI",
      precio_eur: 9,
      imagen_url: null,
      categoria: "Clásicos",
      base: "Ginebra",
      ingredientes: "Ginebra, Tónica",
      orden: 1,
      alergenos_oficiales: null,
      alergenos_notas: null,
    },
  ],
  Vinos: [{ id: 1, nombre: "Vino CI", categoria: "Tintos", precio_eur: 20, ubicacion_pais: "España", orden: "0" }],
  Bebidas: [{ id: 1, nombre: "Cerveza CI", categoria: "Cervezas", precio_eur: 3, orden: 1 }],
  Platos: [{ id: 1, nombre: "Plato CI", categoria: "Entrantes", precio_eur: 10, descripcion: "Fila de prueba del CI" }],
};

const servidor = http.createServer((req, res) => {
  const tabla = /^\/rest\/v1\/([^?/]+)/.exec(req.url ?? "")?.[1];
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify((tabla && FILAS[tabla]) || []));
});
await new Promise((ok, ko) => {
  servidor.once("error", ko);
  servidor.listen(PUERTO, "127.0.0.1", ok);
});
console.log(`[ci-build] Supabase de mentira en ${URL_FALSA}`);

const codigo = await new Promise((ok) => {
  const hijo = spawn("npx", ["vite-react-ssg", "build"], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      // Pisan a cualquier .env local: process.env gana en loadEnv de Vite.
      VITE_SUPABASE_URL: URL_FALSA,
      VITE_SUPABASE_PUBLISHABLE_KEY: "ci-clave-publica-falsa",
      VITE_SUPABASE_ANON_KEY: "ci-clave-publica-falsa",
    },
  });
  hijo.on("exit", (c) => ok(c ?? 1));
});

servidor.close();
process.exit(codigo);

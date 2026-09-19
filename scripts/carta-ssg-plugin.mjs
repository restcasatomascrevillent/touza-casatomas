/**
 * Plugin de Vite: trae la carta de Supabase EN TIEMPO DE BUILD y la expone
 * como módulo virtual `virtual:touza/carta`.
 *
 * Por qué así y no con un `loader` de react-router:
 *   `vite-react-ssg@0.9.1-beta.1` crea el router del cliente con
 *   `createBrowserRouter(...)` SIN `hydrationData` (dist/index.mjs:88-96), así
 *   que en la hidratación react-router volvería a ejecutar el loader —un fetch
 *   asíncrono al JSON estático— y `RouterProvider` pintaría el fallback (nada)
 *   mientras tanto: pantallazo en blanco y desajuste de hidratación justo en la
 *   página que queremos prerenderizar.
 *   Horneando los datos en el bundle, el primer render de Node y el de la
 *   hidratación parten EXACTAMENTE del mismo objeto → cero desajustes, y sin
 *   tocar la firma de ningún componente (los tests siguen montando <Carta/>
 *   en un MemoryRouter normal).
 *
 * En `serve` (dev y vitest) el módulo devuelve `null` y no se toca la red:
 * los hooks se comportan como siempre, pidiendo los datos al navegador.
 */
import { loadEnv } from "vite";

const VIRTUAL_ID = "virtual:touza/carta";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

/** Mismas categorías que pide `src/pages/Carta.tsx`. */
const CATEGORIAS_VINOS = ["CHAMPAGNES", "CAVAS Y OTROS ESPUMOSOS"];
const CATEGORIAS_BEBIDAS = ["Cervezas", "Copas", "Whiskies"];

/** `vite-react-ssg build` lanza dos builds (cliente + SSR): una sola consulta. */
let cache = null;

async function consultar(base, key, tabla, params) {
  const url = `${base}/rest/v1/${tabla}?${params}`;
  const res = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`${tabla}: HTTP ${res.status} ${res.statusText} — ${(await res.text()).slice(0, 300)}`);
  }
  const filas = await res.json();
  if (!Array.isArray(filas)) throw new Error(`${tabla}: respuesta inesperada de PostgREST`);
  return filas;
}

async function traerCarta(base, key) {
  const [cocteles, vinos, bebidas, platos] = await Promise.all([
    // Mismos filtros y orden que useCocteles.ts / useVinos.ts / useBebidas.ts /
    // usePlatos.ts. Si divergen, el HTML y lo que refresca React Query dejarían
    // de coincidir y habría parpadeo al hidratar.
    consultar(base, key, "Cocteles", "select=*&activado=eq.true&touza=eq.true&order=orden.asc"),
    consultar(
      base,
      key,
      "Vinos",
      `select=*&activado=eq.true&touza=eq.true&categoria=in.(${CATEGORIAS_VINOS.map((c) => `"${c}"`).join(",")})&order=orden.asc`,
    ),
    consultar(
      base,
      key,
      "Bebidas",
      `select=*&activado=eq.true&touza=eq.true&categoria=in.(${CATEGORIAS_BEBIDAS.map((c) => `"${c}"`).join(",")})&order=orden.asc`,
    ),
    consultar(
      base,
      key,
      "Platos",
      "select=id,nombre,descripcion,precio_eur,imagen_url,categoria,alergenos_oficiales&activado=eq.true&touza=eq.true&order=orden.asc",
    ),
  ]);

  const porCategoria = (filas, categorias) =>
    Object.fromEntries(categorias.map((c) => [c, filas.filter((f) => f.categoria === c)]));

  // Mejor romper el build que publicar —y que Google indexe— una carta vacía.
  if (cocteles.length === 0) {
    throw new Error(
      "0 cócteles con activado=true y touza=true. Revisa los datos antes de desplegar: " +
        "publicar /carta sin cócteles es peor que no desplegar.",
    );
  }

  return {
    generadoEn: new Date().toISOString(),
    cocteles,
    vinos: porCategoria(vinos, CATEGORIAS_VINOS),
    bebidas: porCategoria(bebidas, CATEGORIAS_BEBIDAS),
    // `Platos.touza` es false en las 128 filas de la tabla → esto viene vacío
    // a propósito. Ver el comentario de src/hooks/usePlatos.ts.
    platos,
  };
}

/** @returns {import('vite').Plugin} */
export function cartaSSG() {
  let esBuild = false;
  let modo = "production";

  return {
    name: "touza:carta-ssg",
    enforce: "pre",

    configResolved(config) {
      esBuild = config.command === "build";
      modo = config.mode;
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
      return null;
    },

    async load(id) {
      if (id !== RESOLVED_ID) return null;
      if (!esBuild) return "export default null;\n";

      if (!cache) {
        const env = loadEnv(modo, process.cwd(), "VITE_");
        const base = (env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
        const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || "";
        if (!base || !key) {
          this.error(
            "[carta-ssg] Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_PUBLISHABLE_KEY. " +
              "Sin ellas /carta se publicaría vacía; se aborta el build.",
          );
        }
        try {
          cache = await traerCarta(base, key);
        } catch (err) {
          this.error(`[carta-ssg] No se pudo leer la carta de Supabase → build abortado. ${err.message}`);
        }
        const n = (o) => Object.values(o).reduce((t, v) => t + v.length, 0);
        this.info?.(
          `[carta-ssg] ${cache.cocteles.length} cócteles · ${n(cache.vinos)} vinos · ` +
            `${n(cache.bebidas)} bebidas · ${cache.platos.length} tapas`,
        );
      }

      return `export default ${JSON.stringify(cache)};\n`;
    },
  };
}

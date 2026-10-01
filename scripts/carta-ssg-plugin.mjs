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
import {
  COLUMNAS_BEBIDAS,
  COLUMNAS_COCTELES,
  COLUMNAS_VINOS,
  ORDEN_VINOS_POSTGREST,
  ordenarVinos,
} from "../src/lib/carta-consultas.mjs";

const VIRTUAL_ID = "virtual:touza/carta";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

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

/**
 * Interruptor «Fotos de platos en Touza» del panel (Gestor Web → Carta), en
 * `configuracion_web.mostrar_fotos_platos_touza` (fila única, legible con la
 * anon key; migración 20261001113700 de adminpanelct).
 *
 * FALLA ABIERTO: cualquier problema leyéndolo (tabla aún sin crear → 404
 * PGRST205, red, fila ausente) deja las fotos VISIBLES, que es lo de siempre;
 * solo un `false` explícito las oculta. Nunca rompe el build: no poder leer un
 * ajuste cosmético no justifica dejar de desplegar. El navegador lo vuelve a
 * leer al cargar la página (`useMostrarFotosPlatosTouza`, src/hooks/usePlatos.ts):
 * hoy `rebuild-webs` no llega a lanzar deploys, así que el cambio tiene que
 * notarse sin uno.
 *
 * @returns {Promise<boolean>}
 */
export async function leerMostrarFotosPlatos(base, key) {
  try {
    const filas = await consultar(base, key, "configuracion_web", "select=mostrar_fotos_platos_touza&id=eq.true&limit=1");
    return filas[0]?.mostrar_fotos_platos_touza !== false;
  } catch (err) {
    console.warn(
      `[carta-ssg] No se pudo leer configuracion_web (${err?.message ?? err}); ` +
        "se publican las fotos de los platos (comportamiento por defecto).",
    );
    return true;
  }
}

async function traerCarta(base, key) {
  const [cocteles, vinos, bebidas, platos, mostrarFotosPlatos] = await Promise.all([
    // Mismos filtros y orden que useCocteles.ts / useVinos.ts / useBebidas.ts /
    // usePlatos.ts. Si divergen, el HTML y lo que refresca React Query dejarían
    // de coincidir y habría parpadeo al hidratar.
    // Columnas y orden de vinos en src/lib/carta-consultas.mjs, compartido
    // con los hooks (antes `select=*`: ~190 KB de traducciones en el bundle).
    consultar(base, key, "Cocteles", `select=${COLUMNAS_COCTELES}&activado=eq.true&touza=eq.true&order=orden.asc`),
    // Sin filtro de categoría a propósito: la tabla Vinos mezcla tipo y
    // denominación de origen en `categoria` ("VINOS TINTOS — RIBERA DEL
    // DUERO") y esa lista de denominaciones cambia con la carta. Antes esta
    // consulta pedía solo CHAMPAGNES y CAVAS Y OTROS ESPUMOSOS —escritas a
    // mano—, así que los 131 vinos con denominación (tintos, blancos...)
    // nunca llegaban al HTML prerenderizado ni al JSON-LD, aunque
    // `agruparVinosPorTipo` (src/lib/vinos-carta.ts) ya sabía agruparlos en
    // el navegador desde el commit 8f0db1d. Mismo filtro que la unión de
    // useVinos(categoria) + useVinosRestantes: touza + activado, sin
    // restringir categoría; mismo orden que useVinosRestantes, y después
    // `ordenarVinos` (abajo), como hacen los hooks con lo que refrescan.
    consultar(
      base,
      key,
      "Vinos",
      `select=${COLUMNAS_VINOS}&activado=eq.true&touza=eq.true&order=categoria.asc,${ORDEN_VINOS_POSTGREST}`,
    ),
    consultar(
      base,
      key,
      "Bebidas",
      `select=${COLUMNAS_BEBIDAS}&activado=eq.true&touza=eq.true&categoria=in.(${CATEGORIAS_BEBIDAS.map((c) => `"${c}"`).join(",")})&order=orden.asc`,
    ),
    consultar(
      base,
      key,
      "Platos",
      "select=id,nombre,descripcion,precio_eur,imagen_url,categoria,alergenos_oficiales,alergenos_notas&activado=eq.true&touza=eq.true&order=orden.asc",
    ),
    leerMostrarFotosPlatos(base, key),
  ]);

  const porCategoria = (filas, categorias) =>
    Object.fromEntries(categorias.map((c) => [c, filas.filter((f) => f.categoria === c)]));

  // A diferencia de bebidas (lista fija), los vinos se agrupan por el valor
  // real de `categoria` de cada fila, no por una lista escrita a mano —igual
  // que useVinosRestantes en el navegador—, para que una denominación nueva
  // en el admin tenga dónde caer sin tocar este script. Esto solo guarda la
  // instantánea en bruto por categoría: el reparto en tipo → denominación lo
  // hace `agruparVinosPorTipo` (src/lib/vinos-carta.ts) cuando el propio
  // build renderiza `<Carta/>` vía SSR de Vite —ese módulo TypeScript se
  // carga tal cual, sin reimplementar aquí su lógica.
  //
  // Cada categoría, en el orden de `ordenarVinos` (`orden` numérico → nombre
  // → id): `Vinos.orden` es "0" en todas las filas y, sin desempate, el orden
  // del HTML prerenderizado y el del refresco del navegador no coincidían.
  const porCategoriaReal = (filas) => {
    const resultado = {};
    for (const fila of ordenarVinos(filas)) {
      if (!fila.categoria) continue;
      (resultado[fila.categoria] ??= []).push(fila);
    }
    return resultado;
  };

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
    vinos: porCategoriaReal(vinos),
    bebidas: porCategoria(bebidas, CATEGORIAS_BEBIDAS),
    // `Platos.touza` es false en las 128 filas de la tabla → esto viene vacío
    // a propósito. Ver el comentario de src/hooks/usePlatos.ts.
    // `imagen_url` se conserva aunque las fotos estén apagadas: el navegador
    // relee el interruptor al cargar (`useMostrarFotosPlatosTouza`) y, si se
    // vuelven a encender, las enseña sin esperar a un deploy. La tarjeta las
    // oculta con `transformPlatosToUI(…, { mostrarFotos })` y el JSON-LD con
    // `platosParaJsonLd` (src/lib/carta-ssg.ts).
    platos,
    config: { mostrarFotosPlatos },
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

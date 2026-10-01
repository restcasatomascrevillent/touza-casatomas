/**
 * Lo que comparten las consultas de la carta del navegador (hooks
 * `useCocteles`, `useVinos*`, `useBebidas`) y las del build
 * (`scripts/carta-ssg-plugin.mjs`): columnas y orden de los vinos.
 *
 * Es JavaScript plano (.mjs, tipos en `carta-consultas.d.mts`) para que lo
 * importen tal cual Node, en el plugin de Vite, y el bundle del cliente. Si
 * el HTML prerenderizado y lo que React Query refresca después no salen de
 * aquí, divergen: otro orden o columnas de menos y la carta "salta" al
 * hidratar.
 */

/**
 * Columnas que la web usa de verdad. Antes era `select=*`: en Vinos son 36
 * columnas (traducciones, alérgenos inferidos, posición de imagen…) y la
 * instantánea del build metía ~190 KB en el chunk de la carta.
 *
 * Al añadir un campo a un `transform*ToUI`, a `menuSchema`
 * (src/lib/negocio.ts) o a `datosAlergenos`, hay que añadirlo aquí. Ojo: una
 * columna que no exista en la tabla hace fallar la consulta entera (400).
 */
export const COLUMNAS_COCTELES =
  "id,nombre,descripcion,precio_eur,imagen_url,categoria,base,ingredientes,orden,alergenos_oficiales,alergenos_notas";

export const COLUMNAS_VINOS =
  "id,nombre,descripcion,precio_eur,categoria,orden,featured,ubicacion_region,ubicacion_pais,denominacion_origen";

export const COLUMNAS_BEBIDAS = "id,nombre,descripcion,precio_eur,categoria,tipo,tag,featured,orden,tamano";

/**
 * `Vinos.orden` es TEXTO y hoy vale "0" (o null) en todas las filas, así que
 * `order=orden.asc` no fijaba ningún orden: cada consulta podía devolver los
 * vinos en otro orden y el HTML del build no coincidía con el refresco del
 * navegador. Además, ordenado como texto "10" va antes que "2".
 *
 * Orden definitivo, en JS y no en PostgREST (que no puede ordenar por un
 * cast): `orden` como número (vacío o no numérico, al final) → `nombre` sin
 * mayúsculas ni tildes → `id`. Comparación por código y no con
 * `localeCompare`/`Intl.Collator`: el resultado no depende del ICU de Node ni
 * del navegador, así que build e hidratación ordenan igual.
 */
const ordenNumerico = (orden) => {
  if (orden === null || orden === undefined) return Number.POSITIVE_INFINITY;
  const texto = String(orden).trim();
  if (texto === "") return Number.POSITIVE_INFINITY;
  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : Number.POSITIVE_INFINITY;
};

const clave = (texto) =>
  (texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

const comparar = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

export function compararVinos(a, b) {
  const oa = ordenNumerico(a.orden);
  const ob = ordenNumerico(b.orden);
  if (oa !== ob) return oa < ob ? -1 : 1;
  return comparar(clave(a.nombre), clave(b.nombre)) || comparar(String(a.id), String(b.id));
}

/** Copia ordenada (no muta la entrada). */
export function ordenarVinos(vinos) {
  return [...vinos].sort(compararVinos);
}

/**
 * Orden para PostgREST: el mismo criterio hasta donde llega la base de datos
 * (texto y su collation), con desempate por nombre e id para que la
 * respuesta sea estable. El orden que se pinta lo fija `ordenarVinos`.
 */
export const ORDEN_VINOS_POSTGREST = "orden.asc.nullslast,nombre.asc,id.asc";

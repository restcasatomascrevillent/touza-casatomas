/**
 * Reglas de presentación de la carta (/carta y /despues-de-cenar).
 *
 * Funciones puras: no saben de React ni de Supabase, así que se prueban sin
 * montar la página (ver `lib/__tests__/carta.test.ts`).
 */
import { esFotoDeBanco } from "@/lib/negocio";

/**
 * Ancla de un producto en /carta: «Moscow Mule» → `moscow-mule`,
 * «Piña Colada» → `pina-colada`, «Jack Daniel's Apple» → `jack-daniels-apple`.
 * La usan las tarjetas (`id`) y los enlaces desde otras páginas
 * (`/carta#moscow-mule`).
 */
export function slugCarta(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/['’`´]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * La foto del producto si es nuestra; cadena vacía si no hay o si es de un
 * banco de imágenes (Unsplash). Una foto ajena con el nombre del cóctel como
 * `alt` confunde a Google Imágenes y a los asistentes, y al cliente le enseña
 * una copa que no es la que le van a servir.
 */
export const fotoPropia = (url: string | null | undefined): string =>
  url && !esFotoDeBanco(url) ? url : "";

/** 7 → «7»; 8,5 → «8,50». */
const precioCorto = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ","));

/** «a», «a y b», «a, b y c». */
const enumerar = (partes: string[]): string =>
  partes.length <= 1 ? (partes[0] ?? "") : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;

const NOMBRE_CATEGORIA: Record<string, [singular: string, plural: string]> = {
  autor: ["de autor", "de autor"],
  clasicos: ["clásico", "clásicos"],
  "sin-alcohol": ["sin alcohol", "sin alcohol"],
};

/**
 * Línea de hechos bajo el h1 de la carta, sacada de los datos:
 * «18 cócteles de autor, clásicos y sin alcohol, de 7 a 10 €».
 * `null` si no hay cócteles (cargando o carta vacía).
 */
export function resumenCocteles(
  cocteles: ReadonlyArray<{ categoria?: string | null; precio_eur?: number | null }>,
): string | null {
  if (cocteles.length === 0) return null;

  const uno = cocteles.length === 1;
  const categorias = Object.keys(NOMBRE_CATEGORIA).filter((id) => cocteles.some((c) => c.categoria === id));
  const cuantos = `${cocteles.length} ${uno ? "cóctel" : "cócteles"}`;
  const tipos = categorias.length > 0 ? ` ${enumerar(categorias.map((id) => NOMBRE_CATEGORIA[id][uno ? 0 : 1]))}` : "";

  const precios = cocteles.map((c) => c.precio_eur).filter((p): p is number => typeof p === "number" && p > 0);
  let rango = "";
  if (precios.length > 0) {
    const min = Math.min(...precios);
    const max = Math.max(...precios);
    rango = min === max ? `, a ${precioCorto(min)} €` : `, de ${precioCorto(min)} a ${precioCorto(max)} €`;
  }
  return `${cuantos}${tipos}${rango}`;
}

export interface GrupoCarta<T> {
  /** Título del grupo; `null` cuando la lista va entera, sin subtítulos. */
  titulo: string | null;
  items: T[];
}

// Se comparan sin tildes: en JS `\b` solo entiende ASCII y «Rosé\b» no casa.
const sinTildes = (texto: string) => texto.normalize("NFD").replace(/\p{Diacritic}/gu, "");
const ES_ROSADO = /\brose\b|\brosado\b/i;
const ES_DE_ANADA = /\b(19|20)\d{2}\b|\bvintage\b|\bmillesim/i;

/**
 * Champagne por tipo, a partir del nombre (la tabla no tiene una columna de
 * tipo: todas las filas son «AOC Champagne»). Un rosado de añada va a
 * «Rosado»: el color es lo primero que se pide en la barra.
 *
 * Solo agrupa si salen al menos dos grupos y la lista es larga; con pocas
 * botellas (o una búsqueda) los subtítulos estorban más que ayudan.
 */
export function agruparChampagne<T extends { name: string }>(items: T[]): GrupoCarta<T>[] {
  const brut: T[] = [];
  const rosado: T[] = [];
  const anada: T[] = [];
  for (const item of items) {
    const nombre = sinTildes(item.name);
    if (ES_ROSADO.test(nombre)) rosado.push(item);
    else if (ES_DE_ANADA.test(nombre)) anada.push(item);
    else brut.push(item);
  }
  const grupos = [
    { titulo: "Brut", items: brut },
    { titulo: "Rosado", items: rosado },
    { titulo: "De añada", items: anada },
  ].filter((g) => g.items.length > 0);

  if (grupos.length < 2 || items.length < 8) return [{ titulo: null, items }];
  return grupos;
}

/** Recorta a 0…1. */
export const limitar = (n: number): number => Math.min(1, Math.max(0, n));

/**
 * Opacidad del fotograma `k` (k ≥ 1; el 0 siempre está entero, debajo) cuando
 * la secuencia va por la posición `f` (0…último, con decimales). Cada
 * fotograma está encima del anterior: el `f = 2,4` deja el 2 entero y el 3 al
 * 40 %, un fundido cruzado entre los dos.
 */
export const opacidadFotograma = (k: number, f: number): number => limitar(f - (k - 1));

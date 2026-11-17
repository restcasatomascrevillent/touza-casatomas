/**
 * Reglas de presentación de la carta (/carta y /despues-de-cenar).
 *
 * Funciones puras: no saben de React ni de Supabase, así que se prueban sin
 * montar la página (ver `lib/__tests__/carta.test.ts`).
 */
import { esFotoDeBanco } from "@/lib/negocio";
import { IMAGENES } from "@/assets/imagenes";
import { ESPACIO_PRECIO, importe } from "@/lib/precio";

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

/**
 * Foto para el cóctel que aún no tiene la suya: la «T» retroiluminada del
 * local, sin copa, para no enseñar un cóctel que no es (pedido del 15/11/2026).
 * Variante de 640 px en WebP (≈55 KB): las tarjetas no pasan de ese ancho.
 */
export const FOTO_COCTEL_SIN_FOTO: string = (() => {
  const variantes = IMAGENES.logo.webp.split(", ").map((v) => {
    const [url, ancho] = v.split(" ");
    return { url, ancho: Number.parseInt(ancho, 10) };
  });
  return variantes.find((v) => v.ancho >= 640)?.url ?? IMAGENES.logo.src;
})();


/** Nombre visible de la base de un cóctel («cachaca» → «Cachaça»). `null` si no hay base que enseñar. */
const NOMBRE_BASE: Record<string, string> = {
  aperol: "Aperol",
  cachaca: "Cachaça",
  ginebra: "Ginebra",
  prosecco: "Prosecco",
  ron: "Ron",
  "sin-alcohol": "Sin alcohol",
  tequila: "Tequila",
  vodka: "Vodka",
  whisky: "Whisky",
};

export function nombreBase(base: string | null | undefined): string | null {
  const id = (base ?? "").trim().toLowerCase();
  if (!id || id === "all") return null;
  return NOMBRE_BASE[id] ?? id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " ");
}

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

  const rango = rangoPrecios(cocteles);
  return `${cuantos}${tipos}${rango ? `, ${rango}` : ""}`;
}

/**
 * Cócteles de «La carta» en la portada: solo los que tienen foto propia (la
 * genérica de la «T» no cuenta), en el orden de la carta, y 8, 6 o 4 para que
 * la cuadrícula cierre filas enteras (2 columnas en el móvil; 4 o 3 desde md).
 */
export function cuantosCaben(disponibles: number): number {
  if (disponibles >= 8) return 8;
  if (disponibles >= 6) return 6;
  if (disponibles >= 4) return 4;
  return disponibles;
}

export function elegirCoctelesPortada<T extends { image: string; fotoGenerica?: boolean }>(cocteles: T[]): T[] {
  const conFoto = cocteles.filter((c) => c.image && !c.fotoGenerica);
  return conFoto.slice(0, cuantosCaben(conFoto.length));
}

type ConPrecio = { precio_eur?: number | null };

/** «de 7 a 10 €», «a 9 €» si todos cuestan lo mismo, o `null` si no hay precios. */
export function rangoPrecios(cocteles: ReadonlyArray<ConPrecio>): string | null {
  const precios = cocteles.map((c) => c.precio_eur).filter((p): p is number => typeof p === "number" && p > 0);
  if (precios.length === 0) return null;
  const min = Math.min(...precios);
  const max = Math.max(...precios);
  return min === max
    ? `a ${importe(min)}${ESPACIO_PRECIO}€`
    : `de ${importe(min)} a ${importe(max)}${ESPACIO_PRECIO}€`;
}

/**
 * Meta descripciones (auditoría de posicionamiento del 16/11/2026). El número
 * de cócteles y el rango de precios salen de la carta, como la línea de
 * `resumenCocteles`: si el panel cambia un precio, la descripción cambia con
 * el siguiente despliegue y no hay cifras escritas a mano que envejezcan. Sin
 * datos (carta vacía o sin cargar), la misma frase sin cifras. Con espacio
 * normal antes del «€»: es texto para el buscador, no para maquetar.
 */
const rangoPlano = (cocteles: ReadonlyArray<ConPrecio>): string | null =>
  rangoPrecios(cocteles)?.split(ESPACIO_PRECIO).join(" ") ?? null;

export function descripcionPortada(cocteles: ReadonlyArray<ConPrecio>): string {
  const rango = rangoPlano(cocteles);
  return `Touza, coctelería y bar de copas en Crevillent (Crevillente), junto a Casa Tomás. Cócteles ${rango ?? "de autor"}, champagne y whisky. Sin reservas.`;
}

export function descripcionCarta(cocteles: ReadonlyArray<ConPrecio & { categoria?: string | null }>): string {
  const rango = rangoPlano(cocteles);
  const cuantos = cocteles.length > 1 ? `${cocteles.length} cócteles` : "cócteles";
  const sinAlcohol = cocteles.length === 0 || cocteles.some((c) => c.categoria === "sin-alcohol");
  return `Carta de Touza: ${cuantos} de autor y clásicos${rango ? ` ${rango}` : ""}, ${sinAlcohol ? "con y sin alcohol, " : ""}además de champagne, cava, cerveza y whisky. Crevillent.`;
}

export function descripcionDespuesDeCenar(cocteles: ReadonlyArray<ConPrecio>): string {
  const rango = rangoPlano(cocteles);
  return `Cena en Casa Tomás y toma la copa en Touza, la puerta de al lado (n.º 4), en Crevillent. ${rango ? `Cócteles ${rango}. ` : ""}Sin reservas: ven directamente.`;
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

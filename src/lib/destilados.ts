/**
 * «Destilados» en /carta y en la tercera puerta de la portada (rediseño A,
 * 21/11/2026): una sola pestaña con whisky, ginebra, ron, vodka, tequila…
 * cada familia con su subtítulo.
 *
 * Las categorías las escribe a mano quien rellena el panel (tabla Bebidas,
 * columna `categoria`) y no hay una lista cerrada: hoy en la demo solo existe
 * «Whiskies», y las demás se están metiendo. Por eso se reconocen de forma
 * flexible: sin mayúsculas ni tildes, en singular o plural y por cualquier
 * palabra del nombre («Ginebra», «Ginebras premium», «Gin», «Rones añejos»).
 *
 * Una categoría que no se reconoce no desaparece: si no es claramente otra
 * cosa (refresco, agua, tónica, cerveza, copa, vino…), va a «Otros
 * destilados», al final.
 *
 * Funciones puras (sin React ni Supabase): ver lib/__tests__/destilados.test.ts.
 */

export interface GrupoDestilado<T> {
  /** Ancla y clave estable del grupo (`/carta#ginebras`). */
  id: string;
  /** Subtítulo en la carta: «Whiskies», «Tequilas y mezcales»… */
  titulo: string;
  /** Nombre corto en minúscula para frases: «whisky», «ginebra»… */
  familia: string;
  items: T[];
}

interface DefGrupo {
  id: string;
  titulo: string;
  familia: string;
  /** Palabras (ya normalizadas: minúsculas, sin tildes) que lo identifican. */
  palabras: RegExp;
}

/** En el orden en que se pintan. */
export const GRUPOS_DESTILADOS: readonly DefGrupo[] = [
  { id: "whiskies", titulo: "Whiskies", familia: "whisky", palabras: /^(whisky|whiskys|whiskies|whiskey|whiskeys|bourbon|bourbons|scotch)$/ },
  { id: "ginebras", titulo: "Ginebras", familia: "ginebra", palabras: /^(ginebra|ginebras|gin|gins)$/ },
  { id: "rones", titulo: "Rones", familia: "ron", palabras: /^(ron|rones|rum|rums)$/ },
  { id: "vodkas", titulo: "Vodkas", familia: "vodka", palabras: /^(vodka|vodkas)$/ },
  { id: "tequilas", titulo: "Tequilas y mezcales", familia: "tequila", palabras: /^(tequila|tequilas|mezcal|mezcales|mezcals)$/ },
  { id: "brandys", titulo: "Brandy y coñac", familia: "brandy", palabras: /^(brandy|brandys|brandies|conac|conacs|cognac|cognacs|armagnac|armagnacs)$/ },
  { id: "licores", titulo: "Licores", familia: "licor", palabras: /^(licor|licores|liqueur|liqueurs|orujo|orujos|aguardiente|aguardientes|pacharan|pacharanes)$/ },
  { id: "vermuts", titulo: "Vermuts", familia: "vermut", palabras: /^(vermut|vermuts|vermouth|vermouths|vermu|vermus)$/ },
];

/** Grupo de lo que no se reconoce pero no es claramente otra cosa. */
export const GRUPO_OTROS = { id: "otros-destilados", titulo: "Otros destilados", familia: "otros" } as const;

/**
 * Categorías de Bebidas que NO son destilados: tienen su propia pestaña
 * (Cervezas), van en la «i» de las botellas (Copas) o no salen en Touza.
 * «ginger» (ginger ale/beer) es un refresco: se mira antes que «gin».
 */
const NO_DESTILADO =
  /^(refresco|refrescos|agua|aguas|tonica|tonicas|cerveza|cervezas|copa|copas|tinto|tintos|vino|vinos|blanco|blancos|rosado|rosados|zumo|zumos|cafe|cafes|infusion|infusiones|te|tes|batido|batidos|mixer|mixers|ginger|soda|sodas|sin|cava|cavas|champagne|champagnes|espumoso|espumosos)$/;

/** Minúsculas, sin tildes ni signos: «Coñac» → «conac», «Tequilas y Mezcales» → «tequilas y mezcales». */
export const normalizarCategoria = (categoria: string | null | undefined): string =>
  (categoria ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const palabras = (categoria: string | null | undefined) => normalizarCategoria(categoria).split(" ").filter(Boolean);

/**
 * Grupo de destilados de una categoría, o `null` si no es un destilado.
 * Manda la primera palabra («Licor de whisky» → licores); si no dice nada,
 * cualquier otra («Whisky escocés», «Selección de rones»).
 */
export function grupoDeCategoria(categoria: string | null | undefined): string | null {
  const ps = palabras(categoria);
  if (ps.length === 0) return null;
  // Lo que no es destilado, fuera, aunque luego lleve otra palabra («Refrescos de cola»).
  if (NO_DESTILADO.test(ps[0])) return null;
  for (const p of ps) {
    if (NO_DESTILADO.test(p)) continue;
    const grupo = GRUPOS_DESTILADOS.find((g) => g.palabras.test(p));
    if (grupo) return grupo.id;
  }
  if (ps.some((p) => NO_DESTILADO.test(p))) return null;
  return GRUPO_OTROS.id;
}

/** ¿Es la categoría de un destilado (incluido «otros»)? */
export const esDestilado = (categoria: string | null | undefined): boolean => grupoDeCategoria(categoria) !== null;

/**
 * Reparte las bebidas en grupos de destilados, en el orden de
 * `GRUPOS_DESTILADOS` y con «Otros destilados» al final. Dentro de cada grupo,
 * el orden de entrada (el del panel). Los grupos sin productos no salen.
 */
export function agruparDestilados<T extends { categoria?: string | null }>(bebidas: ReadonlyArray<T>): GrupoDestilado<T>[] {
  const porGrupo = new Map<string, T[]>();
  for (const bebida of bebidas) {
    const id = grupoDeCategoria(bebida.categoria);
    if (!id) continue;
    const lista = porGrupo.get(id);
    if (lista) lista.push(bebida);
    else porGrupo.set(id, [bebida]);
  }
  return [...GRUPOS_DESTILADOS, GRUPO_OTROS]
    .filter((g) => porGrupo.has(g.id))
    .map((g) => ({ id: g.id, titulo: g.titulo, familia: g.familia, items: porGrupo.get(g.id) ?? [] }));
}

/** ¿Lleva el ancla a la pestaña de destilados? (`#destilados`, el antiguo `#whiskies`, `#ginebras`…). */
export function esAnclaDestilados(ancla: string): boolean {
  const id = ancla.replace(/^#/, "").toLowerCase();
  return id === "destilados" || id === "whisky" || id === GRUPO_OTROS.id || GRUPOS_DESTILADOS.some((g) => g.id === id);
}

/**
 * Familias para la puerta de la portada: «Whisky», «Whisky y ginebra»,
 * «Whisky, ginebra y ron», y con más de tres «Whisky, ginebra, ron…».
 * Sin «otros». `null` si no hay ninguna.
 */
export function familiasDestilados(grupos: ReadonlyArray<{ id: string; familia: string }>): string | null {
  const familias = grupos.filter((g) => g.id !== GRUPO_OTROS.id).map((g) => g.familia);
  if (familias.length === 0) return null;
  let texto: string;
  if (familias.length > 3) texto = `${familias.slice(0, 3).join(", ")}…`;
  else if (familias.length === 1) texto = familias[0];
  else texto = `${familias.slice(0, -1).join(", ")} y ${familias[familias.length - 1]}`;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Pestaña de /carta con las bebidas de una categoría que no es destilado («Refrescos», «Aguas»…). */
export interface PestanaExtra<T> {
  /** Ancla: «Refrescos» → `refrescos`. */
  id: string;
  /** El nombre tal cual lo escribió el panel (la primera vez que aparece). */
  titulo: string;
  items: T[];
}

export interface BebidasRepartidas<T> {
  cervezas: T[];
  /** Copas de champagne o cava: no tienen pestaña, van en la «i» de su botella. */
  copas: T[];
  destilados: GrupoDestilado<T>[];
  /** El resto de categorías con productos, cada una en su pestaña, en orden de aparición. */
  otras: PestanaExtra<T>[];
}

const ES_CERVEZA = /^cervezas?$/;
const ES_COPA = /^copas?$/;
/** Lo que nunca sale en Touza aunque esté marcado (13/11/2026: los vinos, fuera). */
const NO_SALE = /^(tinto|tintos|vino|vinos|blanco|blancos|rosado|rosados|cava|cavas|champagne|champagnes|espumoso|espumosos)$/;

/**
 * Reparte TODAS las bebidas de Touza (una sola consulta) en lo que pinta
 * /carta: cervezas, copas, grupos de destilados y una pestaña por cada otra
 * categoría (refrescos, aguas…). Las filas sin categoría se descartan.
 */
export function repartirBebidas<T extends { categoria?: string | null }>(bebidas: ReadonlyArray<T>): BebidasRepartidas<T> {
  const cervezas: T[] = [];
  const copas: T[] = [];
  const otras = new Map<string, PestanaExtra<T>>();
  for (const bebida of bebidas) {
    const ps = palabras(bebida.categoria);
    if (ps.length === 0) continue;
    if (ES_CERVEZA.test(ps[0])) cervezas.push(bebida);
    else if (ES_COPA.test(ps[0])) copas.push(bebida);
    else if (esDestilado(bebida.categoria) || NO_SALE.test(ps[0])) continue;
    else {
      const id = ps.join("-");
      const pestana = otras.get(id);
      if (pestana) pestana.items.push(bebida);
      else otras.set(id, { id, titulo: (bebida.categoria ?? "").trim(), items: [bebida] });
    }
  }
  return { cervezas, copas, destilados: agruparDestilados(bebidas), otras: [...otras.values()] };
}

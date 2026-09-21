/**
 * Vocabulario ÚNICO de alérgenos de la carta.
 *
 * COPIADO Y ADAPTADO de `casa-tomas-story/src/lib/alergenos.ts` (misma
 * normalización, mismos sinónimos). Touza no tiene selector de idioma ni las
 * columnas `alergenos_en` / `alergenos_fr`, así que aquí se ha quitado el
 * tipado por `Language` y el bloque de filtros dietéticos
 * (`cumpleFiltroDietetico` y compañía), que tampoco tiene UI en esta web.
 *
 * ⚠️ HAY DOS COPIAS de este módulo, una por repo. Si cambia el vocabulario,
 * los sinónimos o el criterio de "no consta", hay que actualizar las DOS.
 *
 * Por qué existe: el mismo alérgeno llega escrito de tres maneras distintas y
 * hasta ahora cada componente lo interpretaba a su aire.
 *
 *  - El panel de administración (`adminpanelct`) guarda IDs en snake_case:
 *    `frutos_cascara`, `crustaceos`, `lacteos`.
 *  - En la base de datos hay filas antiguas con la etiqueta humana y acentos:
 *    `frutos de cáscara`, `crustáceos`, `lácteos`.
 *  - Y hay valores sueltos que no son alérgenos oficiales de la UE pero que el
 *    restaurante usa igualmente: `alcohol`, `carne`, `marisco`.
 *
 * Aquí se normaliza todo a una CLAVE canónica y se traduce a etiqueta legible.
 * Cualquier comparación de alérgenos del repositorio debe pasar por este
 * módulo: comparar cadenas con `includes()` es justo lo que hacía que un
 * alérgeno personalizado escrito como "sin gluten" excluyera el plato del
 * filtro de celiaquía.
 */

/** Los 14 alérgenos de declaración obligatoria (Reglamento UE 1169/2011). */
export const ALERGENOS_UE = [
  "gluten",
  "crustaceos",
  "huevo",
  "pescado",
  "cacahuetes",
  "soja",
  "lacteos",
  "frutos_cascara",
  "apio",
  "mostaza",
  "sesamo",
  "sulfitos",
  "altramuces",
  "moluscos",
] as const;

/** Valores que no son alérgenos oficiales pero sí están en la BD. */
export const ALERGENOS_EXTRA = ["alcohol", "carne", "marisco"] as const;

export type ClaveAlergeno = (typeof ALERGENOS_UE)[number] | (typeof ALERGENOS_EXTRA)[number];

/**
 * Minúsculas, sin acentos, sin guiones bajos y con los espacios colapsados.
 * `Frutos de cáscara` y `frutos_cascara` acaban en la misma forma comparable.
 */
export const normalizarTexto = (valor: string): string =>
  valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Formas conocidas → clave canónica.
 *
 * Se comparan ELEMENTOS COMPLETOS, nunca subcadenas: "sin gluten" no está en
 * esta tabla, así que se queda como token desconocido y NO cuenta como gluten.
 */
const SINONIMOS: Record<string, ClaveAlergeno> = {};
const registrar = (clave: ClaveAlergeno, ...formas: string[]) => {
  for (const forma of [clave, ...formas]) SINONIMOS[normalizarTexto(forma)] = clave;
};

registrar(
  "gluten",
  "cereales con gluten",
  "cereales que contienen gluten",
  "cereales",
  "trigo",
  "wheat",
  "cereals containing gluten",
  "cereals",
  "ble",
  "blé",
  "gluten (cereales)",
);
registrar("crustaceos", "crustáceos", "crustaceo", "crustaceans", "crustacea", "crustacés");
registrar("huevo", "huevos", "egg", "eggs", "oeuf", "oeufs", "œufs");
registrar("pescado", "pescados", "fish", "poisson", "poissons");
registrar("cacahuetes", "cacahuete", "peanut", "peanuts", "arachide", "arachides", "mani", "maní");
registrar("soja", "soya", "soy", "soybeans", "soybean");
registrar(
  "lacteos",
  "lácteos",
  "lacteo",
  "lácteo",
  "lactosa",
  "leche",
  "productos lacteos",
  "milk",
  "dairy",
  "lactose",
  "lait",
  "produits laitiers",
);
registrar(
  "frutos_cascara",
  "frutos de cascara",
  "frutos de cáscara",
  "frutos secos",
  "nueces",
  "nuts",
  "tree nuts",
  "fruits a coque",
  "fruits à coque",
);
registrar("apio", "celery", "celeri", "céleri");
registrar("mostaza", "mustard", "moutarde");
registrar(
  "sesamo",
  "sésamo",
  "semillas de sesamo",
  "granos de sesamo",
  "sesame",
  "sesame seeds",
  "graines de sesame",
);
registrar(
  "sulfitos",
  "sulfito",
  "sulfites",
  "sulphites",
  "dioxido de azufre",
  "anhidrido sulfuroso",
  "sulfur dioxide",
  "sulfur dioxide and sulphites",
  "dioxyde de soufre",
);
registrar("altramuces", "altramuz", "lupin", "lupins", "lupine");
registrar("moluscos", "molusco", "molluscs", "mollusks", "mollusques");
// Sin equivalencia oficial: "marisco" y "shellfish" no distinguen entre
// crustáceos y moluscos, así que se quedan en su propia clave en vez de
// asumir una de las dos.
registrar("marisco", "mariscos", "shellfish", "fruits de mer");
registrar("alcohol", "alcool");
registrar("carne", "meat", "viande");

/**
 * Etiquetas para mostrar (solo castellano: Touza no tiene selector de
 * idioma). Un token desconocido se capitaliza tal cual.
 */
const ETIQUETAS: Record<ClaveAlergeno, string> = {
  gluten: "Gluten",
  crustaceos: "Crustáceos",
  huevo: "Huevo",
  pescado: "Pescado",
  cacahuetes: "Cacahuetes",
  soja: "Soja",
  lacteos: "Lácteos",
  frutos_cascara: "Frutos de cáscara",
  apio: "Apio",
  mostaza: "Mostaza",
  sesamo: "Sésamo",
  sulfitos: "Sulfitos",
  altramuces: "Altramuces",
  moluscos: "Moluscos",
  alcohol: "Alcohol",
  carne: "Carne",
  marisco: "Marisco",
};

const capitalizar = (valor: string) => {
  const limpio = valor.trim();
  return limpio ? limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase() : "";
};

/**
 * Convierte lo que venga de la BD en una lista de cadenas.
 *
 * Acepta las tres formas que existen hoy:
 *  - array de PostgREST: `["gluten", "lacteos"]`
 *  - JSON serializado:   `'["gluten","lacteos"]'`
 *  - texto separado por comas: `"Gluten, Lácteos"`
 *
 * También tolera el literal de array de Postgres (`{gluten,lacteos}`) por si
 * alguna fila llega sin convertir.
 */
export const normalizeAlergenos = (valor: unknown): string[] => {
  if (Array.isArray(valor)) {
    return valor.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof valor === "string") {
    const limpio = valor.trim();
    if (!limpio) return [];

    try {
      const parsed = JSON.parse(limpio);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
    } catch {
      // No era JSON: se trata como lista separada por comas.
    }

    return limpio
      .replace(/^[{[]/, "")
      .replace(/[}\]]$/, "")
      .split(/[,;]/)
      .map((item) => item.replace(/^["']|["']$/g, "").trim())
      .filter(Boolean);
  }

  return [];
};

/** Clave canónica de un alérgeno suelto, o su forma normalizada si no se conoce. */
export const claveAlergeno = (valor: string): string => {
  const normalizado = normalizarTexto(valor);
  return SINONIMOS[normalizado] ?? normalizado;
};

/** Lista de claves canónicas, sin repetidos y en el orden en que llegaron. */
export const clavesAlergenos = (valor: unknown): string[] => [
  ...new Set(normalizeAlergenos(valor).map(claveAlergeno).filter(Boolean)),
];

/** Etiqueta legible de una clave (o de un valor crudo). */
export const etiquetaAlergeno = (valor: string): string => {
  const clave = claveAlergeno(valor);
  const conocida = ETIQUETAS[clave as ClaveAlergeno];
  return conocida ?? capitalizar(valor);
};

/** Los tres campos de alérgenos de una fila, ya reunidos. */
export interface DatosAlergenos {
  /** Declarados por el restaurante (`alergenos_oficiales`). */
  oficiales: string[];
  /** Deducidos de los ingredientes (`alergenos_inferidos`, si la tabla lo tiene). */
  inferidos: string[];
  /** Texto libre (`alergenos_notas`). Nunca certifica: solo puede advertir. */
  notas: string | null;
}

/** Cualquier fila de la carta (plato, cóctel) con sus campos de alérgenos. */
export interface FilaConAlergenos {
  alergenos_oficiales?: unknown;
  alergenos_inferidos?: unknown;
  alergenos_notas?: unknown;
}

/**
 * Reúne los alérgenos de una fila en las listas ya normalizadas.
 *
 * Todo pasa por `normalizeAlergenos`/`claveAlergeno` (vía `etiquetaAlergeno`
 * en quien consuma esto), así que da igual si la fila trae el array de
 * PostgREST, un JSON serializado o el literal `{a,b}` de Postgres.
 */
export function datosAlergenos(item: FilaConAlergenos): DatosAlergenos {
  const notas = item.alergenos_notas;

  return {
    oficiales: normalizeAlergenos(item.alergenos_oficiales),
    inferidos: normalizeAlergenos(item.alergenos_inferidos),
    notas: typeof notas === "string" && notas.trim() !== "" ? notas.trim() : null,
  };
}

/**
 * ¿Hay información de alérgenos utilizable por una máquina?
 *
 * SOLO cuentan las listas (`alergenos_oficiales` / `alergenos_inferidos`). Una
 * nota en texto libre no certifica nada: "Para los alérgenos consultar al
 * personal" es precisamente la ausencia del dato.
 */
export const tieneInformacionAlergenos = (datos: DatosAlergenos): boolean =>
  datos.oficiales.length > 0 || datos.inferidos.length > 0;

/**
 * Etiquetas legibles de una fila, oficiales + inferidos, sin repetidos.
 * Es el `Array.from(new Set(...))` que se repetía en cada componente que
 * pintaba alérgenos en `casa-tomas-story`; aquí se centraliza una vez.
 */
export const etiquetasAlergenos = (datos: DatosAlergenos): string[] =>
  Array.from(
    new Set(
      [...datos.oficiales, ...datos.inferidos].map((alergeno) => etiquetaAlergeno(alergeno)).filter(Boolean),
    ),
  );

/**
 * Aviso para las tarjetas de un producto del que no consta ningún alérgeno.
 *
 * No es "no tiene alérgenos": es que no consta el dato. Reglamento UE
 * 1169/2011 — la diferencia entre "no contiene" y "no consta" es la que
 * importa legalmente, así que nunca se rellena este hueco con una suposición.
 */
export const AVISO_SIN_ALERGENOS = "Sin información de alérgenos — consulte al personal";

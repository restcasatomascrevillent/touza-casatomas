/**
 * Precio por copa dentro de la «i» de cada botella (petición del dueño,
 * 21/11/2026): la pestaña «Por copas» desaparece de /carta y cada copa de
 * champagne o cava se enseña en la botella que la sirve.
 *
 * Las copas viven en Bebidas (categoría «Copas», p. ej. «Copa Champagne
 * Laurent-Perrier Rosé») y las botellas en Vinos («Laurent‑Perrier Rosé»):
 * no hay clave que las una, así que se casan por el nombre. Se quita
 * «Copa», «Champagne» o «Cava» del principio y se compara sin tildes ni
 * mayúsculas (y con el guion normal en vez del ‑ que usa el panel):
 *
 * 1. nombre idéntico;
 * 2. si no, la única botella cuyo nombre empieza por el de la copa
 *    («Millésime» → «Millésimé 2015»); si hay varias, no se adivina;
 * 3. `ALIAS`, para los casos que se han tenido que decidir a mano.
 *
 * Las copas sin botella se devuelven aparte (`sinBotella`) para poder
 * avisar: no se pintan en ningún sitio.
 */

/** Copa (ya normalizada, sin «Copa Champagne») → botella (normalizada). */
const ALIAS: Record<string, string> = {
  // La copa «de la casa» de Laurent-Perrier es su brut sin añada, La Cuvée.
  // Pendiente de que lo confirme el dueño (21/11/2026).
  "laurent-perrier": "laurent-perrier la cuvee",
};

export const normalizarNombre = (nombre: string): string =>
  nombre
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[‐-―]/g, "-")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const nombreDeCopa = (nombre: string): string =>
  normalizarNombre(nombre).replace(/^copa\s+/, "").replace(/^(champagne|cava)\s+/, "");

interface Copa {
  nombre: string | null;
  precio: string;
}

export interface CopasPorBotella {
  /** id de la botella → precio de su copa («13,50 €»). */
  precioPorBotella: Map<string, string>;
  /** Copas que no casan con ninguna botella de la carta. */
  sinBotella: string[];
}

export function copasPorBotella(
  copas: ReadonlyArray<Copa>,
  botellas: ReadonlyArray<{ id: string; name: string }>,
): CopasPorBotella {
  const normalizadas = botellas.map((b) => ({ id: b.id, nombre: normalizarNombre(b.name) }));
  const precioPorBotella = new Map<string, string>();
  const sinBotella: string[] = [];

  for (const copa of copas) {
    if (!copa.nombre || !copa.precio) continue;
    const buscada = nombreDeCopa(copa.nombre);
    const destino = ALIAS[buscada] ?? buscada;
    let botella = normalizadas.find((b) => b.nombre === destino);
    if (!botella) {
      const candidatas = normalizadas.filter((b) => b.nombre.startsWith(`${destino} `));
      if (candidatas.length === 1) botella = candidatas[0];
    }
    if (botella && !precioPorBotella.has(botella.id)) precioPorBotella.set(botella.id, copa.precio);
    else if (!botella) sinBotella.push(copa.nombre);
  }
  return { precioPorBotella, sinBotella };
}

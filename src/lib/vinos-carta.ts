/**
 * Agrupación de TODOS los vinos de Touza en las pestañas de la carta
 * (Espumosos, Blancos, Rosados, Tintos...) y sus filtros internos.
 *
 * Hasta el 10/11/2026 Carta.tsx tenía además dos pestañas fijas, "Champagne"
 * y "Cavas", que pedían las categorías antiguas CHAMPAGNES y CAVAS Y OTROS
 * ESPUMOSOS. Esas categorías ya no existen en la tabla (ahora son "VINOS
 * ESPUMOSOS — CHAMPAGNE", "— CAVA"...): las dos pestañas salían vacías y los
 * espumosos reales caían aquí, en "Espumosos". Ahora solo queda "Espumosos",
 * con su filtro Champagne / Cava / Otros (ver DENOMINACIONES_PRINCIPALES).
 *
 * La tabla Vinos no tiene una columna de "tipo" (tinto/blanco) separada: el
 * tipo y la denominación de origen viven juntos en `categoria`, como
 * "VINOS TINTOS — RIBERA DEL DUERO". Antes, Carta.tsx solo sabía pedir dos
 * categorías exactas (CHAMPAGNES y CAVAS Y OTROS ESPUMOSOS): cualquier otra
 * —los 131 tintos y blancos reales— no tenía pestaña donde caer y
 * desaparecía en silencio.
 *
 * `agruparVinosPorTipo` deriva las pestañas (tipo) y sus filtros internos
 * (denominación) de los valores reales de `categoria`, para que una
 * denominación nueva en el admin (o incluso un tipo nuevo, un rosado por
 * ejemplo) tenga siempre dónde aparecer sin tocar este archivo.
 */
import type { Vino } from "@/hooks/useVinos";
import { transformVinosToUI, type VinoUI } from "@/hooks/useVinos";

/** "VINOS TINTOS — RIBERA DEL DUERO": guion normal, en o em dash, con espacios opcionales alrededor. */
const SEPARADOR_DENOMINACION = /\s*[-–—]\s*/;

/** Conectores que van en minúscula salvo que abran la etiqueta ("Ribera del Duero", no "Ribera Del Duero"). */
const CONECTORES = new Set(["de", "del", "la", "las", "el", "los", "y", "en", "con", "a", "al"]);

/**
 * "RIBERA DEL DUERO" -> "Ribera del Duero". "OTRAS DENOMINACIONES" ->
 * "Otras Denominaciones". Mayúscula en cada palabra salvo conectores a mitad
 * de frase; respeta paréntesis ("ALBARIÑO (RÍAS BAIXAS)" -> "Albariño (Rías
 * Baixas)").
 */
export function capitalizarEtiqueta(texto: string): string {
  return texto
    .toLowerCase()
    .split(" ")
    .map((palabra, indice) => {
      if (!palabra) return palabra;
      const apertura = palabra.startsWith("(") ? "(" : "";
      const nucleo = apertura ? palabra.slice(1) : palabra;
      if (!nucleo) return palabra;
      if (indice > 0 && CONECTORES.has(nucleo)) return apertura + nucleo;
      // Elisión: "D'ASTI" -> "d'Asti", "L'EMPORDÀ" -> "l'Empordà".
      const elision = /^([dl])['’](.+)$/.exec(nucleo);
      if (indice > 0 && elision) return apertura + elision[1] + "'" + elision[2].charAt(0).toUpperCase() + elision[2].slice(1);
      return apertura + nucleo.charAt(0).toUpperCase() + nucleo.slice(1);
    })
    .join(" ");
}

/** Comparación por código (no `localeCompare`): igual en Node y en cualquier navegador. */
const compararTexto = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Slug estable para usar como id de pestaña/filtro y key de React. */
function idDesde(texto: string): string {
  return (
    texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "otros"
  );
}

/**
 * Orden de servicio habitual (de más ligero a más cuerpo): espumosos,
 * blancos, rosados y tintos. Cualquier tipo que no esté en esta lista (un
 * "VINOS ROSADOS" el día de mañana, o cualquier otra cosa) se añade al
 * final, ordenado por número de vinos, en vez de desaparecer.
 */
const ORDEN_TIPOS = ["VINOS ESPUMOSOS", "VINOS BLANCOS", "VINOS ROSADOS", "VINOS TINTOS"];

/**
 * Tipos cuyo filtro interno no enseña cada denominación suelta, sino unas
 * pocas fijas (en este orden) y un "Otros" con el resto. En espumosos el
 * dueño quiere Champagne / Cava / Otros: un filtro por cada crémant o
 * moscato con un solo vino no ayuda a elegir. En "Otros" cada vino lleva su
 * denominación debajo del nombre, para que no se pierda.
 */
const DENOMINACIONES_PRINCIPALES: Record<string, string[]> = {
  "VINOS ESPUMOSOS": ["CHAMPAGNE", "CAVA"],
};

export interface DenominacionVino {
  id: string;
  /** Valor real de `categoria`, tal cual está en la tabla. */
  categoria: string;
  etiqueta: string;
  vinos: VinoUI[];
}

export interface TipoVino {
  id: string;
  etiqueta: string;
  /** Todas las denominaciones concatenadas, ya en el orden de los filtros (para la opción "Todos"). */
  vinos: VinoUI[];
  denominaciones: DenominacionVino[];
}

export function agruparVinosPorTipo(vinos: Vino[]): TipoVino[] {
  const porTipo = new Map<string, Vino[]>();
  for (const vino of vinos) {
    if (!vino.categoria) continue;
    const tipo = vino.categoria.split(SEPARADOR_DENOMINACION)[0].trim();
    if (!tipo) continue;
    if (!porTipo.has(tipo)) porTipo.set(tipo, []);
    porTipo.get(tipo)!.push(vino);
  }

  const entradas = Array.from(porTipo.entries()).sort(([tipoA, vinosA], [tipoB, vinosB]) => {
    const iA = ORDEN_TIPOS.indexOf(tipoA.toUpperCase());
    const iB = ORDEN_TIPOS.indexOf(tipoB.toUpperCase());
    // Desempate por nombre: sin él, dos tipos con los mismos vinos quedaban
    // en el orden de llegada de las filas, que no es el mismo en la
    // instantánea del build (agrupada por categoría) que en el navegador.
    if (iA === -1 && iB === -1) return vinosB.length - vinosA.length || compararTexto(tipoA, tipoB);
    if (iA === -1) return 1;
    if (iB === -1) return -1;
    return iA - iB;
  });

  return entradas.map(([tipo, vinosDelTipo]) => {
    const principales = DENOMINACIONES_PRINCIPALES[tipo.toUpperCase()];
    if (principales) return agruparConPrincipales(tipo, vinosDelTipo, principales);
    const porDenominacion = new Map<string, Vino[]>();
    for (const vino of vinosDelTipo) {
      const partes = (vino.categoria as string).split(SEPARADOR_DENOMINACION);
      const denomCruda = partes.slice(1).join(" ").trim();
      if (!porDenominacion.has(denomCruda)) porDenominacion.set(denomCruda, []);
      porDenominacion.get(denomCruda)!.push(vino);
    }

    // Las denominaciones "normales" primero (más vinos primero), el cajón de
    // sastre "Otras denominaciones" siempre al final, sea cual sea su tamaño.
    const denominaciones: DenominacionVino[] = Array.from(porDenominacion.entries())
      .map(([denomCruda, vinosDeDenom]) => ({
        id: idDesde(denomCruda || tipo),
        categoria: vinosDeDenom[0].categoria as string,
        etiqueta: denomCruda ? capitalizarEtiqueta(denomCruda) : "Otros",
        vinos: transformVinosToUI(vinosDeDenom),
      }))
      .sort((a, b) => {
        const aOtras = /^otras\b/i.test(a.etiqueta);
        const bOtras = /^otras\b/i.test(b.etiqueta);
        if (aOtras !== bOtras) return aOtras ? 1 : -1;
        // Mismo desempate que los tipos: no depender del orden de llegada.
        return b.vinos.length - a.vinos.length || compararTexto(a.categoria, b.categoria);
      });

    return tipoVino(tipo, denominaciones);
  });
}

function tipoVino(tipo: string, denominaciones: DenominacionVino[]): TipoVino {
  const tipoSinPrefijo = tipo.replace(/^VINOS\s+/i, "").trim() || tipo;
  return {
    id: idDesde(tipoSinPrefijo),
    etiqueta: capitalizarEtiqueta(tipoSinPrefijo),
    vinos: denominaciones.flatMap((d) => d.vinos),
    denominaciones,
  };
}

/**
 * Filtros fijos (`principales`, en su orden) más "Otros" con el resto de
 * denominaciones; los filtros sin vinos no salen. Ver DENOMINACIONES_PRINCIPALES.
 */
function agruparConPrincipales(tipo: string, vinosDelTipo: Vino[], principales: string[]): TipoVino {
  const denominacionDe = (vino: Vino) =>
    (vino.categoria as string).split(SEPARADOR_DENOMINACION).slice(1).join(" ").trim();
  const grupos = new Map<string, Vino[]>(principales.map((p) => [p, []]));
  const otros: Vino[] = [];
  for (const vino of vinosDelTipo) {
    const denom = denominacionDe(vino).toUpperCase();
    const grupo = grupos.get(denom);
    if (grupo) grupo.push(vino);
    else otros.push(vino);
  }

  const denominaciones: DenominacionVino[] = principales
    .filter((p) => grupos.get(p)!.length > 0)
    .map((p) => {
      const vinos = grupos.get(p)!;
      return {
        id: idDesde(p),
        categoria: vinos[0].categoria as string,
        etiqueta: capitalizarEtiqueta(p),
        vinos: transformVinosToUI(vinos),
      };
    });

  if (otros.length > 0) {
    const ui = transformVinosToUI(otros);
    denominaciones.push({
      id: "otros",
      categoria: otros[0].categoria as string,
      etiqueta: "Otros",
      // Cada vino de "Otros" enseña su denominación ("Crémant de Loire").
      vinos: ui.map((vino, i) => {
        const denom = denominacionDe(otros[i]);
        return denom ? { ...vino, type: capitalizarEtiqueta(denom) } : vino;
      }),
    });
  }

  return tipoVino(tipo, denominaciones);
}

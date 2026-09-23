/**
 * Agrupación de vinos "resto" (todo lo que no es CHAMPAGNES ni CAVAS Y OTROS
 * ESPUMOSOS, que ya tienen su propia pestaña fija en Carta.tsx) para la
 * pestaña "Blancos" y "Tintos" de la carta de Touza.
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
      return apertura + nucleo.charAt(0).toUpperCase() + nucleo.slice(1);
    })
    .join(" ");
}

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
 * Orden de servicio habitual (de más ligero a más cuerpo): espumosos ya
 * tienen sus propias pestañas antes que esto, así que aquí solo hace falta
 * blanco antes que tinto. Cualquier tipo que no esté en esta lista (un
 * "VINOS ROSADOS" el día de mañana, o cualquier otra cosa) se añade al
 * final, ordenado por número de vinos, en vez de desaparecer.
 */
const ORDEN_TIPOS = ["VINOS BLANCOS", "VINOS ROSADOS", "VINOS TINTOS"];

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
    if (iA === -1 && iB === -1) return vinosB.length - vinosA.length;
    if (iA === -1) return 1;
    if (iB === -1) return -1;
    return iA - iB;
  });

  return entradas.map(([tipo, vinosDelTipo]) => {
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
        return b.vinos.length - a.vinos.length;
      });

    const tipoSinPrefijo = tipo.replace(/^VINOS\s+/i, "").trim() || tipo;

    return {
      id: idDesde(tipoSinPrefijo),
      etiqueta: capitalizarEtiqueta(tipoSinPrefijo),
      vinos: denominaciones.flatMap((d) => d.vinos),
      denominaciones,
    };
  });
}

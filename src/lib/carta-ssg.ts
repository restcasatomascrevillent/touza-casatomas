/**
 * Instantánea de la carta tomada en tiempo de build (ver
 * `scripts/carta-ssg-plugin.mjs`). Es lo que hace que `/carta` llegue al HTML
 * con productos de verdad en lugar de dos "Preparando…".
 *
 * - En `vite-react-ssg build` contiene los datos reales de Supabase.
 * - En dev y en los tests vale `null`: los hooks se comportan como siempre.
 *
 * Los hooks la usan como `initialData`, con `initialDataUpdatedAt` = momento
 * del build. Como `staleTime` son 5 minutos, cualquier despliegue con más de 5
 * minutos de vida se considera obsoleto y React Query refresca en segundo
 * plano al montar: el HTML conserva el contenido indexable y el visitante ve
 * los precios actuales.
 */
import instantanea from "virtual:touza/carta";
import type { Coctel } from "@/hooks/useCocteles";
import type { Vino } from "@/hooks/useVinos";
import type { Bebida } from "@/hooks/useBebidas";
import type { PlatoTouza } from "@/hooks/usePlatos";

export interface CartaSSG {
  generadoEn: string;
  cocteles: Coctel[];
  vinos: Record<string, Vino[]>;
  bebidas: Record<string, Bebida[]>;
  platos: PlatoTouza[];
  /**
   * Ajustes del panel leídos en build (`configuracion_web`). Opcional: una
   * instantánea sin él vale lo de siempre (fotos visibles).
   */
  config?: { mostrarFotosPlatos: boolean };
}

export const CARTA_SSG = instantanea as CartaSSG | null;

/** Epoch del build; `undefined` fuera del build para no falsear la frescura. */
export const GENERADO_EN = CARTA_SSG ? Date.parse(CARTA_SSG.generadoEn) : undefined;

/**
 * Opciones de React Query que siembran una consulta con la instantánea.
 * Devuelve `{}` cuando no hay instantánea, de modo que `initialData` queda
 * `undefined` y `isLoading` sigue siendo `true` como antes.
 */
/**
 * Interruptor «Fotos de platos en Touza» tal y como estaba al construir.
 * Falla abierto: solo un `false` explícito las oculta. Fuera del build (sin
 * instantánea), `true`.
 */
export const MOSTRAR_FOTOS_PLATOS_BUILD = CARTA_SSG?.config?.mostrarFotosPlatos !== false;

/**
 * Platos para el JSON-LD (`Menu` de schema.org): con las fotos apagadas, sin
 * `imagen_url`. Los datos estructurados deben describir lo que la página
 * enseña; anunciar una foto que el dueño ha quitado sería marcar contenido
 * que no está a la vista.
 */
export function platosParaJsonLd<T extends { imagen_url: string | null }>(
  platos: T[],
  mostrarFotos: boolean = MOSTRAR_FOTOS_PLATOS_BUILD,
): T[] {
  return mostrarFotos ? platos : platos.map((plato) => ({ ...plato, imagen_url: null }));
}

export function semilla<T>(filas: T[] | undefined) {
  if (!filas) return {};
  return { initialData: filas, initialDataUpdatedAt: GENERADO_EN };
}

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
}

export const CARTA_SSG = instantanea as CartaSSG | null;

/** Epoch del build; `undefined` fuera del build para no falsear la frescura. */
export const GENERADO_EN = CARTA_SSG ? Date.parse(CARTA_SSG.generadoEn) : undefined;

/**
 * Opciones de React Query que siembran una consulta con la instantánea.
 * Devuelve `{}` cuando no hay instantánea, de modo que `initialData` queda
 * `undefined` y `isLoading` sigue siendo `true` como antes.
 */
export function semilla<T>(filas: T[] | undefined) {
  if (!filas) return {};
  return { initialData: filas, initialDataUpdatedAt: GENERADO_EN };
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CARTA_SSG, semilla } from '@/lib/carta-ssg';
import { COLUMNAS_BEBIDAS } from '@/lib/carta-consultas.mjs';
import { fotoPropia } from '@/lib/carta';
import { formatearPrecio } from '@/lib/precio';

export interface Bebida {
  id: string;
  nombre: string | null;
  descripcion: string | null;
  precio_eur: number | null;
  imagen_url?: string | null;
  categoria: string | null;
  tipo: string | null;
  tag: string | null;
  featured: boolean | null;
  orden: number | null;
  tamano: string | null;
}

export interface BebidaUI {
  id: string;
  name: string;
  price: string;
  featured: boolean;
  type?: string;
  tag?: string;
  size?: string;
  /** Foto de la botella (Storage, 3:5). Sin foto, la fila va sin imagen. */
  image?: string;
  description?: string;
  /** Categoría del panel («Whiskies», «Ginebras»…): para agrupar los destilados. */
  categoria?: string;
}

export const useBebidas = (categoria: string, soloTouza: boolean = true) => {
  return useQuery({
    queryKey: ['bebidas', categoria, soloTouza],
    queryFn: async () => {
      let query = supabase
        .from('Bebidas')
        .select(COLUMNAS_BEBIDAS)
        .eq('categoria', categoria)
        .eq('activado', true)
        .order('orden', { ascending: true })
        .order('id', { ascending: true });

      if (soloTouza) {
        query = query.eq('touza', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading drinks:', error);
        throw new Error('No se pudieron cargar las bebidas. Por favor, intenta de nuevo.');
      }

      return data as unknown as Bebida[];
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutos
    // La instantánea trae todas las bebidas de Touza en el mismo orden que
    // esta consulta: filtrar conserva el orden y el HTML no salta al hidratar.
    ...semilla(soloTouza ? bebidasTouzaSSG()?.filter((b) => b.categoria === categoria) : undefined),
  });
};

/** Bebidas de Touza de la instantánea del build (`undefined` fuera del build). */
const bebidasTouzaSSG = (): Bebida[] | undefined => CARTA_SSG?.bebidasTouza;

/**
 * TODAS las bebidas de Touza (activado y touza) en una sola consulta: /carta
 * y la portada reparten en el navegador cervezas, copas y destilados (ver
 * src/lib/destilados.ts). Así una categoría nueva del panel («Ginebras»,
 * «Rones»…) aparece sin tocar la web. Mismo filtro y orden que el build
 * (scripts/carta-ssg-plugin.mjs).
 */
export const useBebidasTouza = () => {
  return useQuery({
    queryKey: ['bebidas', 'touza'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Bebidas')
        .select(COLUMNAS_BEBIDAS)
        .eq('activado', true)
        .eq('touza', true)
        .order('orden', { ascending: true })
        .order('id', { ascending: true });

      if (error) {
        console.error('Error loading drinks:', error);
        throw new Error('No se pudieron cargar las bebidas. Por favor, intenta de nuevo.');
      }

      return data as unknown as Bebida[];
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    ...semilla(bebidasTouzaSSG()),
  });
};

export const transformBebidasToUI = (bebidas: Bebida[] | undefined): BebidaUI[] => {
  if (!bebidas) return [];
  return bebidas.map((bebida) => ({
    id: bebida.id,
    name: bebida.nombre || '',
    price: formatearPrecio(bebida.precio_eur),
    featured: bebida.featured || false,
    type: bebida.tipo || undefined,
    tag: bebida.tag || undefined,
    size: bebida.tamano || undefined,
    image: fotoPropia(bebida.imagen_url) || undefined,
    description: bebida.descripcion || undefined,
    categoria: bebida.categoria || undefined,
  }));
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Bebida {
  id: string;
  nombre: string | null;
  descripcion: string | null;
  precio_eur: number | null;
  categoria: string | null;
  tipo: string | null;
  tag: string | null;
  featured: boolean | null;
  touza: boolean | null;
  restaurante: boolean | null;
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
}

export const useBebidas = (categoria: string, soloTouza: boolean = true) => {
  return useQuery({
    queryKey: ['bebidas', categoria, soloTouza],
    queryFn: async () => {
      let query = supabase
        .from('Bebidas')
        .select('*')
        .eq('categoria', categoria)
        .eq('activado', true)
        .order('orden', { ascending: true });

      if (soloTouza) {
        query = query.eq('touza', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading drinks:', error);
        throw new Error('No se pudieron cargar las bebidas. Por favor, intenta de nuevo.');
      }

      return data as Bebida[];
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const transformBebidasToUI = (bebidas: Bebida[] | undefined): BebidaUI[] => {
  if (!bebidas) return [];
  return bebidas.map((bebida) => ({
    id: bebida.id,
    name: bebida.nombre || '',
    price: bebida.precio_eur ? `${bebida.precio_eur.toFixed(2).replace('.', ',')}€` : '',
    featured: bebida.featured || false,
    type: bebida.tipo || undefined,
    tag: bebida.tag || undefined,
    size: bebida.tamano || undefined,
  }));
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Vino {
  id: string;
  nombre: string | null;
  descripcion: string | null;
  precio_eur: number | null;
  categoria: string | null;
  ubicacion_region: string | null;
  ubicacion_pais: string | null;
  denominacion_origen: string | null;
  featured: boolean | null;
  touza: boolean | null;
  restaurante: boolean | null;
  orden: string | null;
}

export interface VinoUI {
  id: string;
  name: string;
  price: string;
  featured: boolean;
  region?: string;
  country?: string;
  denomination?: string;
}

export const useVinos = (categoria: string, soloTouza: boolean = true) => {
  return useQuery({
    queryKey: ['vinos', categoria, soloTouza],
    queryFn: async () => {
      let query = supabase
        .from('Vinos')
        .select('*')
        .eq('categoria', categoria)
        .eq('activado', true)
        .order('orden', { ascending: true });

      if (soloTouza) {
        query = query.eq('touza', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading wines:', error);
        throw new Error('No se pudieron cargar los vinos. Por favor, intenta de nuevo.');
      }

      return data as Vino[];
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const transformVinosToUI = (vinos: Vino[] | undefined): VinoUI[] => {
  if (!vinos) return [];
  return vinos.map((vino) => ({
    id: vino.id,
    name: vino.nombre || '',
    price: vino.precio_eur ? `${vino.precio_eur.toFixed(2).replace('.', ',')}€` : '',
    featured: vino.featured || false,
    region: vino.ubicacion_region || undefined,
    country: vino.ubicacion_pais || undefined,
    denomination: vino.denominacion_origen || undefined,
  }));
};

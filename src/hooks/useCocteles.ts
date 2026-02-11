import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Coctel {
  id: string;
  nombre: string | null;
  descripcion: string | null;
  precio_eur: number | null;
  imagen_url: string | null;
  categoria: string | null;
  base: string | null;
  ingredientes: string | null;
  orden: number | null;
}

export interface CoctelUI {
  id: string;
  name: string;
  category: string;
  base: string;
  price: string;
  description: string;
  ingredients: string[];
  image: string;
}

export const useCocteles = (soloTouza: boolean = true) => {
  return useQuery({
    queryKey: ['cocteles', soloTouza],
    queryFn: async () => {
      let query = supabase
        .from('Cocteles')
        .select('*')
        .eq('activado', true)
        .order('orden', { ascending: true });

      if (soloTouza) {
        query = query.eq('touza', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading cocktails:', error);
        throw new Error('No se pudieron cargar los cócteles. Por favor, intenta de nuevo.');
      }

      return data as Coctel[];
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Transforma los datos de Supabase al formato usado en el UI
export const transformCoctelesToUI = (cocteles: Coctel[] | undefined): CoctelUI[] => {
  if (!cocteles) return [];

  return cocteles.map(c => ({
    id: c.id,
    name: c.nombre || '',
    category: c.categoria || 'autor',
    base: c.base || 'all',
    price: c.precio_eur ? `${c.precio_eur.toFixed(2).replace('.', ',')}€` : '',
    description: c.descripcion || '',
    ingredients: c.ingredientes?.split(', ') || [],
    image: c.imagen_url || '',
  }));
};

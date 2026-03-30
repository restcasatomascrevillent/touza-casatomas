import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlatoTouza {
  id: string;
  nombre: string | null;
  descripcion: string | null;
  precio_eur: number | null;
  imagen_url: string | null;
  categoria: string | null;
  alergenos_oficiales: any;
}

export interface PlatoTouzaUI {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  categoria: string;
}

export const usePlatosTouza = () => {
  return useQuery({
    queryKey: ['platos-touza'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Platos')
        .select('id, nombre, descripcion, precio_eur, imagen_url, categoria, alergenos_oficiales')
        .eq('activado', true)
        .eq('touza', true)
        .order('orden', { ascending: true });

      if (error) {
        console.error('Error loading tapas:', error);
        throw new Error('No se pudieron cargar las tapas. Por favor, intenta de nuevo.');
      }

      return data as unknown as PlatoTouza[];
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  });
};

export const transformPlatosToUI = (platos: PlatoTouza[] | undefined): PlatoTouzaUI[] => {
  if (!platos) return [];

  return platos.map(p => ({
    id: p.id,
    name: p.nombre || '',
    description: p.descripcion || '',
    price: p.precio_eur ? `${p.precio_eur.toFixed(2).replace('.', ',')}€` : '',
    image: p.imagen_url || '/placeholder.svg',
    categoria: p.categoria || '',
  }));
};

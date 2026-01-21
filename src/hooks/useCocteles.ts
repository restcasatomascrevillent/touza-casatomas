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

export const useCocteles = () => {
  return useQuery({
    queryKey: ['cocteles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Cocteles')
        .select('*')
        .eq('activado', true)
        .order('orden', { ascending: true });
      
      if (error) throw error;
      return data as Coctel[];
    },
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

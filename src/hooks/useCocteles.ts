import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CARTA_SSG, semilla } from '@/lib/carta-ssg';
import { COLUMNAS_COCTELES } from '@/lib/carta-consultas.mjs';
import { datosAlergenos, etiquetasAlergenos } from '@/lib/alergenos';
import { FOTO_COCTEL_SIN_FOTO, fotoPropia } from '@/lib/carta';
import { formatearPrecio } from '@/lib/precio';

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
  alergenos_oficiales: unknown;
  alergenos_notas: string | null;
}

export interface CoctelUI {
  id: string;
  name: string;
  category: string;
  base: string;
  price: string;
  description: string;
  ingredients: string[];
  /** Foto propia del cóctel o, si no la tiene (o es de un banco), la de la «T» del local. */
  image: string;
  /** true cuando `image` es la foto genérica de la «T», no la del cóctel. */
  fotoGenerica?: boolean;
  /** Etiquetas legibles ("Gluten", "Sulfitos"...). [] si no consta el dato. */
  alergenos: string[];
  /** Texto libre de `alergenos_notas`, o null si no hay. Nunca certifica. */
  alergenosNota: string | null;
}

export const useCocteles = (soloTouza: boolean = true) => {
  return useQuery({
    queryKey: ['cocteles', soloTouza],
    queryFn: async () => {
      let query = supabase
        .from('Cocteles')
        .select(COLUMNAS_COCTELES)
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

      return data as unknown as Coctel[];
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutos
    // Instantánea del build: el HTML prerenderizado ya sale con los cócteles.
    ...semilla(soloTouza ? CARTA_SSG?.cocteles : undefined),
  });
};

// Transforma los datos de Supabase al formato usado en el UI
export const transformCoctelesToUI = (cocteles: Coctel[] | undefined): CoctelUI[] => {
  if (!cocteles) return [];

  return cocteles.map(c => {
    // Mismo vocabulario que `casa-tomas-story` (@/lib/alergenos): "frutos_cascara"
    // del panel y "frutos de cáscara" de la BD son el mismo alérgeno.
    const datos = datosAlergenos(c);
    const propia = fotoPropia(c.imagen_url);
    return {
      id: c.id,
      name: c.nombre || '',
      category: c.categoria || 'autor',
      base: c.base || 'all',
      price: formatearPrecio(c.precio_eur),
      description: c.descripcion || '',
      ingredients: c.ingredientes?.split(', ') || [],
      // Nunca una foto de banco (Unsplash): sin foto propia, el cóctel lleva
      // la foto de la «T» del local (pedido del 15/11/2026).
      image: propia || FOTO_COCTEL_SIN_FOTO,
      fotoGenerica: !propia,
      alergenos: etiquetasAlergenos(datos),
      alergenosNota: datos.notas,
    };
  });
};

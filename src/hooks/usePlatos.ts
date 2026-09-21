import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CARTA_SSG, semilla } from '@/lib/carta-ssg';
import { datosAlergenos, etiquetasAlergenos } from '@/lib/alergenos';

export interface PlatoTouza {
  id: string;
  nombre: string | null;
  descripcion: string | null;
  precio_eur: number | null;
  imagen_url: string | null;
  categoria: string | null;
  alergenos_oficiales: any;
  alergenos_notas: string | null;
}

export interface PlatoTouzaUI {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  categoria: string;
  /** Etiquetas legibles ("Gluten", "Lácteos"...). [] si no consta el dato. */
  alergenos: string[];
  /** Texto libre de `alergenos_notas`, o null si no hay. Nunca certifica. */
  alergenosNota: string | null;
}

/**
 * Tapas del bar.
 *
 * ⚠️ HOY DEVUELVE SIEMPRE 0 FILAS, y no es un fallo de este hook.
 *
 * La tabla `Platos` tiene dos banderas de pertenencia, `restaurante` y
 * `touza`, y en las 128 filas existentes `touza` vale `false` (comprobado
 * contra el proyecto `jeamoczmbfsnwkfjxcyo`: `Platos?activado=eq.true` → 128,
 * `Platos?activado=eq.true&touza=eq.true` → 0). El filtro `.eq('touza', true)`
 * de abajo es correcto — lo que falta es marcar en la base qué platos se
 * sirven en el bar, y eso es decisión del dueño, no del código.
 *
 * Consecuencia visible: la sección "Tapea con tu Cóctel" de `/carta` no se
 * pinta. Eso es deliberado — `Carta.tsx` la condiciona a
 * `(loadingPlatos || tapasData.length > 0)`, así que con la instantánea de
 * build (`initialData: []`) ni aparece vacía ni se queda en un "Preparando…"
 * perpetuo, que es lo que pasaba antes de prerenderizar: en el HTML estático
 * `loadingPlatos` era siempre `true`.
 *
 * En cuanto se ponga `touza = true` en las filas que toquen, la sección
 * aparece sola en el siguiente despliegue: no hay que tocar nada más.
 */
export const usePlatosTouza = () => {
  return useQuery({
    queryKey: ['platos-touza'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Platos')
        .select('id, nombre, descripcion, precio_eur, imagen_url, categoria, alergenos_oficiales, alergenos_notas')
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
    // Instantánea del build (hoy, lista vacía). Ver el bloque de arriba.
    ...semilla(CARTA_SSG?.platos),
  });
};

export const transformPlatosToUI = (platos: PlatoTouza[] | undefined): PlatoTouzaUI[] => {
  if (!platos) return [];

  return platos.map(p => {
    // Mismo vocabulario que `casa-tomas-story` (@/lib/alergenos): "frutos_cascara"
    // del panel y "frutos de cáscara" de la BD son el mismo alérgeno.
    const datos = datosAlergenos(p);
    return {
      id: p.id,
      name: p.nombre || '',
      description: p.descripcion || '',
      price: p.precio_eur ? `${p.precio_eur.toFixed(2).replace('.', ',')}€` : '',
      image: p.imagen_url || '/placeholder.svg',
      categoria: p.categoria || '',
      alergenos: etiquetasAlergenos(datos),
      alergenosNota: datos.notas,
    };
  });
};

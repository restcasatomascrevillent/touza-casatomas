import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CARTA_SSG, semilla } from '@/lib/carta-ssg';

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
    // Solo hay instantánea de las categorías que pinta /carta.
    ...semilla(soloTouza ? CARTA_SSG?.vinos[categoria] : undefined),
  });
};

/**
 * Trae TODOS los vinos touza+activado cuya `categoria` NO esté en
 * `excluidas` (Carta.tsx la usa para excluir CHAMPAGNES y CAVAS Y OTROS
 * ESPUMOSOS, que ya tienen su propia pestaña fija vía `useVinos`).
 *
 * Existe porque `categoria` en Vinos mezcla tipo y denominación de origen
 * ("VINOS TINTOS — RIBERA DEL DUERO") y esa lista de denominaciones cambia
 * con la carta: pedir cada categoría a mano (como hacía Carta.tsx antes)
 * significa que una denominación nueva en el admin no tiene pestaña donde
 * caer y desaparece en silencio — justo el bug que arregla este hook. Al
 * traer todo de una vez, `agruparVinosPorTipo` (src/lib/vinos-carta.ts)
 * deriva las pestañas y sus filtros de lo que haya de verdad en la tabla.
 *
 * Ordena por categoría y luego por `orden` para que, incluso antes de
 * agrupar, las filas de una misma categoría ya lleguen juntas y en su orden
 * manual.
 *
 * Sin instantánea de build: `CATEGORIAS_VINOS` en
 * `scripts/carta-ssg-plugin.mjs` solo trae CHAMPAGNES y CAVAS Y OTROS
 * ESPUMOSOS (son las únicas categorías que pintaba /carta cuando se escribió
 * ese plugin), así que esta consulta no tiene con qué sembrarse y arranca
 * con `isLoading=true` como cualquier dato no precargado — igual que en dev.
 */
export const useVinosRestantes = (excluidas: string[], soloTouza: boolean = true) => {
  return useQuery({
    queryKey: ['vinos', 'restantes', excluidas, soloTouza],
    queryFn: async () => {
      let query = supabase
        .from('Vinos')
        .select('*')
        .eq('activado', true)
        .order('categoria', { ascending: true })
        .order('orden', { ascending: true });

      if (soloTouza) {
        query = query.eq('touza', true);
      }

      if (excluidas.length > 0) {
        query = query.not('categoria', 'in', `(${excluidas.map((c) => `"${c}"`).join(',')})`);
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

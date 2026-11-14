import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CARTA_SSG, semilla } from '@/lib/carta-ssg';
import { COLUMNAS_VINOS, ordenarVinos } from '@/lib/carta-consultas.mjs';

export interface Vino {
  id: string;
  nombre: string | null;
  descripcion: string | null;
  precio_eur: number | null;
  imagen_url?: string | null;
  categoria: string | null;
  ubicacion_region: string | null;
  ubicacion_pais: string | null;
  denominacion_origen: string | null;
  featured: boolean | null;
  /** TEXTO en la tabla ("0" en casi todas las filas): ver `ordenarVinos`. */
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
  /** Foto de la botella (Storage, 3:5). Sin foto, la fila va sin imagen. */
  image?: string;
  description?: string;
}

export const useVinos = (categoria: string, soloTouza: boolean = true) => {
  return useQuery({
    queryKey: ['vinos', categoria, soloTouza],
    queryFn: async () => {
      let query = supabase
        .from('Vinos')
        .select(COLUMNAS_VINOS)
        .eq('categoria', categoria)
        .eq('activado', true)
        // Desempate estable en la base de datos; el orden definitivo (con
        // `orden` como número) lo pone ordenarVinos, igual que en el build.
        .order('orden', { ascending: true, nullsFirst: false })
        .order('nombre', { ascending: true })
        .order('id', { ascending: true });

      if (soloTouza) {
        query = query.eq('touza', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading wines:', error);
        throw new Error('No se pudieron cargar los vinos. Por favor, intenta de nuevo.');
      }

      return ordenarVinos(data as unknown as Vino[]);
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
 * Devuelve las filas en el orden de `ordenarVinos` (orden numérico → nombre
 * → id), el mismo que la instantánea del build: al agrupar por categoría
 * cada denominación conserva ese orden.
 *
 * Sin `initialData` propio: la instantánea del build guarda los vinos por
 * categoría y Carta.tsx cubre el primer render con ella (`vinosRestoSSG`)
 * hasta que esta consulta resuelve.
 */
export const useVinosRestantes = (excluidas: string[], soloTouza: boolean = true) => {
  return useQuery({
    queryKey: ['vinos', 'restantes', excluidas, soloTouza],
    queryFn: async () => {
      let query = supabase
        .from('Vinos')
        .select(COLUMNAS_VINOS)
        .eq('activado', true)
        .order('categoria', { ascending: true })
        .order('orden', { ascending: true, nullsFirst: false })
        .order('nombre', { ascending: true })
        .order('id', { ascending: true });

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

      return ordenarVinos(data as unknown as Vino[]);
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Prefijo de las categorías de espumosos en Vinos («VINOS ESPUMOSOS —
 * CHAMPAGNE», «— CAVA», «— CRÉMANT DE LOIRE», «— MOSCATO D’ASTI»…). Desde
 * noviembre de 2026 son los ÚNICOS vinos de Touza: los tintos, blancos y
 * rosados salen de su carta (decisión del dueño, 13/11/2026).
 */
export const PREFIJO_ESPUMOSOS = 'VINOS ESPUMOSOS';
export const esChampagne = (categoria: string | null) => /CHAMPAGNE\s*$/i.test(categoria ?? '');

/** Espumosos de la instantánea del build, en el orden de `ordenarVinos`. */
const espumososSSG = (): Vino[] | undefined => {
  if (!CARTA_SSG) return undefined;
  return ordenarVinos(
    Object.entries(CARTA_SSG.vinos)
      .filter(([categoria]) => categoria.startsWith(PREFIJO_ESPUMOSOS))
      .flatMap(([, vinos]) => vinos as Vino[])
  );
};

/** Todos los espumosos touza+activado; Carta.tsx los reparte en Champagne y Cavas. */
export const useEspumosos = () => {
  return useQuery({
    queryKey: ['vinos', 'espumosos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Vinos')
        .select(COLUMNAS_VINOS)
        .like('categoria', `${PREFIJO_ESPUMOSOS}%`)
        .eq('activado', true)
        .eq('touza', true)
        .order('orden', { ascending: true, nullsFirst: false })
        .order('nombre', { ascending: true })
        .order('id', { ascending: true });

      if (error) {
        console.error('Error loading wines:', error);
        throw new Error('No se pudieron cargar los vinos. Por favor, intenta de nuevo.');
      }

      return ordenarVinos(data as unknown as Vino[]);
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    ...semilla(espumososSSG()),
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
    image: vino.imagen_url || undefined,
    description: vino.descripcion || undefined,
  }));
};

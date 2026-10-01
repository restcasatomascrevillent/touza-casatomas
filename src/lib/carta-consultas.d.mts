/** Tipos de `carta-consultas.mjs` (columnas y orden compartidos por los hooks y el build). */

export declare const COLUMNAS_COCTELES: string;
export declare const COLUMNAS_VINOS: string;
export declare const COLUMNAS_BEBIDAS: string;
export declare const ORDEN_VINOS_POSTGREST: string;

interface VinoOrdenable {
  id: string | number;
  nombre: string | null;
  orden: string | number | null;
}

export declare function compararVinos(a: VinoOrdenable, b: VinoOrdenable): number;
export declare function ordenarVinos<T extends VinoOrdenable>(vinos: readonly T[]): T[];

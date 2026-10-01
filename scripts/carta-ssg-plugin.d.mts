import type { Plugin } from "vite";

/** Plugin de Vite que expone la carta de Supabase en `virtual:touza/carta`. */
export declare function cartaSSG(): Plugin;

/** Lee `configuracion_web.mostrar_fotos_platos_touza`; ante cualquier fallo, `true`. */
export declare function leerMostrarFotosPlatos(base: string, key: string): Promise<boolean>;

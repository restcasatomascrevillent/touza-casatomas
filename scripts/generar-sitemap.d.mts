/** Dominio de producción, el que lleva escrito `public/llms.txt`. */
export declare const URL_PRODUCCION: string;
/** Ficheros de los que sale cada página (para su `lastmod`). */
export declare const FUENTES: Record<string, string[]>;
/** Rutas que no van al sitemap (404 y textos legales). */
export declare const EXCLUIDAS: Set<string>;
/** Fecha AAAA-MM-DD del último commit que tocó `rutas`, o `null` si no se sabe con certeza. */
export declare function fechaGit(rutas: string[], cwd?: string): string | null;
/**
 * Escribe `sitemap.xml` y `robots.txt` dentro de `dir` usando `siteUrl`, y pone
 * esa URL base en `llms.txt`. `fechaDe` da el `lastmod` de cada página.
 */
export declare function generarSitemapYRobots(
  dir: string,
  siteUrl: string,
  opciones?: { fechaDe?: (rutas: string[]) => string | null },
): Promise<void>;

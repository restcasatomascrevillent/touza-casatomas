/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/**
 * Instantánea de la carta inyectada en build por `scripts/carta-ssg-plugin.mjs`.
 * Vale `null` fuera del build (dev y tests). Se consume tipada desde
 * `src/lib/carta-ssg.ts`.
 */
declare module "virtual:touza/carta" {
  const carta: unknown;
  export default carta;
}

interface ImportMetaEnv {
  /** URL base pública del sitio. Sin ella se usa el fallback de src/lib/site.ts. */
  readonly VITE_SITE_URL?: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

-- ===========================================================================
-- ##                                                                       ##
-- ##       NO APLICADA: la aplica una persona, a mano (ver CÓMO SE APLICA) ##
-- ##                                                                       ##
-- ##   Correcciones de DATOS que ve la web de Touza. Solo UPDATE de        ##
-- ##   `public."Cocteles".imagen_url`. No toca esquema, RLS ni permisos.   ##
-- ##                                                                       ##
-- ===========================================================================
--
-- Diagnóstico del 01/10/2026 (proyecto jeamoczmbfsnwkfjxcyo, rol anon, por la
-- API REST con la clave publicable del .env, que respeta la RLS):
--
--   Cocteles  activado+touza  -> 200, 12 filas  OK
--   Vinos     activado+touza  -> 200, 184 filas OK (también el `not.in` de
--                                 useVinosRestantes con categorías con «—»)
--   Bebidas   Cervezas/Copas/Whiskies -> 200    OK
--   Platos    activado+touza  -> 200, 0 filas   (ningún plato tiene touza=true:
--                                 decisión del dueño, no es un error)
--   configuracion_web         -> 404 PGRST205   <- ERROR: la tabla no existe.
--       La crea adminpanelct/supabase/migrations/20261001113700_configuracion_web_fotos_platos.sql,
--       que está commiteada pero SIN APLICAR. NO se duplica aquí: aplicar esa
--       migración (sus propios pasos en la cabecera) quita el 404. Mientras
--       tanto, la web falla abierta (fotos de platos visibles) pero cada
--       visita a /carta deja 2 peticiones 404 en la consola/red (1 + 1 retry).
--
-- RLS y permisos de las tablas que lee la web: correctos para lecturas
-- públicas (RLS activa; política SELECT a public con `activado = true`; anon
-- solo tiene SELECT/REFERENCES/TRIGGER). No hace falta ningún arreglo de RLS
-- o grants para que la web funcione, así que este fichero no los toca.
--
-- Cocteles solo se pinta en Touza (las 12 filas tienen restaurante = false y
-- casa-tomas-story no consulta esta tabla): estos cambios no afectan a Casa
-- Tomás.
--
-- Con imagen_url = NULL la web enseña el relleno de marca «TOUZA»
-- (OptimizedImage, commit de este mismo diagnóstico) y el JSON-LD `Menu` deja
-- de anunciar la imagen (src/lib/negocio.ts omite `image` si es NULL). El
-- HTML prerenderizado y el JSON-LD se actualizan en el siguiente deploy; la
-- tarjeta, al recargar (React Query vuelve a pedir los cócteles).
--
-- CÓMO SE APLICA (desde adminpanelct/, que es el repo enlazado con
-- `supabase link`; este repo no lo está). NO con `db push` ni `migration repair`.
--   1. Revisar y, si se quiere, descomentar la PARTE 2 (decisión humana).
--   2. npx supabase db query --linked -f ../touza-restaurant-website/supabase/migrations/20261001_touza_correcciones_datos.sql
--   3. Ejecutar las consultas de VERIFICACIÓN del final.
-- Cada UPDATE lleva en el WHERE el valor anterior exacto: si alguien ya ha
-- subido una foto real desde el panel, ese UPDATE no hace nada (0 filas).
-- ===========================================================================

begin;

set local lock_timeout = '5s';

-- ---------------------------------------------------------------------------
-- PARTE 1 — URL ROTA (se aplica)
-- ---------------------------------------------------------------------------
-- Clover Club: Unsplash responde 404 (comprobado con curl el 01/10/2026). Hoy
-- la tarjeta y el JSON-LD `Menu` de /carta apuntan a una imagen que no existe.
--   antes: 'https://images.unsplash.com/photo-1527761939622-9119094290d4?w=500&h=600&fit=crop'
update public."Cocteles"
   set imagen_url = null,
       updated_at = now()
 where id = 'clover-club'
   and imagen_url = 'https://images.unsplash.com/photo-1527761939622-9119094290d4?w=500&h=600&fit=crop';

-- ---------------------------------------------------------------------------
-- PARTE 2 — FOTO DE STOCK QUE NO CORRESPONDE AL CÓCTEL (aprobada por el dueño el 01/10/2026: relleno TOUZA para ver qué fotos faltan)
-- ---------------------------------------------------------------------------
-- Todas las fotos de la tabla son de stock (Unsplash) y cargan (200). Estas
-- además enseñan OTRA bebida. Quitarlas cambia una foto bonita pero falsa por
-- el relleno de marca: es decisión del dueño, por eso va comentado. Lo ideal
-- es sustituirlas por fotos reales (docs/fotos-necesarias.md), no vaciarlas.
--
-- Pornstar Martini: enseña un vaso bajo de whisky con hielo grande (old
-- fashioned), no una copa de martini con maracuyá y el chupito de cava.
--   antes: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&h=600&fit=crop'
update public."Cocteles" set imagen_url = null, updated_at = now()
 where id = 'pornstar-martini'
   and imagen_url = 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&h=600&fit=crop';
--
-- Green Dream (kiwi + manzana verde): enseña un cóctel morado de moras con
-- naranja deshidratada.
--   antes: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&h=600&fit=crop'
update public."Cocteles" set imagen_url = null, updated_at = now()
 where id = 'green-dream'
   and imagen_url = 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&h=600&fit=crop';
--
-- Piña Colada: enseña una copa de martini naranja con hierbabuena (una piña
-- colada es cremosa y blanca, en vaso alto o hurricane).
--   antes: 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=500&h=600&fit=crop'
update public."Cocteles" set imagen_url = null, updated_at = now()
 where id = 'pina-colada'
   and imagen_url = 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=500&h=600&fit=crop';
--
-- Colada Virgen: enseña tres copas de martini (roja y verdes) sobre fondo
-- amarillo; nada que ver con una colada.
--   antes: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=600&fit=crop'
update public."Cocteles" set imagen_url = null, updated_at = now()
 where id = 'colada-virgen'
   and imagen_url = 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=600&fit=crop';
--
-- Spicy Mango Margarita: enseña una margarita ROJA (de fresa), no de mango.
--   antes: 'https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=500&h=600&fit=crop'
update public."Cocteles" set imagen_url = null, updated_at = now()
 where id = 'spicy-mango-margarita'
   and imagen_url = 'https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=500&h=600&fit=crop';
--
-- Ipanema: enseña vasos altos de fresa; la Ipanema es una caipirinha sin
-- alcohol (lima, azúcar moreno, ginger ale/maracuyá).
--   antes: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&h=600&fit=crop'
update public."Cocteles" set imagen_url = null, updated_at = now()
 where id = 'ipanema'
   and imagen_url = 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&h=600&fit=crop';
--
-- (Beso Escarlata —foto ámbar para un cóctel «escarlata»— tiene touza = false
-- y no se ve en ninguna web: no se toca.)

commit;

-- ===========================================================================
-- VERIFICACIÓN tras aplicar
-- ===========================================================================
--   select id, nombre, imagen_url, updated_at from public."Cocteles"
--    where touza and activado order by orden;
--   -- -> clover-club con imagen_url NULL (y los de la PARTE 2 si se aplicó).
--
--   Lo mismo que lee la web (anon), desde fuera:
--   curl "$VITE_SUPABASE_URL/rest/v1/Cocteles?select=id,imagen_url&id=eq.clover-club" \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
--   -- -> [{"id":"clover-club","imagen_url":null}]
--
-- ===========================================================================
-- ROLLBACK (deja las URL como estaban el 01/10/2026). Ejecutar solo las
-- líneas de lo que se haya aplicado.
-- ===========================================================================
-- begin;
-- update public."Cocteles" set imagen_url = 'https://images.unsplash.com/photo-1527761939622-9119094290d4?w=500&h=600&fit=crop', updated_at = now() where id = 'clover-club'           and imagen_url is null;
-- update public."Cocteles" set imagen_url = 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&h=600&fit=crop', updated_at = now() where id = 'pornstar-martini'      and imagen_url is null;
-- update public."Cocteles" set imagen_url = 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&h=600&fit=crop', updated_at = now() where id = 'green-dream'           and imagen_url is null;
-- update public."Cocteles" set imagen_url = 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=500&h=600&fit=crop', updated_at = now() where id = 'pina-colada'           and imagen_url is null;
-- update public."Cocteles" set imagen_url = 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=600&fit=crop',  updated_at = now() where id = 'colada-virgen'         and imagen_url is null;
-- update public."Cocteles" set imagen_url = 'https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=500&h=600&fit=crop',  updated_at = now() where id = 'spicy-mango-margarita' and imagen_url is null;
-- update public."Cocteles" set imagen_url = 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&h=600&fit=crop', updated_at = now() where id = 'ipanema'               and imagen_url is null;
-- commit;
-- (El rollback de clover-club devuelve una URL que da 404: solo tiene sentido
-- para deshacer exactamente este fichero.)

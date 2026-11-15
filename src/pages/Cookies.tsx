import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import LegalLayout, { TablaLegal } from "@/components/legal/LegalLayout";
import ConfigurarCookies from "@/components/legal/ConfigurarCookies";
import { canonical } from "@/lib/site";
import { CLAVE_CONSENTIMIENTO } from "@/lib/consentimiento";
import { RUTAS_LEGALES, TITULAR } from "@/lib/legal";

// Inventario revisado en el código el 01/10/2026:
//  · localStorage `touza_cookie_consent` (src/lib/consentimiento.ts).
//  · Caché del service worker de la PWA (vite.config.ts: `touza-assets`,
//    `touza-pages` y el precache de Workbox).
//  · Google Maps (iframe de /contacto): solo si el visitante pide el mapa
//    interactivo y lo acepta en ese momento (no hay aviso global).
//  · Vercel Web Analytics: sin cookies ni almacenamiento local.
//  · Supabase: la web solo lee la carta, sin iniciar sesión, así que no
//    guarda nada en el navegador.
//  · Lenis (scroll suave) y framer-motion: no guardan nada.
// Si se añade cualquier otra cookie o script de terceros, actualizar esta
// tabla ANTES de publicarlo (y, si necesita permiso, pedirlo donde se use).

const enlaceExterno = (href: string, texto: string) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {texto}
  </a>
);

const Cookies = () => (
  <>
    <Seo
      title="Política de cookies"
      description="Qué cookies y qué almacenamiento local usa la web de Touza Cocktail Bar, para qué sirven y cómo cambiar tu elección."
      canonical={canonical(RUTAS_LEGALES.cookies)}
      keywords={[]}
    />
    <LegalLayout
      titulo="Política de cookies"
      entradilla="Esta web casi no usa cookies: no tiene publicidad ni analítica con cookies. Aquí tienes la lista completa de lo que guarda en tu navegador y cómo cambiar tu elección cuando quieras."
    >
      <h2 id="tu-eleccion">1. Tu elección</h2>
      <p>
        Las únicas cookies que necesitan tu permiso son las del mapa interactivo de Google de la página «Cómo llegar».
        Por defecto esa página enseña un mapa estático, alojado en esta web y sin cookies; el de Google solo se carga si
        lo pides allí y lo aceptas. Puedes cambiar de opinión aquí en cualquier momento.
      </p>
      <ConfigurarCookies />

      <h2 id="que-son">2. Qué son las cookies</h2>
      <p>
        Son pequeños archivos que una web guarda en tu navegador para recordar algo entre una página y otra o entre
        visitas. Otras tecnologías parecidas, como el almacenamiento local del navegador (<em>localStorage</em>) o la
        caché de un <em>service worker</em>, cumplen la misma función y la ley las trata igual (art. 22.2 LSSI-CE).
      </p>

      <h2 id="propias">3. Lo que guarda esta web (propio y técnico)</h2>
      <p>
        Son imprescindibles para que la web funcione como pides y no requieren consentimiento. No se usan para
        identificarte ni se comparten con nadie.
      </p>
      <TablaLegal
        titulo="Almacenamiento propio"
        cabeceras={["Nombre", "Tipo", "Para qué", "Duración"]}
        filas={[
          [
            <code key="c">{CLAVE_CONSENTIMIENTO}</code>,
            "Almacenamiento local",
            "Recuerda si aceptaste o rechazaste las cookies del mapa, para no preguntarte en cada visita.",
            "Hasta que borres los datos del navegador o cambies tu elección en esta página.",
          ],
          [
            "touza-assets, touza-pages y caché de Workbox",
            "Caché del service worker",
            "Guarda copias de las páginas, estilos e imágenes que ya has visto para que la web cargue más rápido y se pueda ver sin conexión.",
            "Las imágenes y scripts, hasta 30 días; las páginas se renuevan en cada visita con conexión.",
          ],
        ]}
      />

      <h2 id="terceros">4. Cookies de terceros (solo con tu permiso)</h2>
      <TablaLegal
        titulo="Cookies de terceros"
        cabeceras={["Servicio", "Cuándo", "Para qué", "Más información"]}
        filas={[
          [
            "Google Maps (Google Ireland Ltd.)",
            "Solo si pides el mapa interactivo en la página «Cómo llegar» y lo aceptas.",
            "Mostrar el mapa interactivo. Google instala sus propias cookies (por ejemplo NID, AEC o SOCS) en el dominio google.com; su número, finalidad y duración —de meses en algunos casos— los decide Google, y pueden incluir fines de seguridad, preferencias o publicidad.",
            enlaceExterno("https://policies.google.com/technologies/cookies?hl=es", "Cookies de Google"),
          ],
        ]}
      />
      <p>
        Si no lo permites, ves el mapa estático y un enlace para abrir la dirección directamente en Google Maps. Nada más
        de la web cambia.
      </p>

      <h2 id="sin-cookies">5. Lo que no usa cookies</h2>
      <ul>
        <li>
          <strong>Estadísticas de visitas (Vercel Web Analytics)</strong>: cuentan las visitas sin cookies ni
          almacenamiento en tu navegador y sin guardar tu dirección IP. Más detalles en la{" "}
          <Link to={RUTAS_LEGALES.privacidad}>política de privacidad</Link>.
        </li>
        <li>
          <strong>Tipografías (Google Fonts)</strong>: se descargan de servidores de Google, que reciben tu dirección
          IP, pero no instalan cookies. El mapa estático de «Cómo llegar» está alojado en esta web (datos de
          OpenStreetMap).
        </li>
      </ul>

      <h2 id="navegador">6. Cómo borrarlas o bloquearlas desde el navegador</h2>
      <p>
        También puedes borrar o bloquear las cookies y los datos de sitios web desde la configuración de tu navegador:
      </p>
      <ul>
        <li>{enlaceExterno("https://support.google.com/chrome/answer/95647?hl=es", "Google Chrome")}</li>
        <li>{enlaceExterno("https://support.apple.com/es-es/105082", "Safari (iPhone, iPad y Mac)")}</li>
        <li>
          {enlaceExterno(
            "https://support.mozilla.org/es/kb/Borrar%20cookies",
            "Mozilla Firefox",
          )}
        </li>
        <li>
          {enlaceExterno(
            "https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
            "Microsoft Edge",
          )}
        </li>
      </ul>

      <h2 id="contacto">7. Contacto</h2>
      <p>
        Si tienes dudas sobre esta política, escríbenos a <a href={`mailto:${TITULAR.email}`}>{TITULAR.email}</a>. El
        responsable es {TITULAR.denominacion}; tienes sus datos completos en el{" "}
        <Link to={RUTAS_LEGALES.avisoLegal}>aviso legal</Link>.
      </p>
    </LegalLayout>
  </>
);

export default Cookies;

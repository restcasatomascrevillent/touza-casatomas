/**
 * Datos estructurados de Touza (schema.org).
 *
 * Único sitio donde se declara el negocio: antes el JSON-LD estaba duplicado
 * en `IndexDesktop.tsx` e `IndexMobile.tsx` y ya habían divergido (la variante
 * móvil había perdido `openingHoursSpecification`). Como `useIsMobile()`
 * devuelve `false` en Node, el SSG solo prerenderiza la versión de escritorio,
 * así que esa divergencia se notaba únicamente al hidratar en un móvil.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * PENDIENTE DE CONFIRMAR POR EL DUEÑO — no se inventa nada aquí:
 *
 *  · Teléfono y horarios: son los que ya publica la propia web
 *    (`VisitUs.tsx`, `Contacto.tsx`, `Footer.tsx`), pero nadie los ha
 *    verificado — `PLAN-TESTEO-MASIVO.md:98` los marca como "⚠️ Verificar".
 *    Google usa el JSON-LD para el "Abierto ahora" de la ficha local, así que
 *    si están mal, están mal en el sitio donde más se nota.
 *  · Coordenadas: aproximadas. Deben salir de la ficha de Google Business.
 *  · Redes sociales (`sameAs`): las URLs que ya enlaza el pie. Sin comprobar.
 *
 * NO se incluye a propósito:
 *  · `hasMap` / Place ID: Touza no tiene ficha verificada. El Place ID que
 *    hay en `config_google_places` es de otro negocio (el restaurante, en otra
 *    dirección y con otro teléfono). Un `hasMap` equivocado manda al cliente
 *    al local que no es.
 *  · `aggregateRating`: el 4,8 de `config_google_places` está sembrado a mano
 *    en una migración. Publicar una valoración inventada es motivo de acción
 *    manual de Google por spam de datos estructurados.
 * ────────────────────────────────────────────────────────────────────────────
 */
import { SITE_URL, canonical, absoluta } from "@/lib/site";
import { IMAGENES } from "@/assets/imagenes";

export const NEGOCIO = {
  nombre: "Touza Cocktail Bar",
  calle: "C/ San Vicente, 14",
  localidad: "Crevillente",
  region: "Alicante",
  cp: "03330",
  pais: "ES",
  telefono: "+34966782000",
  email: "info@touzabar.es",
  lat: 38.2493699,
  lng: -0.8111399,
  redes: ["https://www.instagram.com/touzabar/", "https://www.facebook.com/touzabar/"],
  /** Mismo horario que muestra la web en VisitUs.tsx y Contacto.tsx. */
  horarios: [
    { dias: ["Thursday", "Friday", "Saturday"], abre: "20:00", cierra: "02:00" },
    { dias: ["Sunday"], abre: "18:00", cierra: "00:00" },
  ],
} as const;

/**
 * Teléfono de Touza tal y como se muestra y se marca. OJO: el 966 10 78 87
 * es el de Restaurante Casa Tomás, no el del bar (confirmado por el dueño,
 * 01/10/2026).
 */
export const TELEFONO = {
  texto: "966 782 000",
  href: `tel:${NEGOCIO.telefono}`,
} as const;

/** Dirección para Google Maps, la misma que usa la página de Contacto. */
export const DIRECCION_MAPS = `${NEGOCIO.calle}, ${NEGOCIO.cp} ${NEGOCIO.localidad}, ${NEGOCIO.region}`;

/** "Cómo llegar": abre Google Maps con la ruta hasta el bar desde donde esté el visitante. */
export const URL_COMO_LLEGAR = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DIRECCION_MAPS)}`;

/** `@id` estable para que Menu y Bar queden enlazados en el mismo grafo. */
export const ID_NEGOCIO = `${SITE_URL}/#bar`;

export function barSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "@id": ID_NEGOCIO,
    name: NEGOCIO.nombre,
    image: absoluta(IMAGENES.interior.src),
    telephone: NEGOCIO.telefono,
    email: NEGOCIO.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: NEGOCIO.calle,
      addressLocality: NEGOCIO.localidad,
      addressRegion: NEGOCIO.region,
      postalCode: NEGOCIO.cp,
      addressCountry: NEGOCIO.pais,
    },
    geo: { "@type": "GeoCoordinates", latitude: NEGOCIO.lat, longitude: NEGOCIO.lng },
    url: canonical("/"),
    sameAs: [...NEGOCIO.redes],
    // Touza no acepta reservas por la web (decisión del dueño, 01/10/2026):
    // nada de URL de reserva ni de ReserveAction. Se llama o se viene.
    acceptsReservations: false,
    hasMenu: canonical("/carta"),
    servesCuisine: ["Cócteles", "Tapas"],
    // "€€", nunca "$$": react-helmet pasa el contenido por String.replace() y
    // "$$" es la secuencia de escape de "$" → en dist salía "priceRange":"$".
    priceRange: "€€",
    currenciesAccepted: "EUR",
    openingHoursSpecification: NEGOCIO.horarios.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...h.dias],
      opens: h.abre,
      closes: h.cierra,
    })),
  };
}

interface ItemCarta {
  nombre: string | null;
  descripcion?: string | null;
  precio_eur?: number | null;
  imagen_url?: string | null;
  ingredientes?: string | null;
}

interface SeccionCarta {
  nombre: string;
  items: ItemCarta[];
}

/**
 * `Menu` con todos los productos de la carta. Es lo que permite que los
 * champagnes, cavas, cervezas, copas y whiskies —que en pantalla viven tras
 * una pestaña y por tanto no están en el HTML inicial— sí lleguen al HTML de
 * forma legible por buscadores y por asistentes de IA.
 */
export function menuSchema(secciones: SeccionCarta[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${canonical("/carta")}#menu`,
    name: `Carta de ${NEGOCIO.nombre}`,
    url: canonical("/carta"),
    inLanguage: "es-ES",
    provider: { "@id": ID_NEGOCIO },
    hasMenuSection: secciones
      .filter((s) => s.items.length > 0)
      .map((s) => ({
        "@type": "MenuSection",
        name: s.nombre,
        numberOfItems: s.items.length,
        hasMenuItem: s.items.map((i) => {
          // Para un cóctel, los ingredientes son la descripción útil: es lo
          // que buscan tanto Google como quien le pregunta a un asistente.
          const descripcion = i.descripcion || i.ingredientes || null;
          return {
          "@type": "MenuItem",
          name: i.nombre ?? "",
          ...(descripcion ? { description: descripcion } : {}),
          ...(i.imagen_url ? { image: i.imagen_url } : {}),
          ...(typeof i.precio_eur === "number"
            ? {
                offers: {
                  "@type": "Offer",
                  price: i.precio_eur.toFixed(2),
                  priceCurrency: "EUR",
                  availability: "https://schema.org/InStock",
                },
              }
            : {}),
          };
        }),
      })),
  };
}

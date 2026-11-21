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
 *  · Teléfono: el que ya publicaba la web, sin verificar
 *    (`PLAN-TESTEO-MASIVO.md:98` lo marca como "⚠️ Verificar").
 *  · Horario: desde el 15/11/2026 es el de la ficha de Google (jueves
 *    16–01, viernes 15:30–02, sábado 15–02, domingo 15–20), pendiente de
 *    que el dueño lo confirme.
 *    Google usa el JSON-LD para el "Abierto ahora" de la ficha local, así que
 *    si están mal, están mal en el sitio donde más se nota.
 *  · Redes sociales (`sameAs`): las URLs que ya enlaza el pie. Sin comprobar.
 *
 * Dirección confirmada por el dueño el 21/10/2026: C/ Santa María de la
 * Cabeza, 4 (Casa Tomás está en el n.º 2). La web decía "C/ San Vicente, 14",
 * que contradecía a la ficha de Google, BuenaCarta y los directorios.
 * Coordenadas y `hasMap`: las del pin de la ficha de Google "TOUZA CLUB"
 * (sin reclamar a 21/10/2026; CID 1982489405729160298). Ojo: el Place ID de
 * `config_google_places` es del restaurante, no de Touza.
 *
 * NO se incluye a propósito:
 *  · `aggregateRating`: el 4,8 de `config_google_places` está sembrado a mano
 *    en una migración. Publicar una valoración inventada es motivo de acción
 *    manual de Google por spam de datos estructurados.
 * ────────────────────────────────────────────────────────────────────────────
 */
import { SITE_URL, canonical, absoluta } from "@/lib/site";
import { IMAGENES } from "@/assets/imagenes";

export const NEGOCIO = {
  nombre: "Touza Cocktail Bar",
  calle: "C/ Santa María de la Cabeza, 4",
  localidad: "Crevillente",
  region: "Alicante",
  cp: "03330",
  pais: "ES",
  telefono: "+34966782000",
  email: "info@touzabar.es",
  lat: 38.2457972,
  lng: -0.8103167,
  /** Ficha de Google Maps "TOUZA CLUB" (por CID, estable aunque cambie el nombre). */
  mapa: "https://maps.google.com/?cid=1982489405729160298",
  redes: ["https://www.instagram.com/touzabar/", "https://www.facebook.com/touzabar/"],
  /** El de la ficha de Google, por indicación del 15/11/2026. Antes: J–S 20:00–02:00 y D 18:00–00:00. */
  horarios: [
    { dias: ["Thursday"], abre: "16:00", cierra: "01:00" },
    { dias: ["Friday"], abre: "15:30", cierra: "02:00" },
    { dias: ["Saturday"], abre: "15:00", cierra: "02:00" },
    { dias: ["Sunday"], abre: "15:00", cierra: "20:00" },
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

/** La calle sin el número: «C/ Santa María de la Cabeza». */
export const VIA = NEGOCIO.calle.replace(/,\s*\d+\s*$/, "");

/** Dirección para Google Maps, la misma que usa la página de Contacto. */
export const DIRECCION_MAPS = `${NEGOCIO.calle}, ${NEGOCIO.cp} ${NEGOCIO.localidad}, ${NEGOCIO.region}`;

/** "Cómo llegar": abre Google Maps con la ruta hasta el bar desde donde esté el visitante. */
export const URL_COMO_LLEGAR = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DIRECCION_MAPS)}`;

/** `@id` estable para que Menu y Bar queden enlazados en el mismo grafo. */
export const ID_NEGOCIO = `${SITE_URL}/#bar`;

/**
 * Restaurante Casa Tomás: Touza forma parte de él y está en la puerta de al
 * lado (Casa Tomás en el n.º 2, Touza en el n.º 4; dirección confirmada por el
 * dueño el 21/10/2026). Lo usan el JSON-LD (`parentOrganization`), /llms.txt
 * y /despues-de-cenar.
 */
export const CASA_TOMAS = {
  nombre: "Restaurante Casa Tomás",
  /**
   * Nombre y `@id` del nodo `Restaurant` de la web de Casa Tomás
   * (web-casatomas/src/lib/negocio.ts): con los mismos, Google une el
   * `parentOrganization` de Touza a esa entidad (revisión SEO del 21/11/2026).
   */
  nombreSchema: "Casa Tomás Restaurante",
  id: "https://restaurantecasatomascrevillente.es/#restaurante",
  calle: "C/ Santa María de la Cabeza, 2",
  url: "https://restaurantecasatomascrevillente.es/",
} as const;

const DIA_ES: Record<string, string> = {
  Monday: "lunes",
  Tuesday: "martes",
  Wednesday: "miércoles",
  Thursday: "jueves",
  Friday: "viernes",
  Saturday: "sábado",
  Sunday: "domingo",
};

/** ["Thursday","Friday","Saturday"] → «jueves a sábado»; ["Sunday"] → «domingo». */
const diasLegibles = (dias: readonly string[]): string => {
  const nombres = dias.map((d) => DIA_ES[d] ?? d);
  if (nombres.length === 1) return nombres[0];
  if (nombres.length >= 3) return `${nombres[0]} a ${nombres[nombres.length - 1]}`;
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
};

/**
 * Horario por tramos, sacado de `NEGOCIO.horarios` (el mismo del JSON-LD):
 * `[{ dias: "Jueves a sábado", horas: "20:00 – 02:00" }, …]`.
 */
export const HORARIO = NEGOCIO.horarios.map((h) => {
  const dias = diasLegibles(h.dias);
  return { dias: dias.charAt(0).toUpperCase() + dias.slice(1), horas: `${h.abre} – ${h.cierra}` };
});

/** «El jueves, de 16:00 a 01:00; el viernes, de 15:30 a 02:00; …» */
export const HORARIO_EN_FRASE =
  NEGOCIO.horarios
    .map((h, i) => {
      const dias = diasLegibles(h.dias);
      const tramo = `${h.dias.length > 1 ? "de" : "el"} ${dias}, de ${h.abre} a ${h.cierra}`;
      return i === 0 ? tramo.charAt(0).toUpperCase() + tramo.slice(1) : tramo;
    })
    .join("; ") + ".";

/**
 * Descripción del bar para el JSON-LD: los hechos que antes vivían en las
 * preguntas frecuentes de /contacto (sin reservas, hay sin alcohol, relación
 * con Casa Tomás), en una frase que un asistente pueda citar tal cual.
 */
export const DESCRIPCION_NEGOCIO =
  `Coctelería y bar de copas en Crevillent (Alicante), en la ${NEGOCIO.calle}, ` +
  `la puerta de al lado del ${CASA_TOMAS.nombre}, del que forma parte: se puede cenar en Casa Tomás y tomar la copa en Touza. ` +
  "Cócteles de autor y clásicos, cócteles y cervezas sin alcohol, champagne, cava y whisky. " +
  "No se reserva: se viene directamente.";

export function barSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "@id": ID_NEGOCIO,
    name: NEGOCIO.nombre,
    description: DESCRIPCION_NEGOCIO,
    image: absoluta(IMAGENES.interior.src),
    // Cuadrado, en public/ (URL estable, sin hash): la «T» retroiluminada.
    logo: absoluta("/logo-touza.png"),
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
    hasMap: NEGOCIO.mapa,
    url: canonical("/"),
    sameAs: [...NEGOCIO.redes],
    // Touza no acepta reservas por la web (decisión del dueño, 01/10/2026):
    // nada de URL de reserva ni de ReserveAction. Se llama o se viene.
    acceptsReservations: false,
    hasMenu: canonical("/carta"),
    // Une la entidad Touza con Casa Tomás (auditoría SEO/GEO del 15/11/2026,
    // hallazgo 1): sin esto, para Google y los asistentes son dos negocios
    // sueltos que comparten calle.
    parentOrganization: {
      "@type": "Restaurant",
      "@id": CASA_TOMAS.id,
      name: CASA_TOMAS.nombreSchema,
      alternateName: CASA_TOMAS.nombre,
      url: CASA_TOMAS.url,
      address: {
        "@type": "PostalAddress",
        streetAddress: CASA_TOMAS.calle,
        addressLocality: NEGOCIO.localidad,
        addressRegion: NEGOCIO.region,
        postalCode: NEGOCIO.cp,
        addressCountry: NEGOCIO.pais,
      },
    },
    // Bar de copas: sin "Tapas" (la carta de Touza no tiene platos).
    servesCuisine: ["Cócteles", "Coctelería", "Copas", "Champagne", "Cava"],
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

/** Fotos de banco de imágenes que no son del local. */
export function esFotoDeBanco(url: string): boolean {
  try {
    return /(^|\.)unsplash\.com$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** "Cruz Campo Gran Reserva" y "Cruzcampo Gran Reserva" son el mismo producto. */
const claveProducto = (nombre: string | null) =>
  (nombre ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]/gi, "").toLowerCase();

/** Quita productos repetidos dentro de una sección (se queda con el primero). */
export function sinDuplicados<T extends { nombre: string | null }>(items: T[]): T[] {
  const vistos = new Set<string>();
  return items.filter((item) => {
    const clave = claveProducto(item.nombre);
    if (!clave || vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
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
      .map((s) => ({ ...s, items: sinDuplicados(s.items) }))
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
          // Las fotos de banco (Unsplash) no son de Touza: fuera del JSON-LD.
          ...(i.imagen_url && !esFotoDeBanco(i.imagen_url) ? { image: i.imagen_url } : {}),
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

/**
 * `WebPage` de una página temática (p. ej. /despues-de-cenar), con `about`
 * apuntando al bar (`/#bar`, el `@id` del JSON-LD de la portada).
 */
export function paginaSchema({ ruta, nombre, descripcion }: { ruta: string; nombre: string; descripcion: string }): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical(ruta)}#pagina`,
    url: canonical(ruta),
    name: nombre,
    description: descripcion,
    inLanguage: "es-ES",
    about: { "@type": "BarOrPub", "@id": ID_NEGOCIO, name: NEGOCIO.nombre },
    mentions: { "@type": "Restaurant", name: CASA_TOMAS.nombre, url: CASA_TOMAS.url },
  };
}

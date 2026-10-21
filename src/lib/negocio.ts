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
    hasMap: NEGOCIO.mapa,
    url: canonical("/"),
    sameAs: [...NEGOCIO.redes],
    // Touza no acepta reservas por la web (decisión del dueño, 01/10/2026):
    // nada de URL de reserva ni de ReserveAction. Se llama o se viene.
    acceptsReservations: false,
    hasMenu: canonical("/carta"),
    // Bar de copas: sin "Tapas" (la carta de Touza no tiene platos).
    servesCuisine: ["Cócteles", "Coctelería", "Copas", "Champagne", "Vinos"],
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
 * Preguntas frecuentes (visibles en /contacto y como FAQPage en su JSON-LD).
 * Solo con datos ya confirmados: SIN horario (está pendiente del dueño).
 */
export const PREGUNTAS_FRECUENTES: { pregunta: string; respuesta: string; idioma?: "en" }[] = [
  {
    pregunta: "¿Hay que reservar para ir a Touza?",
    respuesta: "No. En Touza no se reserva: ven directamente.",
  },
  {
    pregunta: "¿Dónde está Touza?",
    respuesta: `En la ${NEGOCIO.calle}, ${NEGOCIO.cp} ${NEGOCIO.localidad} (Crevillent), al lado del Restaurante Casa Tomás.`,
  },
  {
    pregunta: "¿Tenéis cócteles sin alcohol?",
    respuesta: "Sí. En la carta hay una sección de cócteles sin alcohol, y también cervezas sin alcohol.",
  },
  {
    pregunta: "¿Qué relación tiene Touza con Casa Tomás?",
    respuesta:
      "Touza forma parte del grupo de Restaurante Casa Tomás y está en la puerta de al lado: puedes cenar en Casa Tomás y tomar la copa en Touza.",
  },
  {
    pregunta: "Is there a cocktail bar in Crevillent?",
    respuesta: `Yes. Touza is a cocktail bar at ${NEGOCIO.calle}, Crevillent, next door to Casa Tomás restaurant. No reservations: just walk in.`,
    idioma: "en",
  },
];

export function faqSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonical("/contacto")}#faq`,
    mainEntity: PREGUNTAS_FRECUENTES.map((p) => ({
      "@type": "Question",
      name: p.pregunta,
      ...(p.idioma ? { inLanguage: p.idioma } : {}),
      acceptedAnswer: { "@type": "Answer", text: p.respuesta },
    })),
  };
}

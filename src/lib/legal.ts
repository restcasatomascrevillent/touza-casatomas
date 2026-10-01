/**
 * Datos del titular de la web para los textos legales (LSSI-CE, RGPD/LOPDGDD
 * y cookies). Único sitio donde se declaran: los leen /aviso-legal,
 * /privacidad, /cookies y el aviso básico bajo el formulario de El Reservado.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * DE DÓNDE SALE CADA DATO (consultado el 01/10/2026) — no se inventa nada:
 *
 *  · Denominación social, CIF, domicilio y teléfono: aviso legal publicado en
 *    https://restaurantecasatomascrevillente.es/aviso-legal/ (la web antigua,
 *    WordPress). Esa misma web publica Touza como una sección suya
 *    (/touza/), bajo ese mismo aviso legal, así que el titular es el mismo.
 *    ⚠️ El dueño debe CONFIRMAR que Touza la explota MASIDE 2011 SL y no otra
 *    sociedad.
 *  · Forma jurídica: el aviso legal dice "MASIDE 2011 SL"; la política de
 *    privacidad de la misma web dice "MASIDE 2011 SLU". Se usa "SL" (el aviso
 *    legal es el documento identificativo). ⚠️ Confirmar.
 *  · Email: el que esa política de privacidad da como contacto del
 *    responsable. NO se usa info@touzabar.es: el dominio touzabar.es no existe
 *    (NXDOMAIN, comprobado el 01/10/2026), así que esa dirección no puede
 *    recibir correo y no sirve para ejercer derechos.
 *  · Datos del Registro Mercantil: no aparecen en ninguna fuente → marcador
 *    visible. Obligatorios para una sociedad (art. 10.1.b LSSI-CE).
 * ────────────────────────────────────────────────────────────────────────────
 */
import { SITE_URL } from "@/lib/site";
import { NEGOCIO } from "@/lib/negocio";

export const TITULAR = {
  denominacion: "MASIDE 2011 SL",
  cif: "B54583356",
  domicilio: "Carrer Santa Maria de la Cabeza, 2, 03330 Crevillent (Alicante)",
  telefono: "966 10 78 87",
  telefonoHref: "tel:+34966107887",
  email: "casatomascrevillent@gmail.com",
  /** Marcador visible a propósito: falta el dato real. */
  registroMercantil: "[DATOS DE INSCRIPCIÓN EN EL REGISTRO MERCANTIL PENDIENTES]",
} as const;

export const ESTABLECIMIENTO = {
  nombreComercial: NEGOCIO.nombre,
  direccion: `${NEGOCIO.calle}, ${NEGOCIO.cp} ${NEGOCIO.localidad} (${NEGOCIO.region})`,
} as const;

/** Dominio visible en los textos (sin protocolo). */
export const DOMINIO = SITE_URL.replace(/^https?:\/\//, "");

/** Fecha de la versión vigente de los textos legales. */
export const ULTIMA_ACTUALIZACION = "1 de octubre de 2026";

export const RUTAS_LEGALES = {
  avisoLegal: "/aviso-legal",
  privacidad: "/privacidad",
  cookies: "/cookies",
} as const;

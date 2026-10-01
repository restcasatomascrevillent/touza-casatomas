import { Link } from "react-router-dom";
import { RUTAS_LEGALES, TITULAR } from "@/lib/legal";

/**
 * Primera capa de información (arts. 13 RGPD y 11 LOPDGDD) bajo un formulario
 * que recoge datos personales: responsable, finalidad, base legal,
 * destinatarios, derechos y enlace a la política completa.
 */
const AvisoProteccionDatos = ({ finalidad }: { finalidad: string }) => (
  <aside
    aria-label="Información básica sobre protección de datos"
    className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 md:px-5 text-xs leading-relaxed text-white/60 font-light"
  >
    <p className="text-white/75 font-medium mb-2">Protección de datos</p>
    <p>
      <span className="text-white/75">Responsable:</span> {TITULAR.denominacion}.{" "}
      <span className="text-white/75">Finalidad:</span> {finalidad}{" "}
      <span className="text-white/75">Base legal:</span> tu petición de información previa a la reserva.{" "}
      <span className="text-white/75">Destinatarios:</span> no se ceden a terceros; nuestros proveedores tecnológicos
      (Supabase, Vercel y Resend) los tratan por cuenta nuestra.{" "}
      <span className="text-white/75">Derechos:</span> acceso, rectificación, supresión, oposición, limitación y
      portabilidad, escribiendo a {TITULAR.email}.{" "}
      <Link
        to={RUTAS_LEGALES.privacidad}
        className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Más información en la política de privacidad
      </Link>
      .
    </p>
  </aside>
);

export default AvisoProteccionDatos;

import { Link, useLocation } from "react-router-dom";
import { Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { muestraBarraMovil } from "@/lib/barra-movil";

// Barra fija de conversión en móvil: llamar o reservar sin hacer scroll.
// Se renderiza también en el HTML del SSG (no depende de efectos ni de scroll).
const PHONE_HREF = "tel:+34966782000";

/**
 * El alto sale de `--barra-movil` (index.css): 4,5 rem más la zona segura del
 * iPhone. Antes eran 81 px reales (py-3 + h-14 + borde) contra un hueco y un
 * aviso de cookies calculados para 76: el final del pie quedaba tapado y el
 * aviso se montaba 5 px sobre los botones. El filete superior es una sombra
 * interior para que no sume alto.
 */
const MobileReserveCTA = () => {
  const location = useLocation();

  if (!muestraBarraMovil(location.pathname)) return null;

  return (
    <>
      {/* Reserva espacio al final del documento para que la barra no tape el footer */}
      <div aria-hidden="true" className="h-[var(--barra-movil)] lg:hidden" />

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden h-[var(--barra-movil)] bg-black/90 backdrop-blur-2xl shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] safe-bottom">
        {/* En tablet y en horizontal, dos botones de 400 px cada uno pesaban
            demasiado: se quedan en una columna centrada. */}
        <div className="flex gap-2 px-4 py-2 h-[4.5rem] max-w-md mx-auto">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="flex-1 min-w-0 px-4 h-14 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white font-medium text-base rounded-full"
          >
            <a href={PHONE_HREF} aria-label="Llamar a Touza" className="flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" aria-hidden="true" />
              <span>Llamar</span>
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            className="flex-1 min-w-0 px-4 h-14 bg-white text-black hover:bg-white/90 font-medium text-base rounded-full"
          >
            <Link to="/reservado" className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" aria-hidden="true" />
              <span>Reservar</span>
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default MobileReserveCTA;

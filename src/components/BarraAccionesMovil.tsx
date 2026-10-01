import { Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBarraMovil } from "@/lib/barra-movil";
import { TELEFONO, URL_COMO_LLEGAR } from "@/lib/negocio";

/**
 * Barra fija del móvil: llamar o ver cómo llegar sin hacer scroll (antes
 * MobileReserveCTA, "Llamar / Reservar"; Touza ya no acepta reservas por la
 * web desde el 01/10/2026). Se renderiza también en el HTML del SSG (no
 * depende de efectos ni de scroll).
 *
 * El alto sale de `--barra-movil` (index.css): 4,5 rem más la zona segura del
 * iPhone. Antes eran 81 px reales (py-3 + h-14 + borde) contra un hueco y un
 * aviso de cookies calculados para 76: el final del pie quedaba tapado y el
 * aviso se montaba 5 px sobre los botones. El filete superior es una sombra
 * interior para que no sume alto.
 *
 * Si sale o no lo decide la ruta que pinta la página (`handle` en App.tsx),
 * no la URL: ver src/lib/barra-movil.ts.
 */
const BarraAccionesMovil = () => {
  const conBarra = useBarraMovil();
  if (!conBarra) return null;

  return (
    <>
      {/* Reserva espacio al final del documento para que la barra no tape el footer */}
      <div aria-hidden="true" className="h-[var(--barra-movil)] lg:hidden" />

      <nav
        aria-label="Acciones rápidas"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden h-[var(--barra-movil)] bg-black/90 backdrop-blur-2xl shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] safe-bottom safe-x"
      >
        {/* En tablet y en horizontal, dos botones de 400 px cada uno pesaban
            demasiado: se quedan en una columna centrada. Por debajo de 360 px
            se quitan los iconos (`max-[359.98px]:hidden`) para que
            "Cómo llegar" quepa entero. */}
        <div className="flex gap-2 px-4 py-2 h-[4.5rem] max-w-md mx-auto">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="flex-1 min-w-0 px-4 h-14 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white font-medium text-base rounded-full"
          >
            <a href={TELEFONO.href} aria-label={`Llamar a Touza: ${TELEFONO.texto}`} className="flex items-center justify-center gap-2">
              <Phone className="w-5 h-5 shrink-0 max-[359.98px]:hidden" aria-hidden="true" />
              <span>Llamar</span>
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            className="flex-1 min-w-0 px-4 h-14 bg-white text-black hover:bg-white/90 font-medium text-base rounded-full"
          >
            <a
              href={URL_COMO_LLEGAR}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cómo llegar a Touza (abre Google Maps)"
              className="flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5 shrink-0 max-[359.98px]:hidden" aria-hidden="true" />
              <span className="truncate">Cómo llegar</span>
            </a>
          </Button>
        </div>
      </nav>
    </>
  );
};

export default BarraAccionesMovil;

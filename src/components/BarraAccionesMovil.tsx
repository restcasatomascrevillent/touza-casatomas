import { useLocation } from "react-router-dom";
import { Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBarraMovil } from "@/lib/barra-movil";
import { URL_COMO_LLEGAR } from "@/lib/negocio";

/**
 * Barra fija del móvil: ver cómo llegar sin hacer scroll. Antes era
 * MobileReserveCTA, "Llamar / Reservar"; Touza ya no acepta reservas por la
 * web y el botón de llamar se quitó el 02/10/2026 (decisión del dueño). Se
 * renderiza también en el HTML del SSG (no depende de efectos ni de scroll).
 *
 * El alto sale de `--barra-movil` (index.css): 4,5 rem más la zona segura del
 * iPhone. Antes eran 81 px reales (py-3 + h-14 + borde) contra un hueco y un
 * aviso de cookies calculados para 76: el final del pie quedaba tapado y el
 * aviso se montaba 5 px sobre los botones. El borde va en la píldora, que
 * cabe dentro de ese alto.
 *
 * Si sale o no lo decide la ruta que pinta la página (`handle` en App.tsx),
 * no la URL: ver src/lib/barra-movil.ts.
 */
const BarraAccionesMovil = () => {
  const conBarra = useBarraMovil();
  // En la portada no compite con el hero (que ya lleva su «Cómo llegar»):
  // aparece al bajar, con CSS ligado al scroll (`.barra-tras-hero`, index.css).
  const enPortada = (useLocation().pathname.replace(/\/+$/, "") || "/") === "/";
  if (!conBarra) return null;

  return (
    <>
      {/* Reserva espacio al final del documento para que la barra no tape el footer */}
      <div aria-hidden="true" className="h-[var(--barra-movil)] lg:hidden" />

      {/* Vidrio oscuro con borde dorado (auditoría del 15/11/2026): antes era
          una franja negra a todo el ancho con una píldora blanca, lo más
          llamativo de la web y tapando siempre los últimos 70 px. Ahora la
          píldora flota y alrededor se ve la página; el blanco macizo se queda
          para el «Cómo llegar» de los bloques en escritorio. */}
      <nav
        aria-label="Acciones rápidas"
        className={cn(
          "pointer-events-none fixed bottom-0 left-0 right-0 z-40 lg:hidden h-[var(--barra-movil)] safe-bottom safe-x",
          enPortada && "barra-tras-hero"
        )}
      >
        {/* En tablet y en horizontal, un botón de 400 px pesaba demasiado: se
            queda en una columna centrada. */}
        <div className="flex px-4 py-2 h-[4.5rem] max-w-md mx-auto">
          <a
            href={URL_COMO_LLEGAR}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Cómo llegar a Touza (abre Google Maps)"
            className="pointer-events-auto flex flex-1 min-w-0 items-center justify-center gap-2 h-14 px-4 rounded-full border border-primary/60 bg-black/60 text-white text-base font-medium backdrop-blur-xl shadow-[0_10px_30px_-10px_rgb(0_0_0/0.8)] transition-colors active:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Navigation className="w-5 h-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">Cómo llegar</span>
          </a>
        </div>
      </nav>
    </>
  );
};

export default BarraAccionesMovil;

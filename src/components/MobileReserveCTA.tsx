import { Link, useLocation } from "react-router-dom";
import { Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Barra fija de conversión en móvil: llamar o reservar sin hacer scroll.
// Se renderiza también en el HTML del SSG (no depende de efectos ni de scroll).
const HIDE_ON_PATHS = ["/reservado", "/contacto", "/404"];
const PHONE_HREF = "tel:+34966782000";

const MobileReserveCTA = () => {
  const location = useLocation();

  if (HIDE_ON_PATHS.includes(location.pathname)) return null;

  return (
    <>
      {/* Reserva espacio al final del documento para que la barra no tape el footer */}
      <div aria-hidden="true" className="h-[4.75rem] lg:hidden" />

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-black/90 backdrop-blur-2xl border-t border-white/5 safe-bottom">
        <div className="flex gap-2 px-4 py-3">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="flex-1 h-14 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white font-medium text-base rounded-2xl"
          >
            <a href={PHONE_HREF} aria-label="Llamar a Touza" className="flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              <span>Llamar</span>
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            className="flex-1 h-14 bg-white text-black hover:bg-white/90 font-medium text-base rounded-2xl"
          >
            <Link to="/reservado" className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Reservar</span>
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default MobileReserveCTA;

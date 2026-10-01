import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { alCambiarConsentimiento, guardarConsentimiento, leerConsentimiento } from "@/lib/consentimiento";
import { RUTAS_LEGALES } from "@/lib/legal";
import { muestraBarraMovil } from "@/lib/barra-movil";
import { cn } from "@/lib/utils";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const conBarra = muestraBarraMovil(useLocation().pathname);

  useEffect(() => {
    if (!leerConsentimiento()) setVisible(true);
    // "Configurar cookies" (/cookies) borra la elección: el aviso vuelve a salir.
    return alCambiarConsentimiento((valor) => setVisible(valor === null));
  }, []);

  const responder = (valor: "accepted" | "rejected") => {
    guardarConsentimiento(valor);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          role="region"
          aria-label="Aviso de cookies"
          /* En móvil se apoya justo encima de la barra fija (MobileReserveCTA)
             cuando la hay, para no tapar "Llamar" / "Reservar", y en el borde
             de la pantalla (con su zona segura) cuando no. Compacto: con la
             barra debajo, cada línea de más tapa el hero. */
          className={cn(
            "fixed left-0 right-0 z-[45] bg-card/95 backdrop-blur-xl border-t border-white/10 px-4 pt-3 md:px-6 md:py-4 lg:bottom-0 lg:pb-4",
            conBarra
              ? "bottom-[var(--barra-movil)] pb-3"
              : "bottom-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
          )}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
            {/* Antes: "Al navegar aceptas su uso" (consentimiento implícito, que
                no vale con el RGPD si además hay botón de rechazar) y un
                "Más información" con href="#" que solo subía al principio. */}
            <p className="text-[13px] md:text-sm text-white/75 font-light flex-1 leading-snug md:leading-relaxed">
              Solo usamos cookies de terceros para el mapa de Google de Contacto, y únicamente si las aceptas.
              Rechazarlas no cambia nada más de la web.{" "}
              <Link
                to={RUTAS_LEGALES.cookies}
                className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Más información
              </Link>
            </p>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => responder("rejected")}
                className="flex-1 md:flex-none min-h-[44px] px-5 text-sm font-medium text-white/80 border border-white/25 rounded-xl hover:border-white/50 hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => responder("accepted")}
                className="flex-1 md:flex-none min-h-[44px] px-5 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Aceptar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;

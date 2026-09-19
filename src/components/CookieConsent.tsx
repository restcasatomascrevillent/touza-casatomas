import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "touza_cookie_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(STORAGE_KEY, "rejected");
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
          /* En móvil se ancla por encima de la barra fija de CTA (MobileReserveCTA)
             para no tapar "Llamar" / "Reservar". */
          className="fixed bottom-[4.75rem] lg:bottom-0 left-0 right-0 z-[9998] bg-[#111111] border-t border-white/10 px-4 py-3 md:px-6 md:py-4"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
            <p className="text-xs md:text-sm text-white/70 font-light flex-1 leading-relaxed">
              Utilizamos cookies propias y de terceros para mejorar tu experiencia. Al navegar aceptas su uso.{" "}
              {/* TODO: Añadir enlace a política de cookies real */}
              <a href="#" className="text-[#D4A574] underline underline-offset-2 hover:text-[#D4A574]/80 transition-colors">
                Más información
              </a>
            </p>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button
                onClick={handleReject}
                className="flex-1 md:flex-none px-4 md:px-5 py-2 md:py-2.5 text-sm font-medium text-white/70 border border-white/20 rounded-xl hover:border-white/40 hover:text-white transition-all duration-200"
              >
                Rechazar
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-4 md:px-5 py-2 md:py-2.5 text-sm font-medium text-[#1a1a1a] bg-[#D4A574] rounded-xl hover:bg-[#D4A574]/90 transition-all duration-200"
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

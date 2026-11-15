import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { alCambiarConsentimiento, guardarConsentimiento, leerConsentimiento } from "@/lib/consentimiento";
import { RUTAS_LEGALES } from "@/lib/legal";
import { useBarraMovil } from "@/lib/barra-movil";
import { cn } from "@/lib/utils";

/**
 * Variable CSS con el alto del aviso mientras está abierto (0 si no). La usa
 * el hero de la portada en el móvil para subir su texto y sus botones lo
 * justo para que el aviso no los tape (con `transform`, que no cuenta como
 * desplazamiento de diseño para el CLS).
 */
const VAR_ALTO_AVISO = "--aviso-cookies";

// En el SSG no hay `window`: useLayoutEffect avisaría en el render del servidor.
const useEfectoDeDiseno = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Aviso de cookies: tarjeta flotante y compacta.
 *
 * - Móvil (< md): una barra fina de una sola fila (texto corto a la
 *   izquierda, «Aceptar» y «Rechazar» a la derecha), ~56 px de alto, a 8 px
 *   de los bordes y justo encima de la barra «Cómo llegar» donde la hay. Antes
 *   era una tarjeta de dos pisos (~96 px) con dos botones grandes que se
 *   sumaban a los del hero en la primera pantalla.
 * - ≥ md: tarjeta de 24 rem abajo a la derecha, con el texto completo.
 * - Móvil en horizontal (`apaisado:`): una fila (texto y botones) a la derecha.
 *
 * "Aceptar" y "Rechazar" son idénticos (mismo tamaño, color y peso): la AEPD
 * pide que rechazar sea tan fácil y visible como aceptar. No hay nada
 * premarcado: sin respuesta, el mapa de Google no se carga.
 *
 * Accesibilidad: región con nombre ("Aviso de cookies") descrita por su
 * texto. En la primera visita no roba el foco; cuando se reabre desde
 * "Configurar cookies" (/cookies), el foco pasa al primer botón y, al
 * responder, vuelve a donde estaba.
 *
 * z-45: por encima de la barra (z-40) y por debajo del menú móvil y de la
 * cabecera (z-50), así que no tapa el menú abierto.
 */
const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const conBarra = useBarraMovil();
  const tarjeta = useRef<HTMLDivElement>(null);
  const primerBoton = useRef<HTMLButtonElement>(null);
  // Elemento con el foco cuando el visitante reabrió el aviso (p. ej. el
  // botón "Configurar cookies"); null en la primera visita.
  const focoPrevio = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!leerConsentimiento()) setVisible(true);
    // "Configurar cookies" (/cookies) borra la elección: el aviso vuelve a salir.
    return alCambiarConsentimiento((valor) => {
      if (valor === null) {
        focoPrevio.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }
      setVisible(valor === null);
    });
  }, []);

  // Reabierto a petición del visitante: el foco va al aviso.
  useEffect(() => {
    if (visible && focoPrevio.current) primerBoton.current?.focus({ preventScroll: true });
  }, [visible]);

  // Publica el alto de la tarjeta para el hero (y lo retira al cerrarse).
  useEfectoDeDiseno(() => {
    const raiz = document.documentElement;
    const el = tarjeta.current;
    if (!visible || !el) {
      raiz.style.removeProperty(VAR_ALTO_AVISO);
      return;
    }
    const publicar = () => raiz.style.setProperty(VAR_ALTO_AVISO, `${Math.ceil(el.offsetHeight)}px`);
    publicar();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(publicar);
    ro?.observe(el);
    return () => {
      ro?.disconnect();
      raiz.style.removeProperty(VAR_ALTO_AVISO);
    };
  }, [visible]);

  const responder = (valor: "accepted" | "rejected") => {
    guardarConsentimiento(valor);
    setVisible(false);
    const previo = focoPrevio.current;
    focoPrevio.current = null;
    if (previo?.isConnected) previo.focus({ preventScroll: true });
  };

  // Los dos botones, idénticos. En el móvil, más bajos y sin relleno de color:
  // la barra no debe pesar más que los botones del hero.
  const boton =
    "min-h-10 rounded-full border border-white/25 bg-transparent px-3 text-[13px] font-medium text-white/90 transition-colors duration-200 hover:bg-white/10 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card md:min-h-11 md:bg-white/[0.08] md:px-4 md:text-sm md:text-white";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={tarjeta}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="region"
          aria-label="Aviso de cookies"
          aria-describedby="aviso-cookies-texto"
          className={cn(
            "fixed z-[45] flex items-center gap-2 rounded-xl border border-white/10 bg-black/90 py-2 pl-3 pr-2 backdrop-blur-xl",
            "md:block md:rounded-2xl md:bg-card/95 md:p-5 md:shadow-[0_12px_40px_rgb(0_0_0/0.55)]",
            "left-[calc(0.5rem+env(safe-area-inset-left,0px))] right-[calc(0.5rem+env(safe-area-inset-right,0px))]",
            "md:left-auto md:right-[calc(1.5rem+env(safe-area-inset-right,0px))] md:w-[24rem]",
            conBarra
              ? "bottom-[calc(var(--barra-movil)+0.25rem)] md:bottom-[calc(var(--barra-movil)+0.75rem)]"
              : "bottom-[calc(0.5rem+env(safe-area-inset-bottom,0px))] md:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]",
            // En escritorio no hay barra (lg:hidden).
            "lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]",
            // Móvil en horizontal (poco alto): una sola fila a la derecha.
            "apaisado:left-auto apaisado:w-auto apaisado:flex apaisado:items-center apaisado:gap-4 apaisado:p-3"
          )}
        >
          {/* Antes: "Al navegar aceptas su uso" (consentimiento implícito, que
              no vale con el RGPD si además hay botón de rechazar) y un
              "Más información" con href="#" que solo subía al principio. */}
          <p
            id="aviso-cookies-texto"
            className="min-w-0 flex-1 text-[12px] leading-[1.05rem] text-white/80 md:mb-4 md:text-sm md:leading-relaxed apaisado:mb-0 apaisado:text-[13px] apaisado:leading-[1.125rem]"
          >
            <span className="md:hidden apaisado:inline">Cookies del mapa de Google.</span>
            <span className="hidden md:inline apaisado:hidden">
              Solo usamos cookies de terceros para el mapa de Google de Contacto, y únicamente si las aceptas. Rechazarlas
              no cambia nada más de la web.
            </span>{" "}
            <Link
              to={RUTAS_LEGALES.cookies}
              className="whitespace-nowrap text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Más información
            </Link>
          </p>
          <div className="grid shrink-0 grid-cols-2 gap-1.5 md:gap-3 apaisado:w-[13rem] apaisado:gap-2">
            <button ref={primerBoton} type="button" onClick={() => responder("accepted")} className={boton}>
              Aceptar
            </button>
            <button type="button" onClick={() => responder("rejected")} className={boton}>
              Rechazar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;

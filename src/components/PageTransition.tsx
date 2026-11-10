import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
    children: ReactNode;
}

// La primera página que se pinta (la que llega prerenderizada por el SSG) NO
// se anima: el HTML estático tiene que verse tal cual, sin esperar al JS. La
// bandera vale lo mismo en Node y en el primer render del navegador, así que
// la hidratación coincide.
let esPrimeraPagina = true;

/**
 * Envoltorio de cada página. El cambio de página lo anima el navegador con
 * View Transitions (main.tsx activa `viewTransition` en todas las
 * navegaciones; las animaciones están en index.css, `::view-transition-*`).
 *
 * Donde no hay View Transitions (Firefox, iOS < 18) la página nueva entra con
 * un fundido corto en CSS (`.pagina-entrada`). Solo opacidad, sin transform
 * ni filter: cualquiera de los dos convertiría este div en el bloque
 * contenedor de la cabecera `fixed`, que se iría con el scroll.
 *
 * Antes era un motion.div dentro de un AnimatePresence en modo "wait": la
 * página vieja se fundía a negro durante 0,45 s y solo después entraba la
 * nueva, con al menos un fotograma en negro entre las dos.
 */
const PageTransition = ({ children }: PageTransitionProps) => {
    const [fundidoDeEntrada] = useState(
        () => !esPrimeraPagina && typeof document !== "undefined" && !("startViewTransition" in document)
    );
    useEffect(() => {
        esPrimeraPagina = false;
    }, []);

    return <div className={cn("w-full", fundidoDeEntrada && "pagina-entrada")}>{children}</div>;
};

export default PageTransition;

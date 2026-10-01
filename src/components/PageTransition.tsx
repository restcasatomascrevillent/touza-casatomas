import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface PageTransitionProps {
    children: ReactNode;
}

// La primera página que se pinta (la que llega prerenderizada por el SSG) NO
// se anima: framer-motion vuelca el `initial` como estilo en línea en el HTML
// estático, así que con `initial={{ opacity: 0 }}` toda la página llegaba
// invisible y no aparecía hasta que React hidrataba (LCP a la espera del JS).
// La bandera vale lo mismo en Node y en el primer render del navegador, así que
// la hidratación coincide; a partir de ahí, cada navegación sí se anima.
let esPrimeraPagina = true;

const PageTransition = ({ children }: PageTransitionProps) => {
    const [animarEntrada] = useState(() => !esPrimeraPagina);
    useEffect(() => {
        esPrimeraPagina = false;
    }, []);

    return (
        <motion.div
            // Sin `filter: blur()`: cualquier `filter` distinto de `none` (también
            // el `blur(0px)` final que dejaba framer-motion) convierte este div en
            // el bloque contenedor de sus descendientes `fixed`, y la cabecera
            // dejaba de estar fija: se iba con el scroll y el menú quedaba
            // inaccesible fuera de la parte alta de la página.
            initial={animarEntrada ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;

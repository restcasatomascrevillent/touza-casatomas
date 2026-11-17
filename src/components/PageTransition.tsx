import { ReactNode, useEffect, useState } from "react";

interface PageTransitionProps {
    children: ReactNode;
}

// La primera página que se pinta (la que llega prerenderizada por el SSG) NO
// se funde: es el HTML que ya se está viendo, y animarlo retrasaría el LCP.
// La bandera vale lo mismo en Node y en el primer render del navegador, así que
// la hidratación coincide; a partir de ahí, cada navegación sí lleva el fundido.
let esPrimeraPagina = true;

/**
 * Contenedor de cada página. `App.tsx` lo monta con `key={pathname}`: al
 * cambiar de ruta nace uno nuevo, ya con la página nueva dentro.
 *
 * REGLA (17/11/2026): que una página se vea NO puede depender de que termine
 * una animación de JavaScript. Aquí no hay framer-motion, ni estilos en
 * línea, ni animación de salida:
 *
 * - El fundido de entrada es la clase `.entrada-pagina` (index.css): una
 *   animación CSS de 0,25 s, de opacidad 0 a 1. Si no arranca (o con
 *   «reducir movimiento», que ni la aplica), el contenido está visible igual,
 *   porque la opacidad de reposo del div es 1.
 * - Solo opacidad: nada de `transform` ni `filter`, que convertirían este div
 *   en el bloque contenedor de la cabecera `fixed` (dejaba de estar fija).
 *
 * Antes era un `motion.div` dentro de `<AnimatePresence mode="wait">`. El div
 * que salía pintaba ya la página nueva (su `<Outlet />` sigue a la ruta), y si
 * esa página traía componentes `motion` (la carta: el subrayado de las
 * pestañas), se apuntaban a una salida que ya estaba en marcha y no la
 * completaban nunca: el div viejo se quedaba en `opacity: 0`, el nuevo no
 * llegaba a montarse y la página salía en negro para siempre (demo v0.19).
 * Lo vigila `__tests__/PageTransition.test.tsx`.
 */
const PageTransition = ({ children }: PageTransitionProps) => {
    const [conFundido] = useState(() => !esPrimeraPagina);
    useEffect(() => {
        esPrimeraPagina = false;
    }, []);

    return <div className={conFundido ? "w-full entrada-pagina" : "w-full"}>{children}</div>;
};

export default PageTransition;

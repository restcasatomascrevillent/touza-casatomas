import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const CustomCursor = () => {
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const x = useSpring(0, springConfig);
    const y = useSpring(0, springConfig);

    useEffect(() => {
        // Solo con ratón de verdad: `(hover: hover) and (pointer: fine)` como
        // condición POSITIVA. Antes se excluía `(pointer: coarse)`, que no
        // cubre todos los casos (un portátil táctil, un móvil emulado en el
        // navegador de escritorio, una tablet con ratón): el punto aparecía en
        // el móvil y, con `mix-blend-difference`, se veía como un punto negro
        // sobre el botón blanco "Reservar". Se vuelve a evaluar si cambia la
        // media query, y además solo se pinta tras mover el ratón (antes
        // arrancaba en la esquina 0,0) y se esconde en cuanto llega un toque.
        const raton = window.matchMedia("(hover: hover) and (pointer: fine)");
        const reducido = window.matchMedia("(prefers-reduced-motion: reduce)");
        let activo = false;
        let pintado = false;

        // `pointermove` y no `mousemove`: tras un toque, el navegador también
        // emite eventos de ratón "de compatibilidad" que volvían a pintar el punto.
        const handleMouseMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            if (!pintado) {
                // Primera aparición: salta a la posición sin el muelle (si
                // no, cruzaba la pantalla desde la esquina).
                x.jump(e.clientX);
                y.jump(e.clientY);
                pintado = true;
                setIsVisible(true);
                return;
            }
            x.set(e.clientX);
            y.set(e.clientY);
        };

        const handlePointerDown = (e: PointerEvent) => {
            if (e.pointerType === "mouse") return;
            pintado = false;
            setIsVisible(false);
        };

        const isInteractive = (target: EventTarget | null) =>
            target instanceof Element &&
            !!target.closest("a, button, [role='button'], input, textarea, select, [data-interactive]");

        const handleMouseOver = (e: MouseEvent) => {
            if (isInteractive(e.target)) setIsHovering(true);
        };

        const handleMouseOut = (e: MouseEvent) => {
            if (isInteractive(e.target)) setIsHovering(false);
        };

        const encender = () => {
            if (activo) return;
            activo = true;
            window.addEventListener("pointermove", handleMouseMove);
            window.addEventListener("pointerdown", handlePointerDown);
            document.addEventListener("mouseover", handleMouseOver);
            document.addEventListener("mouseout", handleMouseOut);
        };

        const apagar = () => {
            if (!activo) return;
            activo = false;
            pintado = false;
            window.removeEventListener("pointermove", handleMouseMove);
            window.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("mouseover", handleMouseOver);
            document.removeEventListener("mouseout", handleMouseOut);
            setIsVisible(false);
            setIsHovering(false);
        };

        const evaluar = () => (raton.matches && !reducido.matches ? encender() : apagar());
        evaluar();
        raton.addEventListener("change", evaluar);
        reducido.addEventListener("change", evaluar);

        return () => {
            raton.removeEventListener("change", evaluar);
            reducido.removeEventListener("change", evaluar);
            apagar();
        };
    }, [x, y]);

    if (!isVisible) return null;

    return (
        <motion.div
            aria-hidden="true"
            className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
            style={{
                x,
                y,
                translateX: "-50%",
                translateY: "-50%",
            }}
        >
            <motion.div
                className="rounded-full bg-white"
                animate={{
                    width: isHovering ? 40 : 8,
                    height: isHovering ? 40 : 8,
                    opacity: isHovering ? 0.5 : 1,
                }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            />
        </motion.div>
    );
};

export default CustomCursor;

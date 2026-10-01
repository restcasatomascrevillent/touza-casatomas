import { useEffect } from "react";
import Lenis from "lenis";
import { registrarLenis } from "@/lib/scroll";

const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        // Quien pide "reducir movimiento" en su sistema se queda con el scroll
        // nativo: la inercia de Lenis es justo el tipo de movimiento que esa
        // preferencia quiere evitar.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });
        registrarLenis(lenis);

        let frame = 0;
        const raf = (time: number) => {
            lenis.raf(time);
            frame = requestAnimationFrame(raf);
        };
        frame = requestAnimationFrame(raf);

        return () => {
            // Antes el bucle de requestAnimationFrame seguía vivo tras destruir Lenis.
            cancelAnimationFrame(frame);
            registrarLenis(null);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
};

export default SmoothScroll;

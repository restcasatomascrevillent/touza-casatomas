import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const CustomCursor = () => {
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const x = useSpring(0, springConfig);
    const y = useSpring(0, springConfig);

    useEffect(() => {
        // Sin cursor propio en táctil ni con "reducir movimiento" (es un
        // elemento que persigue al ratón con muelle: justo lo que se pide evitar).
        if (
            window.matchMedia("(pointer: coarse)").matches ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) return;

        setIsVisible(true);

        const handleMouseMove = (e: MouseEvent) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.closest("a, button, [role='button'], input, textarea, select, [data-interactive]") ||
                target.tagName === "A" ||
                target.tagName === "BUTTON"
            ) {
                setIsHovering(true);
            }
        };

        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.closest("a, button, [role='button'], input, textarea, select, [data-interactive]") ||
                target.tagName === "A" ||
                target.tagName === "BUTTON"
            ) {
                setIsHovering(false);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseover", handleMouseOver);
        document.addEventListener("mouseout", handleMouseOut);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseover", handleMouseOver);
            document.removeEventListener("mouseout", handleMouseOut);
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

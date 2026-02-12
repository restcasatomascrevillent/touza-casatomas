import { useRef, useEffect, useCallback } from "react";

export const useMagneticEffect = (strength: number = 5) => {
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const el = ref.current;
        if (!el || window.matchMedia("(pointer: coarse)").matches) return;

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) / rect.width;
        const deltaY = (e.clientY - centerY) / rect.height;

        el.style.transform = `translate(${deltaX * strength}px, ${deltaY * strength}px)`;
        el.style.transition = "transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)";
    }, [strength]);

    const handleMouseLeave = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        el.style.transform = "translate(0, 0)";
        el.style.transition = "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)";
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia("(pointer: coarse)").matches) return;

        el.addEventListener("mousemove", handleMouseMove);
        el.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            el.removeEventListener("mousemove", handleMouseMove);
            el.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [handleMouseMove, handleMouseLeave]);

    return ref;
};

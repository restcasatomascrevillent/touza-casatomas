import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform, type MotionStyle, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { QUERY_EFECTOS_SCROLL, useMediaQuery } from "@/hooks/use-media-query";

interface ScrollTextRevealProps {
  children: string;
  className?: string;
}

const Word = ({
  word,
  index,
  total,
  scrollYProgress,
  activo,
}: {
  word: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  activo: boolean;
}) => {
  // Todas las palabras se encienden en un tramo corto y muy solapado.
  const start = (index / total) * 0.6;
  const end = start + 0.4;
  const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);

  return (
    <motion.span
      // `--i`: índice para el encendido en CSS del móvil (`.texto-encendido`).
      style={{ "--i": index, ...(activo ? { opacity } : {}) } as MotionStyle}
      className="inline-block mr-[0.3em]"
    >
      {word}
    </motion.span>
  );
};

/**
 * Texto que se "enciende" palabra a palabra con el scroll.
 *
 * Solo es una mejora: en el HTML del SSG y con `prefers-reduced-motion` el
 * texto sale entero y a opacidad completa. Antes cada palabra llegaba con
 * `opacity: 0.15` en línea, casi invisible sin JS. En ≥ md lo hace
 * framer-motion, que se activa al montar, cuando el párrafo aún está bajo el
 * hero (el cambio no se ve). En el móvil lo hace el CSS (`.texto-encendido`
 * en index.css) con una animación ligada al scroll, sin JS por palabra.
 */
const ScrollTextReveal = ({ children, className }: ScrollTextRevealProps) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const activo = useMediaQuery(QUERY_EFECTOS_SCROLL);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.55"],
  });

  const words = children.split(" ");

  return (
    <p
      ref={ref}
      className={cn("texto-encendido flex flex-wrap", className)}
      style={{ "--n": words.length } as CSSProperties}
    >
      {words.map((word, i) => (
        <Word key={i} word={word} index={i} total={words.length} scrollYProgress={scrollYProgress} activo={activo} />
      ))}
    </p>
  );
};

export default ScrollTextReveal;

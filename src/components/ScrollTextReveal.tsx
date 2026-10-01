import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
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
    <motion.span style={activo ? { opacity } : undefined} className="inline-block mr-[0.3em]">
      {word}
    </motion.span>
  );
};

/**
 * Texto que se "enciende" palabra a palabra con el scroll.
 *
 * Solo es una mejora: en el HTML del SSG, en móvil y con
 * `prefers-reduced-motion` el texto sale entero y a opacidad completa. Antes
 * cada palabra llegaba con `opacity: 0.15` en línea, casi invisible sin JS.
 * El efecto se activa al montar, cuando el párrafo aún está bajo el hero, así
 * que el cambio no se ve.
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
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => (
        <Word key={i} word={word} index={i} total={words.length} scrollYProgress={scrollYProgress} activo={activo} />
      ))}
    </p>
  );
};

export default ScrollTextReveal;

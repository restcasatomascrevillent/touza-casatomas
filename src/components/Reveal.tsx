import { useEffect, useRef, type CSSProperties, type ElementType, type HTMLAttributes } from "react";

type Etiqueta = "div" | "section" | "span" | "p" | "h2" | "h3" | "li" | "ul" | "form";

interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: Etiqueta;
  /** Retraso en segundos, para escalonar elementos hermanos. */
  delay?: number;
  /** Desplazamiento vertical de partida, en px. */
  y?: number;
  /** Escala de partida (1 = sin escala). */
  scale?: number;
}

/**
 * Aparición al entrar en pantalla que NUNCA esconde contenido en el HTML.
 *
 * Antes se usaba `whileInView` de framer-motion, que vuelca su `initial`
 * (`opacity:0`) como estilo en línea en el HTML del SSG: todo lo que había
 * bajo el pliegue llegaba invisible y, si el JS tardaba o fallaba, no se veía
 * nunca (hallazgo G16 / propuesta P4 de la auditoría).
 *
 * Ahora el HTML sale siempre visible. Ya en el navegador, y solo si el
 * elemento está por DEBAJO de la pantalla al montar (así que nadie lo está
 * viendo), se marca `data-reveal="pendiente"` (oculto por CSS) y un
 * IntersectionObserver lo pasa a `"visto"` al llegar. Lo que ya está a la
 * vista o por encima no se toca. Con `prefers-reduced-motion` no se anima nada.
 * Los estilos están en `index.css` (`[data-reveal]`).
 */
const Reveal = ({ as = "div", delay = 0, y = 24, scale = 1, style, children, ...props }: RevealProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "pendiente";
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        el.dataset.reveal = "visto";
        observador.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    observador.observe(el);
    return () => {
      observador.disconnect();
      // Si se desmonta o el efecto se repite (StrictMode), que no quede oculto.
      if (el.dataset.reveal === "pendiente") delete el.dataset.reveal;
    };
  }, []);

  const Tag = as as ElementType;
  const variables = {
    "--reveal-delay": `${delay}s`,
    "--reveal-y": `${y}px`,
    "--reveal-scale": scale,
    ...style,
  } as CSSProperties;

  return (
    <Tag ref={ref} style={variables} {...props}>
      {children}
    </Tag>
  );
};

export default Reveal;

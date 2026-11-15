import { useEffect, useRef, useState, type ReactNode } from "react";
import { limitar, opacidadFotograma } from "@/lib/carta";

/**
 * Hero de la carta: la copa llenándose, ligada al scroll.
 *
 * Diez fotos de una ráfaga del bartender sirviendo un Clover Club
 * (IMG_0284–0293 de la carpeta «Touza» de Drive), alineadas entre sí para que
 * la copa no tiemble.
 *
 * La sección es más alta que la pantalla y dentro hay un bloque `sticky` del
 * alto de la pantalla: mientras se recorre ese tramo, el hero se queda fijo y
 * el scroll avanza los fotogramas, con un fundido cruzado entre cada dos
 * seguidos (el de encima sube su opacidad poco a poco) para que se vea
 * continuo y no a saltos. Al acabar el tramo, la copa está llena y la página
 * sigue con normalidad.
 *
 * - El primer fotograma es una <img> normal con prioridad: es el LCP y lo que
 *   trae el HTML del SSG. Mientras llega, el hueco enseña un resplandor cálido
 *   (degradado CSS; no una miniatura incrustada, porque los fotogramas se
 *   pueden regenerar con los mismos nombres y la miniatura se quedaría vieja).
 * - Los otros nueve se piden desde que monta la página, en orden, de dos en
 *   dos y con prioridad baja (no compiten con el LCP). Cada uno entra en la
 *   secuencia en cuanto está decodificado: el scroll usa los que ya han
 *   llegado (si falta uno, funde del anterior al siguiente) sin esperar a
 *   tenerlos todos.
 * - Con reduced-motion: copa llena y quieta, sin tramo fijo. El <picture>
 *   elige el último fotograma por CSS (`prefers-reduced-motion`), así que ni
 *   siquiera hay cambio de foto al hidratar, y no se precarga nada.
 * - Las opacidades se escriben directamente en el DOM desde un
 *   requestAnimationFrame: nada de renders de React por cada píxel de scroll.
 */
const fotogramas = Object.entries(
  import.meta.glob("../../assets/secuencias/llenado/*.webp", { eager: true, query: "?url", import: "default" }) as Record<
    string,
    string
  >
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

const ULTIMO = fotogramas.length - 1;
const REDUCIR_MOVIMIENTO = "(prefers-reduced-motion: reduce)";
const A_LA_VEZ = 2;

interface Props {
  alt: string;
  /** Texto del hero: va en la franja oscura de abajo, no sobre el líquido. */
  children?: ReactNode;
}

const ENCUADRE = "absolute inset-0 h-full w-full object-cover object-[50%_30%] md:object-[50%_22%]";

const quiereQuieto = () =>
  typeof window !== "undefined" && (window.matchMedia?.(REDUCIR_MOVIMIENTO).matches ?? false);

const HeroLlenado = ({ alt, children }: Props) => {
  const seccionRef = useRef<HTMLElement>(null);
  // capasRef.current[k]: la <img> del fotograma k (k ≥ 1), si ya ha llegado.
  const capasRef = useRef<(HTMLImageElement | null)[]>([]);
  // Qué fotogramas ya están decodificados (el 0 lo pinta el HTML).
  const [llegados, setLlegados] = useState<boolean[]>(() => fotogramas.map(() => false));
  const programarRef = useRef<() => void>(() => undefined);

  // Precarga en orden, de dos en dos, desde que monta la página.
  useEffect(() => {
    if (quiereQuieto()) return;
    let cancelado = false;
    let siguiente = 1;
    const pedir = () => {
      if (cancelado || siguiente > ULTIMO) return;
      const k = siguiente++;
      const img = new Image();
      (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = "low";
      const cargado = new Promise<void>((ok, ko) => {
        img.onload = () => ok();
        img.onerror = () => ko(new Error(fotogramas[k]));
      });
      img.src = fotogramas[k];
      // Cargado y, si se puede, ya decodificado (sin tirón al entrar). Pero
      // sin esperar a `decode` más de 250 ms: con la pestaña en segundo plano
      // Chrome no decodifica y la promesa se queda colgada. `decode` tampoco
      // existe en navegadores viejos ni en jsdom (tests).
      const listo = cargado.then(() =>
        typeof img.decode === "function"
          ? Promise.race([img.decode().catch(() => undefined), new Promise((ok) => window.setTimeout(ok, 250))])
          : undefined
      );
      listo
        .then(() => {
          if (!cancelado) setLlegados((previos) => previos.map((v, i) => v || i === k));
        })
        // Uno que falla no para la secuencia: se salta.
        .catch(() => undefined)
        .finally(pedir);
    };
    for (let i = 0; i < A_LA_VEZ; i++) pedir();
    return () => {
      cancelado = true;
    };
  }, []);

  // Scroll → fotograma. Se engancha una vez; cada fotograma que llega vuelve
  // a pintar para entrar con la opacidad que le toca.
  useEffect(() => {
    const seccion = seccionRef.current;
    if (!seccion || quiereQuieto()) return;
    let pendiente = 0;
    const pintar = () => {
      pendiente = 0;
      const caja = seccion.getBoundingClientRect();
      const recorrido = caja.height - window.innerHeight;
      const progreso = recorrido > 0 ? limitar(-caja.top / recorrido) : 1;
      const f = progreso * ULTIMO;
      capasRef.current.forEach((capa, k) => {
        if (capa) capa.style.opacity = String(opacidadFotograma(k, f));
      });
    };
    const programar = () => {
      if (!pendiente) pendiente = requestAnimationFrame(pintar);
    };
    programarRef.current = programar;
    pintar();
    window.addEventListener("scroll", programar, { passive: true });
    window.addEventListener("resize", programar);
    return () => {
      programarRef.current = () => undefined;
      window.removeEventListener("scroll", programar);
      window.removeEventListener("resize", programar);
      cancelAnimationFrame(pendiente);
    };
  }, []);

  useEffect(() => {
    programarRef.current();
  }, [llegados]);

  return (
    <section
      ref={seccionRef}
      // Alto = pantalla + tramo fijo (70 % de pantalla en el móvil, 120 % en
      // escritorio). Sin animación, solo la pantalla.
      className="relative h-[170vh] md:h-[220vh] motion-reduce:h-auto"
    >
      <div className="sticky top-0 h-[100svh] min-h-[32rem] overflow-hidden bg-[#0b0806] motion-reduce:relative">
        {/* Foto: arriba en el móvil (deja abajo una franja oscura para el
            texto); a pantalla completa desde md. Debajo, un resplandor cálido
            (el rojo del cóctel y el ámbar de la barra): es lo que se ve
            mientras llega el primer fotograma, nunca negro. */}
        <div className="absolute inset-x-0 top-0 h-[64%] bg-[radial-gradient(70%_60%_at_50%_42%,#6e2717_0%,#311710_45%,#0b0806_100%)] md:h-full">
          <picture>
            <source media={REDUCIR_MOVIMIENTO} srcSet={fotogramas[ULTIMO]} />
            <img
              src={fotogramas[0]}
              alt={alt}
              width={1280}
              height={1024}
              {...{ fetchpriority: "high" }}
              decoding="async"
              className={ENCUADRE}
            />
          </picture>
          {fotogramas.map((src, k) =>
            k > 0 && llegados[k] ? (
              <img
                key={src}
                ref={(el) => {
                  capasRef.current[k] = el;
                }}
                src={src}
                alt=""
                aria-hidden="true"
                width={1280}
                height={1024}
                className={ENCUADRE}
                style={{ opacity: 0 }}
              />
            ) : null
          )}
          {/* Arriba, sombra para la cabecera; abajo, la foto se funde con el
              oscuro donde va el texto. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent via-40% to-[#0b0806] to-95% md:via-55% md:to-100%"
          />
        </div>
        {/* En el móvil, por encima de la barra fija «Cómo llegar». */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-[calc(var(--barra-movil,4.5rem)+1.5rem)] md:pb-14">
          {children}
        </div>
      </div>
    </section>
  );
};

export default HeroLlenado;

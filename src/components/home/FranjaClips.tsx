import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import Encabezado from "./Encabezado";
import { CLIPS_PORTADA, pausar, reproducirSolo, videoPermitido, type Clip } from "./medios";

/** Fracción visible a partir de la cual un clip puede ponerse en marcha. */
const VISIBLE_PARA_REPRODUCIR = 0.6;

/**
 * Franja de clips cortos de la barra (y, cuando lleguen, los reels de
 * Instagram, que van primero: ver `medios.ts`). Si no hay ningún clip, la
 * sección no se pinta.
 *
 * - En el HTML del SSG solo están los pósters (<img>), nada oculto.
 * - En el navegador, cada <video> se crea al acercarse (200 px antes) y se
 *   pausa al salir. Solo hay uno en marcha a la vez: el más visible, o el que
 *   tiene el ratón encima.
 * - Con «reducir movimiento», ahorro de datos o 3G: solo los pósters.
 * - Los clips repiten en bucle, así que hay un botón para pararlos todos
 *   (WCAG 2.2.2).
 */
const FranjaClips = ({ clips = CLIPS_PORTADA }: { clips?: Clip[] }) => {
  if (clips.length === 0) return null;
  return (
    <section aria-labelledby="clips-titulo" className="py-20 md:py-28">
      <TiraClips clips={clips} />
    </section>
  );
};

const TiraClips = ({ clips }: { clips: Clip[] }) => {
  const [conVideo, setConVideo] = useState(false);
  const [cerca, setCerca] = useState<boolean[]>(() => clips.map(() => false));
  const [parado, setParado] = useState(false);
  const cajas = useRef<(HTMLLIElement | null)[]>([]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const visibles = useRef<number[]>(clips.map(() => 0));
  const encima = useRef<number | null>(null);
  const paradoRef = useRef(false);

  useEffect(() => setConVideo(videoPermitido()), []);

  /** Pone en marcha el clip que toca y pausa los demás. */
  const elegir = useCallback(() => {
    let elegido = -1;
    if (!paradoRef.current) {
      if (encima.current !== null && visibles.current[encima.current] > 0.25) {
        elegido = encima.current;
      } else {
        visibles.current.forEach((fraccion, i) => {
          if (fraccion >= VISIBLE_PARA_REPRODUCIR && (elegido === -1 || fraccion > visibles.current[elegido])) elegido = i;
        });
      }
    }
    videos.current.forEach((video, i) => {
      if (!video) return;
      if (i === elegido) {
        if (video.paused) reproducirSolo(video);
      } else if (!video.paused) {
        pausar(video);
      }
    });
  }, []);

  // Crear el vídeo al acercarse.
  useEffect(() => {
    if (!conVideo || typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(
      (entradas) => {
        setCerca((antes) => {
          let cambia = false;
          const ahora = [...antes];
          for (const entrada of entradas) {
            const i = Number((entrada.target as HTMLElement).dataset.indice);
            if (entrada.isIntersecting && !ahora[i]) {
              ahora[i] = true;
              cambia = true;
            }
          }
          return cambia ? ahora : antes;
        });
      },
      { rootMargin: "200px" }
    );
    cajas.current.forEach((caja) => caja && observador.observe(caja));
    return () => observador.disconnect();
  }, [conVideo]);

  // Cuánto se ve cada clip, para decidir cuál va en marcha.
  useEffect(() => {
    if (!conVideo || typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          const i = Number((entrada.target as HTMLElement).dataset.indice);
          visibles.current[i] = entrada.isIntersecting ? entrada.intersectionRatio : 0;
        }
        elegir();
      },
      { threshold: [0, 0.25, 0.5, VISIBLE_PARA_REPRODUCIR, 0.8, 1] }
    );
    cajas.current.forEach((caja) => caja && observador.observe(caja));
    const lista = videos.current;
    return () => {
      observador.disconnect();
      lista.forEach((video) => video && pausar(video));
    };
  }, [conVideo, elegir]);

  const alternar = () => {
    paradoRef.current = !paradoRef.current;
    setParado(paradoRef.current);
    elegir();
  };

  return (
    <>
      <div className="mx-auto mb-8 flex max-w-7xl items-end justify-between gap-6 px-5 md:mb-12 md:px-8 lg:px-10">
        <Encabezado id="clips-titulo" lineas={["En la barra"]} tituloClassName="text-[2.5rem] leading-none md:text-6xl" />
        {conVideo && (
          <button
            type="button"
            onClick={alternar}
            aria-label={parado ? "Reanudar los vídeos" : "Pausar los vídeos"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:border-white/50 hover:text-white"
          >
            {parado ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
          </button>
        )}
      </div>

      {/* Tira con desplazamiento lateral en todos los tamaños: en escritorio
          caben cinco clips de 15 rem; a partir del sexto (los reels), se
          desliza. */}
      <ul className="flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide md:mx-auto md:max-w-7xl md:scroll-px-8 md:gap-5 md:px-8 lg:scroll-px-10 lg:px-10">
        {clips.map((clip, i) => (
          <li
            key={clip.id}
            ref={(el) => {
              cajas.current[i] = el;
            }}
            data-indice={i}
            onPointerEnter={() => {
              encima.current = i;
              elegir();
            }}
            onPointerLeave={() => {
              encima.current = null;
            }}
            className="w-[62vw] max-w-[17rem] shrink-0 snap-start md:w-[14.5rem] md:max-w-none"
          >
            <figure>
              <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-white/5">
                {clip.poster && (
                  <img
                    src={clip.poster}
                    alt={`${clip.nombre}, en la barra de Touza`}
                    width={720}
                    height={1280}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {conVideo && cerca[i] && (
                  <video
                    ref={(el) => {
                      videos.current[i] = el;
                    }}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    disablePictureInPicture
                    aria-hidden="true"
                    tabIndex={-1}
                    poster={clip.poster}
                    onLoadedData={elegir}
                    className="absolute inset-0 h-full w-full object-cover"
                  >
                    {clip.webm && <source src={clip.webm} type="video/webm" />}
                    {clip.mp4 && <source src={clip.mp4} type="video/mp4" />}
                  </video>
                )}
              </div>
              <figcaption className="mt-3 font-serif text-xl font-medium text-cream md:text-2xl">{clip.nombre}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </>
  );
};

export default FranjaClips;

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { videoPermitido } from "@/components/home/medios";

/**
 * Hero de la carta: la copa que se llena sola al entrar.
 *
 * Es el plano del hero que le gustaba al dueño (la copa coupé llenándose de
 * Clover Club), pero ya no depende del scroll: es un vídeo corto (~5 s) que
 * arranca solo, sin tramo fijo, y debajo van directamente las pestañas.
 *
 * De ese plano no hay vídeo original: sale de una ráfaga de diez fotos del
 * iPhone (3024×4032) fundidas entre sí a su ritmo real; el montaje está en
 * scripts/retoque/copa_video.py. Dos encuadres: horizontal 1920×1080 y, con
 * la pantalla en vertical, 1080×1350 centrado en la copa.
 *
 * - En el HTML del SSG solo está el póster (el primer fotograma), que es la
 *   imagen prioritaria de la página. Mientras llega, el hueco enseña un
 *   resplandor cálido, nunca negro.
 * - En el navegador se añade el <video muted playsinline preload="auto">,
 *   que arranca al cargar. No hace bucle (de llena a vacía sería un salto):
 *   al terminar se queda la copa llena, como foto fija y nítida (hasta
 *   3000 px en horizontal y 1440 en vertical; los vídeos son de 1920 y
 *   1080). El botón pausa, reanuda y, al acabar, repite.
 * - Fuera de pantalla se pausa; al volver, sigue (salvo que se parase a mano).
 * - Con «reducir movimiento» el <picture> elige por CSS la copa llena y no
 *   hay vídeo. Con ahorro de datos o 3G tampoco: se enseña la copa llena.
 */
const urls = import.meta.glob("../../assets/videos/carta/*.{avif,webp,mp4}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const url = (nombre: string) => Object.entries(urls).find(([ruta]) => ruta.endsWith(`/${nombre}`))?.[1] ?? "";
const srcset = (base: string, anchos: readonly number[], formato: "avif" | "webp") =>
  anchos.map((ancho) => `${url(`${base}-${ancho}.${formato}`)} ${ancho}w`).join(", ");

interface Encuadre {
  video: string;
  width: number;
  height: number;
  /** Ancho real con el que `object-cover` pinta la foto en el hero. */
  sizes: string;
  inicio: { avif: string; webp: string; src: string };
  llena: { avif: string; webp: string; src: string };
}

function encuadre(
  nombre: string,
  medidas: { width: number; height: number },
  sizes: string,
  anchosInicio: readonly number[],
  anchosLlena: readonly number[]
): Encuadre {
  const fotos = (momento: "inicio" | "llena", anchos: readonly number[]) => ({
    avif: srcset(`${nombre}-${momento}`, anchos, "avif"),
    webp: srcset(`${nombre}-${momento}`, anchos, "webp"),
    src: url(`${nombre}-${momento}-${medidas.width}.webp`),
  });
  return {
    video: url(`${nombre}.mp4`),
    ...medidas,
    sizes,
    inicio: fotos("inicio", anchosInicio),
    llena: fotos("llena", anchosLlena),
  };
}

// El hero mide 65svh de alto desde md y 55svh en el móvil: una foto 16:9 se
// pinta a 116vh de ancho como mínimo (65 × 16/9) y una 4:5, a 52vh (65 × 4/5).
const HORIZONTAL = encuadre("copa-horizontal", { width: 1920, height: 1080 }, "max(100vw, 116vh)", [1280, 1920], [1280, 1920, 2560, 3000]);
const VERTICAL = encuadre("copa-vertical", { width: 1080, height: 1350 }, "max(100vw, 52vh)", [720, 1080], [720, 1080, 1440]);

const PANTALLA_VERTICAL = "(orientation: portrait)";
const REDUCIR_MOVIMIENTO = "(prefers-reduced-motion: reduce)";
/** Fracción del hero a la vista por debajo de la cual el vídeo se pausa. */
const VISIBLE_PARA_SEGUIR = 0.25;

// React 18 aún no conoce `fetchPriority` en camelCase: se escribe en minúsculas.
const PRIORIDAD_ALTA = { fetchpriority: "high" } as Record<string, string>;

// Arriba del todo (la copa empieza justo bajo la cabecera). En horizontal la
// copa está al 40 % del ancho: si la ventana recorta los lados, que no se vaya.
const ENCUADRE = "absolute inset-0 h-full w-full object-cover object-top landscape:object-[40%_0%]";

const cumple = (consulta: string) => typeof window !== "undefined" && (window.matchMedia?.(consulta).matches ?? false);

function reproducir(video: HTMLVideoElement) {
  // iOS solo arranca solo un vídeo silenciado, y React no siempre pone el
  // atributo `muted` en el DOM: se fuerza aquí.
  video.muted = true;
  // Autoplay bloqueado (ahorro de batería de iOS…): se queda el póster.
  void video.play()?.catch(() => undefined);
}

type Fase = "andando" | "pausado" | "terminado";

interface Props {
  /** Texto alternativo del plano (el mismo para el póster y la copa llena). */
  alt: string;
  /** Título y línea de resumen: van abajo, sobre el degradado. */
  children?: ReactNode;
}

const HeroCopa = ({ alt, children }: Props) => {
  const seccionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Se deciden al montar (en el SSG nunca hay vídeo): qué encuadre toca y si
  // hay vídeo o solo la foto de la copa llena.
  const [clip, setClip] = useState<Encuadre | null>(null);
  const [fase, setFase] = useState<Fase>("andando");
  const [llena, setLlena] = useState(false);
  const pausadoAMano = useRef(false);

  useEffect(() => {
    const elegido = cumple(PANTALLA_VERTICAL) ? VERTICAL : HORIZONTAL;
    if (elegido.video && videoPermitido()) setClip(elegido);
    // Sin vídeo por ahorro de datos: la copa llena. Con «reducir movimiento»
    // ya la ha puesto el <picture>.
    else if (!cumple(REDUCIR_MOVIMIENTO)) setLlena(true);
  }, []);

  // Arranca al cargar; se pausa al salir de pantalla y sigue al volver.
  useEffect(() => {
    const seccion = seccionRef.current;
    const video = videoRef.current;
    if (!clip || !seccion || !video) return;
    reproducir(video);
    if (typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada || video.ended || pausadoAMano.current) return;
        if (entrada.intersectionRatio < VISIBLE_PARA_SEGUIR) video.pause();
        else if (video.paused) reproducir(video);
      },
      { threshold: [0, VISIBLE_PARA_SEGUIR, 0.5] }
    );
    observador.observe(seccion);
    return () => {
      observador.disconnect();
      video.pause();
    };
  }, [clip]);

  const alternar = () => {
    const video = videoRef.current;
    if (!video) return;
    if (fase === "terminado") {
      // Otra vez desde el principio.
      pausadoAMano.current = false;
      setLlena(false);
      setFase("andando");
      video.currentTime = 0;
      reproducir(video);
    } else if (video.paused) {
      pausadoAMano.current = false;
      reproducir(video);
    } else {
      pausadoAMano.current = true;
      video.pause();
    }
  };

  const etiqueta =
    fase === "terminado"
      ? "Repetir la animación de la copa"
      : fase === "pausado"
        ? "Reanudar la animación de la copa"
        : "Pausar la animación de la copa";
  const Icono = fase === "terminado" ? RotateCcw : fase === "pausado" ? Play : Pause;

  return (
    <section
      ref={seccionRef}
      className="relative isolate flex h-[55svh] min-h-[24rem] items-end overflow-hidden bg-[#0b0806] md:h-[65svh] md:min-h-[26rem] apaisado:h-[85svh] apaisado:min-h-[17rem]"
    >
      {/* Debajo de la foto, un resplandor cálido (el rojo del cóctel y el
          ámbar de la barra): es lo que se ve mientras llega el póster. */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_45%_40%,#6e2717_0%,#311710_45%,#0b0806_100%)]">
        <picture>
          <source type="image/avif" media={`${REDUCIR_MOVIMIENTO} and ${PANTALLA_VERTICAL}`} srcSet={VERTICAL.llena.avif} sizes={VERTICAL.sizes} width={VERTICAL.width} height={VERTICAL.height} />
          <source type="image/webp" media={`${REDUCIR_MOVIMIENTO} and ${PANTALLA_VERTICAL}`} srcSet={VERTICAL.llena.webp} sizes={VERTICAL.sizes} width={VERTICAL.width} height={VERTICAL.height} />
          <source type="image/avif" media={REDUCIR_MOVIMIENTO} srcSet={HORIZONTAL.llena.avif} sizes={HORIZONTAL.sizes} />
          <source type="image/webp" media={REDUCIR_MOVIMIENTO} srcSet={HORIZONTAL.llena.webp} sizes={HORIZONTAL.sizes} />
          <source type="image/avif" media={PANTALLA_VERTICAL} srcSet={VERTICAL.inicio.avif} sizes={VERTICAL.sizes} width={VERTICAL.width} height={VERTICAL.height} />
          <source type="image/webp" media={PANTALLA_VERTICAL} srcSet={VERTICAL.inicio.webp} sizes={VERTICAL.sizes} width={VERTICAL.width} height={VERTICAL.height} />
          <source type="image/avif" srcSet={HORIZONTAL.inicio.avif} sizes={HORIZONTAL.sizes} />
          <source type="image/webp" srcSet={HORIZONTAL.inicio.webp} sizes={HORIZONTAL.sizes} />
          <img
            src={HORIZONTAL.inicio.src}
            alt={alt}
            width={HORIZONTAL.width}
            height={HORIZONTAL.height}
            loading="eager"
            decoding="async"
            {...PRIORIDAD_ALTA}
            className={ENCUADRE}
          />
        </picture>

        {clip && (
          <video
            ref={videoRef}
            src={clip.video}
            width={clip.width}
            height={clip.height}
            muted
            autoPlay
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
            onPlay={() => setFase("andando")}
            onPause={(evento) => {
              if (!evento.currentTarget.ended) setFase("pausado");
            }}
            onEnded={() => {
              setFase("terminado");
              setLlena(true);
            }}
            className={ENCUADRE}
          />
        )}

        {/* La copa llena, en foto: lo que queda al terminar el vídeo. */}
        {llena && (
          <picture>
            <source type="image/avif" media={PANTALLA_VERTICAL} srcSet={VERTICAL.llena.avif} sizes={VERTICAL.sizes} width={VERTICAL.width} height={VERTICAL.height} />
            <source type="image/webp" media={PANTALLA_VERTICAL} srcSet={VERTICAL.llena.webp} sizes={VERTICAL.sizes} width={VERTICAL.width} height={VERTICAL.height} />
            <source type="image/avif" srcSet={HORIZONTAL.llena.avif} sizes={HORIZONTAL.sizes} />
            <source type="image/webp" srcSet={HORIZONTAL.llena.webp} sizes={HORIZONTAL.sizes} />
            <img
              src={HORIZONTAL.llena.src}
              alt=""
              aria-hidden="true"
              width={HORIZONTAL.width}
              height={HORIZONTAL.height}
              decoding="async"
              className={cn(ENCUADRE, "animate-in fade-in duration-700")}
            />
          </picture>
        )}

        {/* Arriba, sombra para la cabecera; abajo, la foto se funde con el
            oscuro donde va el texto. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.8)_0%,rgb(0_0_0/0.45)_13%,transparent_30%,transparent_42%,rgb(11_8_6/0.78)_74%,#0b0806_100%)] md:bg-[linear-gradient(to_bottom,rgb(0_0_0/0.55)_0%,transparent_32%,transparent_48%,rgb(11_8_6/0.72)_78%,#0b0806_100%)]"
        />
      </div>

      <div className="relative w-full px-6 pb-6 md:pb-10 apaisado:pb-4">{children}</div>

      {clip && (
        <button
          type="button"
          onClick={alternar}
          aria-label={etiqueta}
          className="absolute right-4 top-20 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/85 backdrop-blur-md transition-colors hover:border-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:bottom-6 md:right-6 md:top-auto"
        >
          <Icono className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </section>
  );
};

export default HeroCopa;

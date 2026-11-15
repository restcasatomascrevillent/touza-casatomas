import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { IMAGENES } from "@/assets/imagenes";
import { cn } from "@/lib/utils";
import { POSTER_HERO, VIDEO_HERO, hayVideo, pausar, reproducirSolo, videoPermitido } from "./medios";

/**
 * Mismo `sizes` en el vídeo y en el fondo desenfocado: así el navegador elige
 * el mismo fichero para los dos y solo lo descarga una vez.
 */
const SIZES = "(min-width: 1024px) 60vh, 100vw";

// React 18 aún no conoce `fetchPriority` en camelCase: se escribe en minúsculas.
const PRIORIDAD_ALTA = { fetchpriority: "high" } as Record<string, string>;

/**
 * Encuadre del vídeo y del póster. En el móvil la pantalla es más alta que
 * 9:16 y `object-cover` recorta los lados: centrado, la copa (a la derecha del
 * plano C029) quedaba cortada. Al 80 % entra entera y la T se corre a la
 * izquierda. Desde lg el marco ya es 9:16 y no recorta nada.
 */
const ENCUADRE = "object-[80%_50%] lg:object-center";

const ALT_POSTER = "Un cóctel en la barra de Touza, delante de la T iluminada";
const ALT_INTERIOR = "Interior de Touza: sofá corrido color mostaza, mesas de mármol y luz cálida";

/** El póster del vídeo o, si aún no existe, la foto del interior (recorte vertical). */
const ImagenHero = ({ prioridad, alt, className }: { prioridad: boolean; alt: string; className?: string }) => {
  const atributos = {
    alt,
    loading: "eager" as const,
    // El LCP, decodificado de una vez: que el primer pintado ya lo traiga.
    decoding: prioridad ? ("sync" as const) : ("async" as const),
    ...(prioridad ? PRIORIDAD_ALTA : {}),
    className: cn("absolute inset-0 h-full w-full object-cover", className),
  };
  if (VIDEO_HERO.poster) {
    return <img src={VIDEO_HERO.poster} width={POSTER_HERO.width} height={POSTER_HERO.height} {...atributos} />;
  }
  return (
    <picture className="contents">
      <source type="image/avif" srcSet={IMAGENES.interiorMovil.avif} sizes={SIZES} />
      <source type="image/webp" srcSet={IMAGENES.interiorMovil.webp} sizes={SIZES} />
      <img src={IMAGENES.interiorMovil.src} width={IMAGENES.interiorMovil.width} height={IMAGENES.interiorMovil.height} {...atributos} />
    </picture>
  );
};

/**
 * Relleno de los laterales en escritorio: la misma imagen, muy desenfocada y
 * oscura, a todo el ancho. Así el escenario no se ve vacío y el vídeo
 * vertical no hay que estirarlo. Es estática (el póster): una segunda copia
 * del vídeo costaría decodificarlo dos veces.
 */
export const HeroFondo = () => (
  <ImagenHero prioridad={false} alt="" className="scale-125 blur-3xl brightness-[0.62] saturate-[1.15]" />
);

interface HeroVideoProps {
  /** Dónde va el botón de pausa dentro del marco. */
  botonClassName?: string;
}

/**
 * Medio del hero: una imagen que es el LCP y, encima, el bucle de vídeo.
 *
 * - En el HTML del SSG solo hay un <img fetchpriority="high">: el póster del
 *   vídeo o, si aún no existe, la foto del interior (recorte vertical).
 * - Ya en el navegador, después de `load`, se inserta el
 *   <video autoplay muted loop playsinline> con WebM y MP4 y funde encima de
 *   la imagen cuando puede reproducirse (`canplay`).
 * - Sin vídeo con «reducir movimiento», ahorro de datos o 3G (`videoPermitido`).
 * - Se pausa al salir de pantalla y solo hay un vídeo en marcha en la portada.
 * - Si el bucle dura más de 5 s, botón de pausa (WCAG 2.2.2).
 */
const HeroVideo = ({ botonClassName }: HeroVideoProps) => {
  const [montado, setMontado] = useState(false);
  const [listo, setListo] = useState(false);
  const [largo, setLargo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pausadoAMano = useRef(false);

  // Insertar el vídeo cuando la página ya ha cargado (no compite con el LCP).
  useEffect(() => {
    if (!hayVideo(VIDEO_HERO) || !videoPermitido()) return;
    let temporizador: number | undefined;
    const montar = () => {
      temporizador = window.setTimeout(() => setMontado(true), 150);
    };
    if (document.readyState === "complete") montar();
    else window.addEventListener("load", montar, { once: true });
    return () => {
      window.removeEventListener("load", montar);
      window.clearTimeout(temporizador);
    };
  }, []);

  // En marcha solo mientras se ve (y si no lo ha pausado quien mira).
  useEffect(() => {
    const video = videoRef.current;
    if (!montado || !video || typeof IntersectionObserver === "undefined") return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          if (!pausadoAMano.current) reproducirSolo(video);
        } else {
          pausar(video);
        }
      },
      { threshold: 0.2 }
    );
    observador.observe(video);
    return () => {
      observador.disconnect();
      pausar(video);
    };
  }, [montado]);

  const alternar = () => {
    const video = videoRef.current;
    if (!video) return;
    pausadoAMano.current = !pausadoAMano.current;
    setPausado(pausadoAMano.current);
    if (pausadoAMano.current) pausar(video);
    else reproducirSolo(video);
  };

  return (
    <>
      <ImagenHero prioridad alt={VIDEO_HERO.poster ? ALT_POSTER : ALT_INTERIOR} className={ENCUADRE} />

      {montado && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          poster={VIDEO_HERO.poster}
          onCanPlay={() => setListo(true)}
          onLoadedMetadata={(e) => setLargo(e.currentTarget.duration > 5)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out",
            ENCUADRE,
            listo ? "opacity-100" : "opacity-0"
          )}
        >
          {VIDEO_HERO.webm && <source src={VIDEO_HERO.webm} type="video/webm" />}
          {VIDEO_HERO.mp4 && <source src={VIDEO_HERO.mp4} type="video/mp4" />}
        </video>
      )}

      {montado && listo && largo && (
        <button
          type="button"
          onClick={alternar}
          aria-label={pausado ? "Reanudar el vídeo" : "Pausar el vídeo"}
          title={pausado ? "Reanudar el vídeo" : "Pausar el vídeo"}
          className={cn(
            "pointer-events-auto absolute z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/85 backdrop-blur-md transition-colors hover:border-white/50 hover:text-white",
            botonClassName
          )}
        >
          {pausado ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
        </button>
      )}
    </>
  );
};

export default HeroVideo;

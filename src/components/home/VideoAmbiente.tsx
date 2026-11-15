import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { hayVideo, pausar, reproducirSolo, videoPermitido, type FuentesVideo } from "./medios";

/** Fracción visible mínima para ponerse en marcha. */
const VISIBLE_PARA_REPRODUCIR = 0.35;
const UMBRALES = Array.from({ length: 11 }, (_, i) => i / 10);

/**
 * Los vídeos de ambiente de una misma zona se reparten la reproducción: va en
 * marcha el que más superficie enseña (por encima del umbral) y los demás se
 * quedan en su fotograma. Así, si «El local» enseña a la vez el marco grande y
 * la pared de madera, no se pisan al hacer scroll.
 */
const superficie = new Map<HTMLVideoElement, { area: number; fraccion: number }>();
const pausadosAMano = new Set<HTMLVideoElement>();

function elegirAmbiente() {
  let mejor: HTMLVideoElement | null = null;
  let mayor = 0;
  for (const [video, { area, fraccion }] of superficie) {
    if (pausadosAMano.has(video) || fraccion < VISIBLE_PARA_REPRODUCIR) continue;
    if (area > mayor) {
      mejor = video;
      mayor = area;
    }
  }
  for (const video of superficie.keys()) {
    if (video !== mejor && !video.paused) pausar(video);
  }
  if (mejor?.paused) reproducirSolo(mejor);
}

interface VideoAmbienteProps {
  /** El clip de siempre (en «El local», el vertical). */
  clip: FuentesVideo;
  medidas: { width: number; height: number };
  /** Otro clip cuando se cumple `media` (el horizontal, en escritorio). */
  alternativo?: { clip: FuentesVideo; media: string; medidas: { width: number; height: number } };
  /** Texto alternativo del póster; vacío si es decorativo. */
  alt: string;
  /** Nombre del botón de pausa ("Pausar el vídeo de las vitrinas"). */
  etiquetaPausa: string;
  /** Encuadre (object-position) del póster y del vídeo. */
  className?: string;
  botonClassName?: string;
}

/**
 * Vídeo decorativo que rellena su marco (el padre lo posiciona y le da
 * tamaño). Mismo patrón que la franja de clips:
 *
 * - En el HTML del SSG solo está el póster (<picture> con `loading="lazy"`):
 *   no compite con el LCP y, con dos clips, el <source media> hace que el
 *   navegador baje solo el póster que toca.
 * - En el navegador, el <video muted loop playsinline preload="metadata">
 *   se crea al acercarse (300 px antes), arranca al entrar en pantalla y se
 *   pausa al salir. Lleva `.foto-asienta`, como el póster, para no saltar si
 *   aparece durante el destapado de <Reveal>.
 * - Con «reducir movimiento», ahorro de datos o 3G: solo el póster.
 * - Repite en bucle más de 5 s: botón para pararlo (WCAG 2.2.2).
 */
const VideoAmbiente = ({ clip, medidas, alternativo, alt, etiquetaPausa, className, botonClassName }: VideoAmbienteProps) => {
  const [conVideo, setConVideo] = useState(false);
  const [cerca, setCerca] = useState(false);
  const [pausado, setPausado] = useState(false);
  const marco = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const usaAlternativo = useMediaQuery(alternativo?.media ?? "not all");
  const fuentes = alternativo && usaAlternativo ? alternativo.clip : clip;

  useEffect(() => setConVideo(hayVideo(clip) && videoPermitido()), [clip]);

  // Crear el vídeo al acercarse; medir cuánto se ve para decidir cuál va en marcha.
  useEffect(() => {
    const el = marco.current;
    if (!conVideo || !el || typeof IntersectionObserver === "undefined") return;
    const acercarse = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setCerca(true);
          acercarse.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    acercarse.observe(el);
    return () => acercarse.disconnect();
  }, [conVideo]);

  useEffect(() => {
    const el = marco.current;
    const video = videoRef.current;
    if (!cerca || !el || !video || typeof IntersectionObserver === "undefined") return;
    video.muted = true;
    video.defaultMuted = true;
    superficie.set(video, { area: 0, fraccion: 0 });
    const observador = new IntersectionObserver(
      ([entrada]) => {
        const { width, height } = entrada.intersectionRect;
        superficie.set(video, {
          area: entrada.isIntersecting ? width * height : 0,
          fraccion: entrada.isIntersecting ? entrada.intersectionRatio : 0,
        });
        elegirAmbiente();
      },
      { threshold: UMBRALES }
    );
    observador.observe(el);
    return () => {
      observador.disconnect();
      superficie.delete(video);
      pausadosAMano.delete(video);
      pausar(video);
    };
    // `fuentes` cambia el vídeo (key): hay que volver a registrarlo.
  }, [cerca, fuentes]);

  const alternar = () => {
    const video = videoRef.current;
    if (!video) return;
    if (pausadosAMano.has(video)) pausadosAMano.delete(video);
    else pausadosAMano.add(video);
    setPausado(pausadosAMano.has(video));
    elegirAmbiente();
  };

  const encuadre = cn("absolute inset-0 h-full w-full object-cover", className);

  return (
    <div ref={marco} className="absolute inset-0">
      <picture className="contents">
        {alternativo?.clip.poster && (
          <source
            type="image/webp"
            media={alternativo.media}
            srcSet={alternativo.clip.poster}
            width={alternativo.medidas.width}
            height={alternativo.medidas.height}
          />
        )}
        <img
          src={clip.poster}
          alt={alt}
          width={medidas.width}
          height={medidas.height}
          loading="lazy"
          decoding="async"
          className={cn("foto-asienta", encuadre)}
        />
      </picture>

      {conVideo && cerca && (
        <video
          key={fuentes === clip ? "base" : "alternativo"}
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          poster={fuentes.poster}
          className={cn("foto-asienta", encuadre)}
        >
          {fuentes.webm && <source src={fuentes.webm} type="video/webm" />}
          {fuentes.mp4 && <source src={fuentes.mp4} type="video/mp4" />}
        </video>
      )}

      {conVideo && cerca && (
        <button
          type="button"
          onClick={alternar}
          aria-label={pausado ? etiquetaPausa.replace(/^Pausar/, "Reanudar") : etiquetaPausa}
          className={cn(
            "absolute z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/85 backdrop-blur-md transition-colors hover:border-white/50 hover:text-white",
            botonClassName
          )}
        >
          {pausado ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
        </button>
      )}
    </div>
  );
};

export default VideoAmbiente;

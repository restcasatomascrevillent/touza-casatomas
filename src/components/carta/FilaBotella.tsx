import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FOTO_BOTELLA, fotoResponsive, volverAFotoOriginal } from "@/lib/foto";

/**
 * Una fila de la carta: botella, copa o cóctel sin foto propia («la vitrina»).
 *
 * La foto va en un nicho estrecho 3:5 con luz cálida desde abajo, como la
 * estantería retroiluminada de la barra; al lado, nombre y precio unidos por
 * una línea de puntos (el gesto de las cartas de bar) y debajo una sola línea
 * de descripción con «más» para leerla entera.
 *
 * Mismo alto de fila con foto o sin ella: si alguna fila de la lista tiene
 * foto (`conHueco`), las que no la tienen guardan el hueco del nicho y todos
 * los nombres arrancan en la misma columna. En listas sin ninguna foto
 * (cervezas) no hay hueco.
 *
 * La descripción larga va en un `<details>` nativo: funciona sin JS y el
 * texto entero está en el HTML (lo leen Google y los asistentes), solo que
 * plegado a una línea.
 *
 * La entrada (`.fila-botella` en index.css) es una animación CSS que se
 * dispara cada vez que la pestaña pasa de oculta a visible, escalonada con
 * `--i`. Sin JS el contenido está igual; con reduced-motion no se anima.
 *
 * La foto (ver `FotoNicho`) sube dentro del nicho solo cuando ya ha llegado:
 * mientras tanto el nicho enseña su fondo cálido, nunca un hueco negro. Se
 * pide a su tamaño real (60–68 px, ~5 KB por Vercel Image Optimization; ver
 * src/lib/foto.ts), no la original de 900×1500 y ~550 KB.
 *
 * Las filas sin foto en una lista con fotos (`conHueco`) llevan en el hueco
 * la silueta tenue de una botella: el hueco vacío parecía una foto rota.
 */
interface Props {
  nombre: string;
  precio: string;
  descripcion?: string;
  tipo?: string;
  imagen?: string;
  indice: number;
  /** Reserva el hueco del nicho aunque esta fila no tenga foto. */
  conHueco?: boolean;
  /** Nivel del título del producto: 4 cuando la lista va agrupada (h3 = grupo). */
  nivel?: 3 | 4;
  /** Ancla de la fila (`/carta#slug`). */
  id?: string;
  /** Si existe, toda la fila es un botón (abre el detalle del cóctel). */
  alPulsar?: () => void;
  etiquetaBoton?: string;
  /** Debajo de la descripción (etiquetas de alérgenos). */
  children?: ReactNode;
  /**
   * Primeras filas de la pestaña VISIBLE: sin `lazy` y con prioridad alta.
   * Nunca en una pestaña oculta: competiría con lo que sí se ve.
   */
  prioritaria?: boolean;
}

type EstadoFoto = "esperando" | "lista" | "llego";

/**
 * Foto de la botella en su nicho. En el HTML del SSG no lleva `data-foto` y
 * se ve tal cual. Ya en el navegador: si la foto aún no ha llegado, espera
 * oculta («esperando», con el fondo cálido del nicho a la vista) y al cargar
 * sube con la animación del nicho («llego»); si ya estaba (caché o precarga),
 * sube con la entrada escalonada de la fila («lista»). Los estilos, en
 * index.css (`.nicho-botella[data-foto]`).
 */
const FotoNicho = ({ src, alt, prioritaria }: { src: string; alt: string; prioritaria: boolean }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [estado, setEstado] = useState<EstadoFoto | undefined>(undefined);
  const foto = fotoResponsive(src, FOTO_BOTELLA.anchos, FOTO_BOTELLA.sizes);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    // Falló antes de hidratar (en el HTML del SSG): se reintenta con la original.
    if (img.complete && img.naturalWidth === 0 && img.currentSrc && volverAFotoOriginal(img, src)) {
      setEstado("esperando");
      return;
    }
    setEstado(img.complete && img.naturalWidth > 0 ? "lista" : "esperando");
  }, [src]);

  return (
    <div
      data-foto={estado}
      className="nicho-botella relative w-[60px] shrink-0 overflow-hidden rounded-[4px] ring-1 ring-inset ring-white/[0.08] aspect-[3/5] md:w-[68px]"
    >
      <img
        ref={imgRef}
        src={foto.src}
        srcSet={foto.srcSet}
        sizes={foto.sizes}
        alt={alt}
        width={120}
        height={200}
        loading={prioritaria ? "eager" : "lazy"}
        {...(prioritaria ? { fetchpriority: "high" } : {})}
        decoding="async"
        onLoad={() => setEstado((previo) => (previo === "esperando" ? "llego" : previo ?? "lista"))}
        // Si falla la optimizada, la original; si falla también, se queda el
        // fondo cálido del nicho (sin icono de imagen rota).
        onError={(evento) => {
          volverAFotoOriginal(evento.currentTarget, src);
          setEstado("esperando");
        }}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <span aria-hidden="true" className="luz-nicho pointer-events-none absolute inset-0" />
    </div>
  );
};

/**
 * Hueco del nicho en las filas sin foto de una lista con fotos: la silueta de
 * una botella al 8 %, para que se lea como intencionado y no como una foto
 * que no ha cargado.
 */
const SiluetaBotella = () => (
  <div aria-hidden="true" className="flex w-[60px] shrink-0 aspect-[3/5] items-end justify-center pb-1 md:w-[68px]">
    <svg viewBox="0 0 24 60" className="h-[82%] w-auto text-white/[0.08]" fill="currentColor">
      <path d="M9.5 0h5v3h-.6v9.2c0 1.6.7 3 1.9 4.2 2.6 2.4 4.2 5.7 4.2 9.3V57a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V25.7c0-3.6 1.6-6.9 4.2-9.3 1.2-1.2 1.9-2.6 1.9-4.2V3h-.6z" />
    </svg>
  </div>
);

/** Por debajo de esto la descripción cabe en una línea y no hace falta «más». */
const LARGO_UNA_LINEA = 64;

const NUMEROS = "[font-variant-numeric:lining-nums]";

const Descripcion = ({ texto, plegable }: { texto: string; plegable: boolean }) => {
  const clases = "text-[14px] leading-[1.65] text-white/70";
  if (!plegable || texto.length <= LARGO_UNA_LINEA) {
    return <p className={cn("mt-1 max-w-[56ch] line-clamp-2", clases, NUMEROS)}>{texto}</p>;
  }
  return (
    <details className="group/desc mt-1 max-w-[56ch]">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-baseline gap-2 rounded-sm [&::-webkit-details-marker]:hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          clases,
          NUMEROS
        )}
      >
        <span className="min-w-0 flex-1 truncate group-open/desc:whitespace-normal">{texto}</span>
        <span aria-hidden="true" className="shrink-0 text-[13px] text-[#D8B47E] group-open/desc:hidden">
          más
        </span>
      </summary>
    </details>
  );
};

const FilaBotella = ({
  nombre,
  precio,
  descripcion,
  tipo,
  imagen,
  indice,
  conHueco = false,
  nivel = 3,
  id,
  alPulsar,
  etiquetaBoton,
  children,
  prioritaria = false,
}: Props) => {
  const Titulo = nivel === 4 ? "h4" : "h3";
  return (
    <li
      id={id}
      className={cn(
        "fila-botella group relative flex min-w-0 items-center gap-4 border-t border-white/[0.07] py-4 md:gap-5 md:py-5",
        id && "scroll-mt-36"
      )}
      style={{ "--i": Math.min(indice, 10) } as CSSProperties}
    >
      {alPulsar && (
        <button
          type="button"
          onClick={alPulsar}
          aria-label={etiquetaBoton ?? nombre}
          className="absolute inset-0 z-10 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      )}
      {imagen ? (
        <FotoNicho src={imagen} alt={nombre} prioritaria={prioritaria} />
      ) : (
        conHueco && <SiluetaBotella />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <Titulo
            className={cn(
              "min-w-0 font-serif text-[1.15rem] leading-snug text-[#F3EEE4] transition-colors duration-500 [overflow-wrap:anywhere] group-hover:text-[#D8B47E] md:text-[1.35rem]",
              NUMEROS
            )}
          >
            {nombre}
          </Titulo>
          <span aria-hidden="true" className="min-w-4 flex-1 -translate-y-[0.3em] border-b border-dotted border-white/20" />
          {precio && (
            <span className="shrink-0 whitespace-nowrap font-serif text-[1.15rem] text-primary [font-variant-numeric:lining-nums_tabular-nums] md:text-[1.35rem]">
              {precio}
            </span>
          )}
        </div>
        {tipo && <p className={cn("mt-0.5 text-[13px] text-white/60", NUMEROS)}>{tipo}</p>}
        {/* Con la fila entera pulsable, un <details> dentro no se podría abrir:
            la descripción va en dos líneas y el resto en el detalle. */}
        {descripcion && <Descripcion texto={descripcion} plegable={!alPulsar} />}
        {children}
      </div>
    </li>
  );
};

export default FilaBotella;

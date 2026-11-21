import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOTO_BOTELLA, fotoResponsive, volverAFotoOriginal } from "@/lib/foto";

/**
 * Una fila de la carta: botella, copa o cóctel sin foto propia («la vitrina»).
 *
 * La foto va en un nicho estrecho 3:5 con luz cálida desde abajo, como la
 * estantería retroiluminada de la barra; al lado, nombre y precio unidos por
 * una línea de puntos (el gesto de las cartas de bar). La descripción no se
 * ve de primeras: junto al nombre va una «i» (como la de los platos en la web
 * de Casa Tomás) que la despliega entera debajo; sin descripción, no hay «i»
 * (petición del dueño, 21/11/2026: antes salía cortada con «…» y un «más»).
 *
 * Mismo alto de fila con foto o sin ella: si alguna fila de la lista tiene
 * foto (`conHueco`), las que no la tienen guardan el hueco del nicho y todos
 * los nombres arrancan en la misma columna. En listas sin ninguna foto
 * (cervezas) no hay hueco.
 *
 * La descripción desplegable va en el HTML del SSG aunque esté plegada
 * (`hidden`): la leen Google y los asistentes. La «i» es un botón con
 * `aria-expanded` y `aria-controls`; su zona táctil es de 44 px aunque el
 * círculo que se ve sea más pequeño.
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
  /** Precio por copa («13,50 €») de una botella que también se sirve por copa: va en la «i». */
  porCopa?: string;
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

const NUMEROS = "[font-variant-numeric:lining-nums]";

const TEXTO_DESCRIPCION = "text-[14px] leading-[1.65] text-white/70";

/** La «i» de la fila: despliega la descripción entera debajo del nombre. */
const BotonInfo = ({
  nombre,
  abierta,
  controla,
  alPulsar,
}: {
  nombre: string;
  abierta: boolean;
  controla: string;
  alPulsar: () => void;
}) => (
  <button
    type="button"
    onClick={alPulsar}
    aria-expanded={abierta}
    aria-controls={controla}
    aria-label={`Más información de ${nombre}`}
    // Alineada con la primera línea del nombre (no a media altura cuando el
    // nombre ocupa dos): 44 px de zona táctil centrados en esa línea.
    className="group/info relative -my-2.5 -ml-2 -mr-1.5 inline-flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-full focus-visible:outline-none md:-my-[7px]"
  >
    <span
      aria-hidden="true"
      className={cn(
        // Sin aro propio: el icono «Info» ya es un círculo con la «i» y el
        // aro dibujaba un doble círculo (pedido del dueño, 21/11/2026).
        "flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-300",
        "group-focus-visible/info:ring-2 group-focus-visible/info:ring-primary",
        abierta
          ? "bg-[#D8B47E] text-black"
          : "text-[#D8B47E]/85 group-hover/info:text-[#D8B47E]"
      )}
    >
      {abierta ? <X className="h-4 w-4" strokeWidth={2} /> : <Info className="h-[22px] w-[22px]" strokeWidth={1.6} />}
    </span>
  </button>
);

const FilaBotella = ({
  nombre,
  precio,
  descripcion,
  tipo,
  porCopa,
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
  // Con la fila entera pulsable (cócteles sin foto) no cabe otro botón: la
  // descripción va a la vista en dos líneas y el resto, en el detalle.
  // En la «i» va todo lo que no es nombre y precio: tipo, descripción y
  // precio por copa. Así todas las pestañas de bebidas tienen la misma fila.
  const conInfo = !alPulsar && !!(descripcion || tipo || porCopa);
  const [abierta, setAbierta] = useState(false);
  const idDescripcion = useId();
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
          {conInfo && (
            <BotonInfo
              nombre={nombre}
              abierta={abierta}
              controla={idDescripcion}
              alPulsar={() => setAbierta((previa) => !previa)}
            />
          )}
          <span aria-hidden="true" className="min-w-4 flex-1 -translate-y-[0.3em] border-b border-dotted border-white/20" />
          {precio && (
            <span className="shrink-0 whitespace-nowrap font-serif text-[1.15rem] text-primary [font-variant-numeric:lining-nums_tabular-nums] md:text-[1.35rem]">
              {precio}
            </span>
          )}
        </div>
        {conInfo ? (
          <div
            id={idDescripcion}
            hidden={!abierta}
            className={cn("descripcion-botella mt-1.5 max-w-[56ch] space-y-1", TEXTO_DESCRIPCION, NUMEROS)}
          >
            {tipo && <p className="text-[13px] text-white/60">{tipo}</p>}
            {descripcion && <p>{descripcion}</p>}
            {porCopa && (
              <p className="text-[#D8B47E]">
                Por copa: <span className="[font-variant-numeric:lining-nums_tabular-nums]">{porCopa}</span>
              </p>
            )}
          </div>
        ) : (
          <>
            {tipo && <p className={cn("mt-0.5 text-[13px] text-white/60", NUMEROS)}>{tipo}</p>}
            {descripcion && (
              <p className={cn("mt-1 max-w-[56ch] line-clamp-2", TEXTO_DESCRIPCION, NUMEROS)}>{descripcion}</p>
            )}
          </>
        )}
        {children}
      </div>
    </li>
  );
};

export default FilaBotella;

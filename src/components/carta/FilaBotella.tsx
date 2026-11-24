import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FOTO_BOTELLA, FOTO_DETALLE, fotoResponsive, volverAFotoOriginal } from "@/lib/foto";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/**
 * Una fila de la carta: botella, copa o cóctel sin foto propia («la vitrina»).
 *
 * La foto va en un nicho 3:5 con luz cálida desde abajo, como la estantería
 * retroiluminada de la barra; al lado, nombre y precio unidos por una línea
 * de puntos (el gesto de las cartas de bar) y, debajo, el tipo, la
 * descripción ENTERA y el precio por copa, siempre a la vista. Pedido del
 * dueño (24/11/2026): más presencia a las botellas. El nicho pasó de 60/68 px
 * a 96/120 px y, con ese alto, la descripción cabe sin «…» y sin la «i» que
 * la desplegaba (21/11/2026).
 *
 * Mismo arranque de texto con foto o sin ella: si alguna fila de la pestaña
 * tiene foto (`conHueco`), las que no la tienen guardan el hueco del nicho
 * (la silueta tenue de una botella) y todos los nombres arrancan en la misma
 * columna. En pestañas sin ninguna foto no hay hueco: una columna de siluetas
 * grandes parecía una carta rota.
 *
 * La entrada (`.fila-botella` en index.css) es una animación CSS que se
 * dispara cada vez que la pestaña pasa de oculta a visible, escalonada con
 * `--i`. Sin JS el contenido está igual; con reduced-motion no se anima.
 *
 * La foto (ver `FotoNicho`) sube dentro del nicho solo cuando ya ha llegado:
 * mientras tanto el nicho enseña su fondo cálido, nunca un hueco negro. Se
 * pide a su tamaño real (96–120 px por Vercel Image Optimization; ver
 * src/lib/foto.ts), no la original de 900×1500 y ~550 KB.
 */
interface Props {
  nombre: string;
  precio: string;
  descripcion?: string;
  tipo?: string;
  /** Precio por copa («13,50 €») de una botella que también se sirve por copa. */
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

/** Ancho del nicho: 96 px en el móvil y 120 px desde md (= `FOTO_BOTELLA.sizes`). */
const ANCHO_NICHO = "w-[96px] md:w-[120px]";

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
      className={cn("nicho-botella relative shrink-0 overflow-hidden rounded-[4px] ring-1 ring-inset ring-white/[0.08] aspect-[3/5]", ANCHO_NICHO)}
    >
      <img
        ref={imgRef}
        src={foto.src}
        srcSet={foto.srcSet}
        sizes={foto.sizes}
        alt={alt}
        width={240}
        height={400}
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

/** `sizes` de la foto grande del visor (su caja mide como mucho 420 px). */
const SIZES_VISOR = "(min-width: 768px) 420px, 80vw";

/** Ancho de la caja del visor: 3:5 y, con el nombre debajo, cabe en la pantalla. */
const ANCHO_VISOR = "w-[min(80vw,420px,calc(78vh*0.6))]";

/**
 * Pide ya la foto grande del visor (al pasar el ratón, al tocar o al enfocar
 * el botón) con el mismo srcset y sizes que la <img> del visor: al abrirlo,
 * el navegador la encuentra en la caché. `sizes` y `srcset` antes que `src`,
 * para que elija el candidato una sola vez.
 */
function precargarGrande(foto: { src: string; srcSet?: string; sizes?: string }) {
  if (typeof Image === "undefined") return;
  const img = new Image();
  (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = "high";
  img.decoding = "async";
  if (foto.srcSet) {
    img.sizes = foto.sizes ?? SIZES_VISOR;
    img.srcset = foto.srcSet;
  }
  img.src = foto.src;
}

/**
 * Lo de dentro del visor. La caja tiene su tamaño definitivo (3:5, como las
 * fotos de 900×1500) desde el primer fotograma, con el nombre debajo: nunca
 * sale el nombre solo ni la caja crece al llegar la foto (pedido del dueño,
 * 24/11/2026). De base, la miniatura del nicho (misma URL y srcset: ya está
 * en caché) a tamaño completo y algo desenfocada; encima, la grande, que
 * entra con un fundido al cargar. Si la grande ya estaba (precargada), sale
 * directamente. Con reduced-motion, sin fundido (index.css, `.visor-botella`).
 */
const FotoVisor = ({ src, nombre }: { src: string; nombre: string }) => {
  const miniatura = fotoResponsive(src, FOTO_BOTELLA.anchos, FOTO_BOTELLA.sizes);
  const grande = fotoResponsive(src, FOTO_DETALLE.anchos, SIZES_VISOR);
  const imgRef = useRef<HTMLImageElement>(null);
  const [estado, setEstado] = useState<"cargando" | "ya" | "llego">("cargando");

  // Antes de pintar: si la grande ya está en caché, sin fundido.
  useLayoutEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setEstado("ya");
  }, []);

  return (
    <div
      data-grande={estado}
      className={cn("visor-botella relative aspect-[3/5] overflow-hidden rounded-xl bg-[#19120b]", ANCHO_VISOR)}
    >
      <img
        src={miniatura.src}
        srcSet={miniatura.srcSet}
        sizes={miniatura.sizes}
        alt=""
        aria-hidden="true"
        width={240}
        height={400}
        decoding="async"
        onError={(evento) => volverAFotoOriginal(evento.currentTarget, src)}
        className="absolute inset-0 h-full w-full scale-105 object-cover blur-[6px]"
      />
      <img
        ref={imgRef}
        src={grande.src}
        srcSet={grande.srcSet}
        sizes={grande.sizes}
        alt={nombre}
        width={900}
        height={1500}
        decoding="async"
        {...{ fetchpriority: "high" }}
        onLoad={() => setEstado((previo) => (previo === "cargando" ? "llego" : previo))}
        onError={(evento) => volverAFotoOriginal(evento.currentTarget, src)}
        className="visor-grande absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
};

/**
 * La foto del nicho es un botón que la amplía (pedido del dueño, 21/11/2026):
 * la botella entera, con su fondo de pared trenzada, y el nombre debajo.
 */
const FotoAmpliable = ({ src, nombre, prioritaria }: { src: string; nombre: string; prioritaria: boolean }) => {
  const [abierta, setAbierta] = useState(false);
  const precargada = useRef(false);
  const precargar = () => {
    if (precargada.current) return;
    precargada.current = true;
    precargarGrande(fotoResponsive(src, FOTO_DETALLE.anchos, SIZES_VISOR));
  };
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        onPointerEnter={precargar}
        onPointerDown={precargar}
        onTouchStart={precargar}
        onFocus={precargar}
        aria-label={`Ampliar la foto de ${nombre}`}
        className="relative z-20 shrink-0 cursor-zoom-in rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <FotoNicho src={src} alt={nombre} prioritaria={prioritaria} />
      </button>
      <Dialog open={abierta} onOpenChange={setAbierta}>
        <DialogContent className="w-auto max-w-none gap-3 border-white/10 bg-[#0b0b0a] p-3 md:p-4">
          <FotoVisor src={src} nombre={nombre} />
          <DialogTitle
            className={cn("px-1 pb-1 text-center font-serif text-xl font-medium text-[#F3EEE4]", ANCHO_VISOR)}
          >
            {nombre}
          </DialogTitle>
          <DialogDescription className="sr-only">Foto de la botella de {nombre}</DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};

/**
 * Hueco del nicho en las filas sin foto de una lista con fotos: la silueta de
 * una botella al 8 %, para que se lea como intencionado y no como una foto
 * que no ha cargado.
 */
const SiluetaBotella = () => (
  <div aria-hidden="true" className={cn("flex shrink-0 aspect-[3/5] items-end justify-center pb-2", ANCHO_NICHO)}>
    <svg viewBox="0 0 24 60" className="h-[82%] w-auto text-white/[0.08]" fill="currentColor">
      <path d="M9.5 0h5v3h-.6v9.2c0 1.6.7 3 1.9 4.2 2.6 2.4 4.2 5.7 4.2 9.3V57a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V25.7c0-3.6 1.6-6.9 4.2-9.3 1.2-1.2 1.9-2.6 1.9-4.2V3h-.6z" />
    </svg>
  </div>
);

const NUMEROS = "[font-variant-numeric:lining-nums]";

const TEXTO_DESCRIPCION = "text-[14px] leading-[1.65] text-white/70";

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
  // Con la fila entera pulsable (cócteles sin foto) la descripción va en dos
  // líneas y el resto, en el detalle del cóctel. Las botellas, entera.
  const descripcionEntera = !alPulsar;
  const conNicho = !!imagen || conHueco;
  return (
    <li
      id={id}
      className={cn(
        "fila-botella group relative flex min-w-0 gap-4 border-t border-white/[0.07] py-5 md:gap-6 md:py-6",
        // Con nicho, el texto arranca arriba, a la altura de la foto; sin él
        // (cócteles sin foto), centrado como antes.
        conNicho ? "items-start" : "items-center py-4 md:py-5",
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
        alPulsar ? (
          <FotoNicho src={imagen} alt={nombre} prioritaria={prioritaria} />
        ) : (
          <FotoAmpliable src={imagen} nombre={nombre} prioritaria={prioritaria} />
        )
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
        {descripcion && (
          <p className={cn("mt-1.5 max-w-[60ch]", !descripcionEntera && "line-clamp-2", TEXTO_DESCRIPCION, NUMEROS)}>
            {descripcion}
          </p>
        )}
        {porCopa && (
          <p className={cn("mt-1.5 text-[14px] text-[#D8B47E]", NUMEROS)}>
            Por copa: <span className="[font-variant-numeric:lining-nums_tabular-nums]">{porCopa}</span>
          </p>
        )}
        {children}
      </div>
    </li>
  );
};

export default FilaBotella;

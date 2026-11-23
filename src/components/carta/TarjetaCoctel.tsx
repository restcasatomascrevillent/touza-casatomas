import { useEffect, useRef } from "react";
import type { CoctelUI } from "@/hooks/useCocteles";
import { FOTO_TARJETA, fotoResponsive, volverAFotoOriginal } from "@/lib/foto";

/**
 * Tarjeta de un cóctel CON foto propia (los que no la tienen van como fila de
 * texto, ver Carta.tsx).
 *
 * - Precio en dorado junto al nombre, sin píldora encima de la foto.
 * - Hover limpio: la foto se acerca un 3 % y el nombre pasa a dorado. Nada
 *   encima de la foto: el producto se tiene que ver justo cuando se mira.
 * - `<img>` normal, sin fundido ni esqueleto: cuando llegan los datos frescos
 *   de Supabase y cambia la URL, el navegador cambia la foto sin que la
 *   rejilla se quede en negro y vuelva con un fundido.
 * - La foto se pide a su tamaño (~160–270 px de ancho, con srcset; ver
 *   src/lib/foto.ts), no la original de 900×1200. Mientras llega, el hueco
 *   enseña el degradado cálido del nicho de las botellas, no un gris.
 * - Las primeras de la rejilla (`prioritaria`), sin `lazy`.
 * - Si la foto no carga (también si falló antes de hidratar, en el HTML del
 *   SSG), primero se reintenta con la original y, si tampoco, avisa con
 *   `alFallar` y la página pasa el cóctel a la lista de texto.
 */
interface Props {
  coctel: CoctelUI;
  /** Ancla (`/carta#moscow-mule`). */
  id: string;
  alAbrir: () => void;
  alFallar: () => void;
  /** Primeras tarjetas de la rejilla: sin `lazy`. */
  prioritaria?: boolean;
}

const TarjetaCoctel = ({ coctel, id, alAbrir, alFallar, prioritaria = false }: Props) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const foto = fotoResponsive(coctel.image, FOTO_TARJETA.anchos, FOTO_TARJETA.sizes);

  useEffect(() => {
    const img = imgRef.current;
    // `complete` con `naturalWidth` 0: la foto falló antes de que React
    // escuchara el `error`. Una diferida aún sin pedir da `complete` false.
    if (img?.complete && img.naturalWidth === 0 && img.currentSrc && !volverAFotoOriginal(img, coctel.image)) alFallar();
    // Solo al cambiar de foto: `alFallar` es una función nueva en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coctel.image]);

  return (
    <article id={id} className="group relative scroll-mt-36">
      {/* Botón que cubre la tarjeta: el detalle se abre también con teclado. */}
      <button
        type="button"
        onClick={alAbrir}
        aria-label={`Ver detalle de ${coctel.name}, ${coctel.price}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      />
      <div className="marco-zoom fondo-foto relative mb-3 aspect-[3/4] overflow-hidden rounded-2xl md:mb-4">
        <img
          ref={imgRef}
          src={foto.src}
          srcSet={foto.srcSet}
          sizes={foto.sizes}
          alt={coctel.name}
          width={900}
          height={1200}
          loading={prioritaria ? "eager" : "lazy"}
          decoding="async"
          onError={(evento) => {
            if (!volverAFotoOriginal(evento.currentTarget, coctel.image)) alFallar();
          }}
          className="foto-zoom h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 font-serif text-[1.05rem] leading-tight text-white transition-colors duration-500 [font-variant-numeric:lining-nums] group-hover:text-[#D8B47E] md:text-lg">
          {coctel.name}
        </h3>
        {coctel.price && (
          <span className="shrink-0 font-serif text-[1.05rem] leading-tight text-primary [font-variant-numeric:lining-nums_tabular-nums] md:text-lg">
            {coctel.price}
          </span>
        )}
      </div>
      {/* Rediseño A (21/11/2026): en la rejilla, nombre y precio, poca letra.
          La descripción sigue en el HTML para buscadores y lectores de
          pantalla, y entera en el detalle al pulsar la tarjeta. */}
      {coctel.description && <p className="sr-only">{coctel.description}</p>}
      {coctel.alergenos.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {coctel.alergenos.map((alergeno) => (
            <span
              key={alergeno}
              className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-white/70"
            >
              {alergeno}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

export default TarjetaCoctel;

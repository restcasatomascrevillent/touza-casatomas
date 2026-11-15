import type { ImagenResponsive } from "@/assets/imagenes";
import { cn } from "@/lib/utils";

interface FotoPortadaProps {
  imagen: ImagenResponsive;
  alt: string;
  /** Anchos CSS para que el navegador elija del srcset. */
  sizes: string;
  /** Recorte para pantallas verticales (dirección de arte). */
  variante?: { imagen: ImagenResponsive; media: string; sizes: string };
  className?: string;
}

/**
 * Foto de la portada: <picture> con AVIF/WebP, carga diferida y SIN fundido.
 *
 * No usa OptimizedImage porque esa arranca con `opacity-0` hasta el `onLoad`
 * (y así sale en el HTML del SSG). Aquí la foto se ve en cuanto llega, con el
 * fondo del marco mientras tanto. Lleva `.foto-asienta`: si está dentro de un
 * <Reveal efecto="destapar">, se asienta con el zoom de 1,1 a 1.
 */
const FotoPortada = ({ imagen, alt, sizes, variante, className }: FotoPortadaProps) => (
  <picture className="contents">
    {variante?.imagen.avif && (
      <source type="image/avif" media={variante.media} srcSet={variante.imagen.avif} sizes={variante.sizes} />
    )}
    {variante?.imagen.webp && (
      <source type="image/webp" media={variante.media} srcSet={variante.imagen.webp} sizes={variante.sizes} />
    )}
    {imagen.avif && <source type="image/avif" srcSet={imagen.avif} sizes={sizes} />}
    {imagen.webp && <source type="image/webp" srcSet={imagen.webp} sizes={sizes} />}
    <img
      src={imagen.src}
      alt={alt}
      width={imagen.width}
      height={imagen.height}
      loading="lazy"
      decoding="async"
      className={cn("foto-asienta h-full w-full object-cover", className)}
    />
  </picture>
);

export default FotoPortada;

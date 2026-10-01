import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ImagenResponsive } from "@/assets/imagenes";

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
    /** URL suelta (fotos de producto de Supabase, que no tienen variantes). */
    src?: string;
    /** Imagen del catálogo local: aporta srcset AVIF/WebP y dimensiones. */
    imagen?: ImagenResponsive;
    alt: string;
    className?: string;
    width?: number | string;
    height?: number | string;
    /** Anchos CSS para que el navegador elija del srcset. */
    sizes?: string;
    /** LCP o above-the-fold: carga ansiosa, alta prioridad y sin fundido. */
    priority?: boolean;
    /**
     * Dirección de arte: variante (p. ej. un recorte vertical) que el navegador
     * usa cuando se cumple `media`. Va antes que las <source> normales, así que
     * gana cuando aplica. Solo tiene sentido si la variante contiene todo lo
     * que `object-cover` deja ver en ese caso; si no, cambia el encuadre.
     */
    variante?: { imagen: ImagenResponsive; media: string; sizes: string };
}

export const OptimizedImage = ({
    src,
    imagen,
    alt,
    className,
    width,
    height,
    sizes = "100vw",
    priority = false,
    variante,
    ...props
}: OptimizedImageProps) => {
    const url = imagen?.src ?? src ?? "";
    // Las dimensiones explícitas reservan el hueco antes de que la imagen
    // llegue y evitan el salto de maquetación (CLS).
    const anchoFinal = width ?? imagen?.width;
    const altoFinal = height ?? imagen?.height;

    // React 18 todavía no reconoce la prop camelCase `fetchPriority` y la
    // descarta con un warning: hay que escribirla en minúsculas.
    const atributosPrioridad = priority ? ({ fetchpriority: "high" } as Record<string, string>) : {};

    // Con `priority` arrancamos visibles: el SSG no ejecuta `onLoad`, así que
    // un `opacity-0` inicial dejaba el HTML prerenderizado en negro hasta que
    // React hidrataba — justo lo que el prerenderizado venía a evitar.
    const [isLoaded, setIsLoaded] = useState(priority);
    const [hasError, setHasError] = useState(false);

    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        // En el HTML del SSG el navegador puede terminar de cargar la foto —o
        // de fallar, como la URL caída del Clover Club— ANTES de que React
        // hidrate. Esos `load`/`error` ya no se repiten, así que sin mirar
        // `complete` la tarjeta se quedaba en el skeleton (o en opacity-0)
        // para siempre. Una imagen diferida (lazy) aún sin pedir da
        // `complete === false` y sigue el camino normal de los eventos.
        const img = imgRef.current;
        if (img?.complete) {
            const cargada = img.naturalWidth > 0;
            setIsLoaded(cargada);
            setHasError(!cargada);
            return;
        }
        setIsLoaded(priority);
        setHasError(false);
    }, [url, priority]);

    // Sin URL (p. ej. `imagen_url` a NULL en Supabase) no se pinta un
    // `<img src="">`: va directo al relleno de marca, igual en el SSG y en el
    // navegador (no depende de ningún evento).
    if (hasError || !url) {
        // Antes: el texto "Error al cargar imagen" en gris, en medio de la
        // carta (pasa con fotos de stock caídas, p. ej. la del Clover Club).
        // Ahora un relleno discreto con la marca, y el `alt` se conserva como
        // nombre accesible para no perder la descripción.
        return (
            <div
                role="img"
                aria-label={alt}
                className={cn(
                    "flex items-center justify-center bg-gradient-to-br from-white/[0.06] to-white/[0.02]",
                    className
                )}
                style={{ width, height }}
            >
                <span aria-hidden="true" className="font-serif text-lg tracking-[0.3em] text-primary/40 select-none">
                    TOUZA
                </span>
            </div>
        );
    }

    return (
        <div
            className={cn("relative overflow-hidden bg-muted", className)}
            style={{ width, height }}
        >
            {/* `contents` saca la <picture> del layout: el <img> queda como hijo
                directo del contenedor, exactamente igual que antes. */}
            <picture className="contents">
                {variante?.imagen.avif && (
                    <source type="image/avif" media={variante.media} srcSet={variante.imagen.avif} sizes={variante.sizes} />
                )}
                {variante?.imagen.webp && (
                    <source type="image/webp" media={variante.media} srcSet={variante.imagen.webp} sizes={variante.sizes} />
                )}
                {imagen?.avif && <source type="image/avif" srcSet={imagen.avif} sizes={sizes} />}
                {imagen?.webp && <source type="image/webp" srcSet={imagen.webp} sizes={sizes} />}
                <img
                    ref={imgRef}
                    src={url}
                    alt={alt}
                    width={anchoFinal}
                    height={altoFinal}
                    loading={priority ? "eager" : "lazy"}
                    decoding={priority ? "sync" : "async"}
                    {...atributosPrioridad}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    className={cn(
                        "w-full h-full object-cover transition-opacity duration-500 ease-in-out",
                        isLoaded ? "opacity-100" : "opacity-0"
                    )}
                    {...props}
                />
            </picture>
            {/* Skeleton loader / Blur effect while loading */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
        </div>
    );
};

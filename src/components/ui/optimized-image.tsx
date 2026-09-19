import { useState, useEffect } from "react";
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

    useEffect(() => {
        setIsLoaded(priority);
        setHasError(false);
    }, [url, priority]);

    if (hasError) {
        return (
            <div
                className={cn("bg-muted flex items-center justify-center text-muted-foreground text-xs", className)}
                style={{ width, height }}
            >
                Error al cargar imagen
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
                {imagen?.avif && <source type="image/avif" srcSet={imagen.avif} sizes={sizes} />}
                {imagen?.webp && <source type="image/webp" srcSet={imagen.webp} sizes={sizes} />}
                <img
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

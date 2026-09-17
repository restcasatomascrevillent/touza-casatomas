import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    width?: number | string;
    height?: number | string;
    priority?: boolean;
}

export const OptimizedImage = ({
    src,
    alt,
    className,
    width,
    height,
    priority = false,
    ...props
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // Reset state when src changes
        setIsLoaded(false);
        setHasError(false);

        // If priority is true, we want to preload the image
        if (priority) {
            const img = new Image();
            img.src = src;
            img.onload = () => setIsLoaded(true);
            img.onerror = () => setHasError(true);
        }
    }, [src, priority]);

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
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? "eager" : "lazy"}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-500 ease-in-out",
                    isLoaded ? "opacity-100" : "opacity-0"
                )}
                {...props}
            />
            {/* Skeleton loader / Blur effect while loading */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
        </div>
    );
};

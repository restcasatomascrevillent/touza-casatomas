import { cn } from "@/lib/utils";

interface CocktailHoverOutlineSVGProps {
    className?: string;
}

export const CocktailHoverOutlineSVG = ({ className }: CocktailHoverOutlineSVGProps) => {
    return (
        <div className={cn("absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20", className)}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="hsl(var(--gold))"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-16 h-16 sm:w-20 sm:h-20"
            >
                <style>
                    {`
            .draw-path {
              stroke-dasharray: 200;
              stroke-dashoffset: 200;
              transition: stroke-dashoffset 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
            }
            .group:hover .draw-path {
              stroke-dashoffset: 0;
            }
          `}
                </style>
                {/* Copa de Martini abstracta y minimalista */}
                {/* Base */}
                <path d="M40 90 L60 90" className="draw-path" />
                {/* Tallo */}
                <path d="M50 90 L50 50" className="draw-path" />
                {/* Cono - Lado izquierdo */}
                <path d="M50 50 L10 10 L90 10 Z" className="draw-path" />
                {/* Detalle del líquido / curva suave interior */}
                <path d="M20 20 Q50 35 80 20" className="draw-path" style={{ transitionDelay: "0.2s" }} />
                {/* Olivo / Detalle circular */}
                <circle cx="65" cy="20" r="3" className="draw-path" style={{ transitionDelay: "0.4s" }} />
                <path d="M60 10 L65 20" className="draw-path" style={{ transitionDelay: "0.4s" }} />
            </svg>
        </div>
    );
};

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroBackgroundSVGProps {
    className?: string;
}

/*
 * Keyframes de los atributos SVG animados.
 *
 * IMPORTANTE: cada motion.circle/motion.path que anima atributos (cx, cy, d)
 * debe llevar `initial` con el primer keyframe. Sin `initial`, framer-motion no
 * mete esos atributos en `latestValues` al montar y, al arrancar la animación,
 * crea el MotionValue vacío (`getValue(key, latestValues[key] ?? null)`); el
 * primer frame se renderiza antes de que el resolver de keyframes lo rellene y
 * hace `setAttribute("cx", undefined)` → errores de consola
 * `<circle> attribute cx: Expected length, "undefined"`. Con `initial`, el SSR
 * también emite esos mismos valores, así que el HTML prerenderizado coincide.
 */
const GLOW_CX = ["50%", "60%", "40%", "50%"];
const GLOW_CY = ["50%", "40%", "60%", "50%"];

const WAVE_1 = [
    "M0,400 C300,300 600,600 1440,350 L1440,800 L0,800 Z",
    "M0,450 C350,500 700,200 1440,400 L1440,800 L0,800 Z",
    "M0,400 C300,300 600,600 1440,350 L1440,800 L0,800 Z",
];

const WAVE_2 = [
    "M0,600 C400,500 800,700 1440,550 L1440,800 L0,800 Z",
    "M0,550 C500,700 900,400 1440,650 L1440,800 L0,800 Z",
    "M0,600 C400,500 800,700 1440,550 L1440,800 L0,800 Z",
];

const CONTOUR = [
    "M0,300 C300,200 600,500 1440,250",
    "M0,250 C350,400 700,100 1440,300",
    "M0,300 C300,200 600,500 1440,250",
];

export const HeroBackgroundSVG = ({ className }: HeroBackgroundSVGProps) => {
    return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none opacity-30", className)}>
            <motion.svg
                viewBox="0 0 1440 800"
                preserveAspectRatio="xMidYMid slice"
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
            >
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.05" />
                        <stop offset="50%" stopColor="hsl(var(--gold))" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.0" />
                    </linearGradient>
                    <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Círculo de brillo animado lentamente en el fondo (50% = 720,400 del viewBox) */}
                <motion.circle
                    r="600"
                    fill="url(#glowGradient)"
                    initial={{ cx: GLOW_CX[0], cy: GLOW_CY[0] }}
                    animate={{ cx: GLOW_CX, cy: GLOW_CY }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Onda Abstracta Lenta 1 */}
                <motion.path
                    fill="url(#goldGradient)"
                    initial={{ d: WAVE_1[0] }}
                    animate={{ d: WAVE_1 }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Onda Abstracta Lenta 2 */}
                <motion.path
                    fill="url(#goldGradient)"
                    initial={{ d: WAVE_2[0] }}
                    animate={{ d: WAVE_2 }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Líneas de contorno sutiles fluyendo */}
                <motion.path
                    fill="none"
                    stroke="hsl(var(--gold))"
                    strokeWidth="1"
                    strokeOpacity="0.2"
                    initial={{ d: CONTOUR[0] }}
                    animate={{ d: CONTOUR }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

            </motion.svg>
        </div>
    );
};

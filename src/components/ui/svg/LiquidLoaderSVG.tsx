import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidLoaderSVGProps {
    className?: string;
}

const BLOB = [
    "M50,15 C69,15 85,31 85,50 C85,69 69,85 50,85 C31,85 15,69 15,50 C15,31 31,15 50,15 Z",
    "M50,15 C75,25 85,40 85,50 C85,75 60,85 50,85 C25,85 15,60 15,50 C15,25 25,25 50,15 Z",
    "M50,12 C72,12 88,28 88,50 C88,72 72,88 50,88 C28,88 12,72 12,50 C12,28 28,12 50,12 Z",
    "M50,15 C69,15 85,31 85,50 C85,69 69,85 50,85 C31,85 15,69 15,50 C15,31 31,15 50,15 Z",
];

export const LiquidLoaderSVG = ({ className }: LiquidLoaderSVGProps) => {
    return (
        <div className={cn("flex flex-col items-center justify-center min-h-[40vh] gap-6", className)}>
            <motion.svg
                width="80"
                height="80"
                viewBox="0 0 100 100"
                className="text-primary filter drop-shadow-md drop-shadow-primary/20"
            >
                <defs>
                    <filter id="liquidGlow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <motion.path
                    fill="currentColor"
                    filter="url(#liquidGlow)"
                    // `initial` con el primer keyframe: sin él framer-motion pinta un
                    // primer frame con d="undefined" (ver HeroBackgroundSVG.tsx).
                    initial={{ d: BLOB[0] }}
                    animate={{
                        d: BLOB,
                        scale: [1, 1.05, 0.95, 1],
                        rotate: [0, 90, 180, 360],
                    }}
                    transition={{
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                        times: [0, 0.33, 0.66, 1]
                    }}
                />

                {/* Un círculo pequeño orbitando */}
                <motion.circle
                    cx="50" cy="5" r="4" fill="currentColor"
                    animate={{
                        rotate: 360,
                        originX: "50px",
                        originY: "50px"
                    }}
                    transition={{
                        duration: 2,
                        ease: "linear",
                        repeat: Infinity
                    }}
                />
            </motion.svg>
            <motion.span
                className="text-primary/60 text-xs tracking-[0.2em] uppercase font-light"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                Preparando...
            </motion.span>
        </div>
    );
};

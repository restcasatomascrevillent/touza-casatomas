import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedDividerSVGProps {
    className?: string;
    delay?: number;
}

export const AnimatedDividerSVG = ({ className, delay = 0 }: AnimatedDividerSVGProps) => {
    return (
        <div className={cn("w-full flex justify-center py-8 opacity-60", className)}>
            <motion.svg
                width="300"
                height="30"
                viewBox="0 0 300 30"
                fill="none"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="w-full max-w-md"
            >
                {/* Línea Izquierda */}
                <motion.path
                    d="M 140 15 L 0 15"
                    stroke="hsl(var(--gold))"
                    strokeWidth="1"
                    strokeOpacity="0.5"
                    variants={{
                        hidden: { pathLength: 0, opacity: 0 },
                        visible: { pathLength: 1, opacity: 1 }
                    }}
                    transition={{ duration: 1.5, delay: delay, ease: [0.25, 0.1, 0.25, 1] }}
                />

                {/* Rombo Central */}
                <motion.path
                    d="M 150 10 L 155 15 L 150 20 L 145 15 Z"
                    fill="hsl(var(--gold))"
                    variants={{
                        hidden: { opacity: 0, scale: 0, rotate: -45 },
                        visible: { opacity: 1, scale: 1, rotate: 0 }
                    }}
                    transition={{ duration: 1, delay: delay + 0.8, ease: "backOut" }}
                />

                {/* Línea Derecha */}
                <motion.path
                    d="M 160 15 L 300 15"
                    stroke="hsl(var(--gold))"
                    strokeWidth="1"
                    strokeOpacity="0.5"
                    variants={{
                        hidden: { pathLength: 0, opacity: 0 },
                        visible: { pathLength: 1, opacity: 1 }
                    }}
                    transition={{ duration: 1.5, delay: delay, ease: [0.25, 0.1, 0.25, 1] }}
                />
            </motion.svg>
        </div>
    );
};

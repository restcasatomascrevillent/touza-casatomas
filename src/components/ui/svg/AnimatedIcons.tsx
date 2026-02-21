import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
        const delay = 1 + i * 0.5;
        return {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { delay, duration: 1.5, ease: "easeInOut" },
                opacity: { delay, duration: 0.01 }
            }
        };
    }
};

export const AnimatedMartiniSVG = ({ className }: { className?: string }) => (
    <motion.svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className={cn("text-primary", className)}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
    >
        <motion.path d="M10 20 L90 20 L50 60 Z" custom={0} variants={draw} />
        <motion.path d="M50 60 L50 90" custom={1} variants={draw} />
        <motion.path d="M30 90 L70 90" custom={1} variants={draw} />
        <motion.circle cx="50" cy="35" r="4" custom={1.5} variants={draw} fill="currentColor" />
    </motion.svg>
);

export const AnimatedStarSVG = ({ className }: { className?: string }) => (
    <motion.svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className={cn("text-primary", className)}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
    >
        <motion.path
            d="M50 10 L61 39 L92 39 L66 57 L76 87 L50 69 L24 87 L34 57 L8 39 L39 39 Z"
            custom={0}
            variants={draw}
        />
        <motion.path d="M50 10 L50 90" custom={1} variants={draw} opacity="0.2" />
        <motion.path d="M10 50 L90 50" custom={1} variants={draw} opacity="0.2" />
    </motion.svg>
);

export const AnimatedKeySVG = ({ className }: { className?: string }) => (
    <motion.svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className={cn("text-primary", className)}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
    >
        <motion.circle cx="30" cy="50" r="15" custom={0} variants={draw} />
        <motion.path d="M45 50 L85 50" custom={1} variants={draw} />
        <motion.path d="M65 50 L65 70" custom={1.5} variants={draw} />
        <motion.path d="M75 50 L75 65" custom={1.8} variants={draw} />
    </motion.svg>
);

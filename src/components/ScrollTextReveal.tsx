import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollTextRevealProps {
    children: string;
    className?: string;
}

const Word = ({ word, index, total, scrollYProgress }: { word: string; index: number; total: number; scrollYProgress: any }) => {
    // All words reveal within a compact 0-1 range, overlapping heavily so they light up fast
    const start = (index / total) * 0.6;
    const end = start + 0.4;
    const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);

    return (
        <motion.span style={{ opacity }} className="inline-block mr-[0.3em]">
            {word}
        </motion.span>
    );
};

const ScrollTextReveal = ({ children, className }: ScrollTextRevealProps) => {
    const ref = useRef<HTMLParagraphElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.95", "start 0.55"],
    });

    const words = children.split(" ");

    return (
        <p ref={ref} className={cn("flex flex-wrap", className)}>
            {words.map((word, i) => (
                <Word key={i} word={word} index={i} total={words.length} scrollYProgress={scrollYProgress} />
            ))}
        </p>
    );
};

export default ScrollTextReveal;

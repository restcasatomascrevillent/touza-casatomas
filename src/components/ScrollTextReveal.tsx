import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollTextRevealProps {
    children: string;
    className?: string;
}

const Word = ({ word, index, total, scrollYProgress }: { word: string; index: number; total: number; scrollYProgress: any }) => {
    const start = index / total;
    const end = (index + 1) / total;
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
        offset: ["start 0.85", "end 0.65"],
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

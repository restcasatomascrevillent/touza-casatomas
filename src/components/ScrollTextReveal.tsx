import { cn } from "@/lib/utils";

interface ScrollTextRevealProps {
    children: string;
    className?: string;
}

const ScrollTextReveal = ({ children, className }: ScrollTextRevealProps) => {
    return (
        <p className={cn("flex flex-wrap", className)}>
            {children}
        </p>
    );
};

export default ScrollTextReveal;

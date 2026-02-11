import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollTextReveal from "@/components/ScrollTextReveal";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface StickyScrollSectionProps {
    title: string;
    description: string;
    image: string;
    ctaText?: string;
    ctaLink?: string;
    reversed?: boolean;
}

const StickyScrollSection = ({ title, description, image, ctaText = "Descubrir", ctaLink = "/carta", reversed = false }: StickyScrollSectionProps) => {
    return (
        <div className="relative min-h-[85vh] lg:min-h-[100vh] flex items-center justify-center py-10 lg:py-0">
            <div className={`container-custom grid lg:grid-cols-2 gap-10 items-center ${reversed ? 'direction-rtl' : ''}`}>
                {/* Sticky Image Container */}
                <div className={`relative h-[50vh] lg:h-[70vh] w-full flex items-center justify-center sticky top-24 order-2 ${reversed ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div
                        className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <OptimizedImage
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                    </div>
                </div>

                {/* Scrolling Text */}
                <div className={`relative z-10 order-1 ${reversed ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="bg-background/80 backdrop-blur-3xl p-6 md:p-14 rounded-3xl border border-white/5 shadow-xl">
                        <span className="text-primary text-xs tracking-[0.3em] uppercase mb-6 block font-medium">
                            Touza Experience
                        </span>
                        <h3 className="font-serif text-3xl md:text-5xl lg:text-6xl text-foreground mb-6 md:mb-8 leading-none">
                            {title}
                        </h3>
                        <div className="mb-10">
                            <ScrollTextReveal className="text-lg md:text-xl text-muted-foreground/90 leading-relaxed font-light">
                                {description}
                            </ScrollTextReveal>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="group h-14 px-10 border-foreground/20 text-foreground hover:bg-foreground hover:text-background rounded-full text-lg transition-all duration-300"
                        >
                            <Link to={ctaLink}>
                                {ctaText}
                                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StickyScrollSection;

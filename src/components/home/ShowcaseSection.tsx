import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

interface ShowcaseSectionProps {
  title: string;
  description: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  label?: string;
}

const ShowcaseSection = ({
  title,
  description,
  image,
  ctaText = "Descubrir",
  ctaLink = "/carta",
  label = "Touza Experience",
}: ShowcaseSectionProps) => {
  return (
    <section className="py-32 lg:py-40">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: appleEase }}
          className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden mb-16"
        >
          <OptimizedImage
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        <div className="max-w-3xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: appleEase }}
            className="text-primary text-xs tracking-[0.3em] uppercase mb-6 block font-medium"
          >
            {label}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: appleEase }}
            className="font-serif text-5xl lg:text-7xl text-foreground mb-6 leading-[0.9]"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: appleEase }}
            className="text-muted-foreground text-xl font-light leading-relaxed mb-10"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: appleEase }}
          >
            <Button
              asChild
              variant="outline"
              className="group h-14 px-10 border-foreground/20 text-foreground hover:bg-foreground hover:text-background rounded-full text-lg font-light transition-all duration-300"
            >
              <Link to={ctaLink}>
                {ctaText}
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;

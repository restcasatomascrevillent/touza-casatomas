import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section className="py-32 lg:py-40">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={imageRef}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: appleEase }}
          className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden mb-16"
        >
          <motion.div style={{ y: imageY }} className="absolute inset-[-10%]">
            <OptimizedImage
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: appleEase }}
            className="flex flex-col items-center gap-2 mb-6"
          >
            <span className="text-primary text-xs tracking-[0.3em] uppercase font-medium">
              {label}
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent"
            />
          </motion.div>


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
            className="text-white/70 text-xl font-light leading-relaxed mb-10"
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

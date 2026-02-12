import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

interface ShowcaseMobileProps {
  title: string;
  description: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  label?: string;
}

const ShowcaseMobile = ({
  title,
  description,
  image,
  ctaText = "Descubrir",
  ctaLink = "/carta",
  label = "Touza Experience",
}: ShowcaseMobileProps) => {
  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);

  return (
    <section className="py-16 px-6">
      <motion.div
        ref={imageRef}
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: appleEase }}
        className="aspect-[4/5] rounded-2xl overflow-hidden mb-8 relative"
      >
        <motion.div style={{ y: imageY }} className="absolute inset-[-6%]">
          <OptimizedImage
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: appleEase }}
        className="flex flex-col items-center gap-2 mb-4"
      >
        <span className="text-primary text-xs tracking-[0.3em] uppercase font-medium">
          {label}
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-6 bg-gradient-to-b from-primary/50 to-transparent"
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: appleEase }}
        className="font-serif text-3xl text-foreground mb-4 leading-tight"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: appleEase }}
        className="text-white/65 text-base font-light leading-relaxed mb-8"
      >
        {description}
      </motion.p>

      <Button
        asChild
        size="lg"
        className="w-full h-14 bg-white text-black hover:bg-white/90 text-base font-medium rounded-2xl"
      >
        <Link to={ctaLink}>{ctaText}</Link>
      </Button>

      <div className="mt-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default ShowcaseMobile;

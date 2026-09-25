import { useState, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/optimized-image";
import Seo from "@/components/Seo";
import { useIsMobile } from "@/hooks/use-mobile";
import { IMAGENES, imagenRemota } from "@/assets/imagenes";
import { canonical } from "@/lib/site";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const galleryCategories = [
  { id: "all", name: "Todo" },
  { id: "ambiente", name: "Ambiente" },
  { id: "cocktails", name: "Cócteles" },
  { id: "reservado", name: "El Reservado" },
];

// Las fotos de ambiente y reservado son propias (src/assets).
// ⚠️ Las 5 de "cocktails" siguen siendo stock de Unsplash: un bar real
// ilustrado con fotos de catálogo resta credibilidad frente a la ficha de
// Google, donde sí habrá fotos reales. Pendiente de fotos del dueño.
const galleryData = [
  { id: 1, category: "ambiente", image: IMAGENES.interior, alt: "Interior del bar con iluminación cálida" },
  { id: 2, category: "cocktails", image: imagenRemota("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=800&fit=crop", 600, 800), alt: "Cóctel Signature" },
  { id: 3, category: "ambiente", image: IMAGENES.barra, alt: "Barra del bar" },
  { id: 4, category: "cocktails", image: imagenRemota("https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=800&fit=crop", 600, 800), alt: "Cóctel tropical" },
  { id: 5, category: "reservado", image: IMAGENES.reservado, alt: "El Reservado - espacio privado" },
  { id: 6, category: "cocktails", image: imagenRemota("https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&h=800&fit=crop", 600, 800), alt: "Cóctel clásico" },
  { id: 7, category: "ambiente", image: IMAGENES.decoracion, alt: "Detalle decoración" },
  { id: 8, category: "reservado", image: IMAGENES.mesaPrivada, alt: "Mesa privada" },
  { id: 9, category: "cocktails", image: imagenRemota("https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=800&fit=crop", 600, 800), alt: "Mojito" },
  { id: 10, category: "ambiente", image: IMAGENES.local, alt: "Vista general del local" },
  { id: 11, category: "cocktails", image: imagenRemota("https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=600&h=800&fit=crop", 600, 800), alt: "Margarita" },
  { id: 12, category: "reservado", image: IMAGENES.barra, alt: "Evento en El Reservado" },
];

const Galeria = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<typeof galleryData[0] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const isMobile = useIsMobile();

  const filteredImages = galleryData.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const openLightbox = (image: typeof galleryData[0]) => {
    setSelectedImage(image);
    setCurrentIndex(filteredImages.findIndex((img) => img.id === image.id));
  };

  const navigateLightbox = useCallback((dir: "prev" | "next") => {
    const d = dir === "next" ? 1 : -1;
    setDirection(d);
    const newIndex = (currentIndex + d + filteredImages.length) % filteredImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  }, [currentIndex, filteredImages]);

  const handleDragEnd = useCallback((_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -200) {
      navigateLightbox("next");
    } else if (info.offset.x > swipeThreshold || info.velocity.x > 200) {
      navigateLightbox("prev");
    }
  }, [navigateLightbox]);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <Layout>
      <Seo
        title="Galería de Imágenes"
        description="Explora la galería de imágenes de Touza. Fotos de nuestros cócteles artesanales, el ambiente exclusivo y nuestro reservado en Crevillente."
        canonical={canonical("/galeria")}
        keywords={['fotos touza', 'galería cócteles', 'imágenes bar crevillente', 'fotos reservado']}
      />

      {/* Hero */}
      <section className={cn(
        "bg-black overflow-hidden",
        isMobile ? "pt-24 pb-8 px-6" : "pt-40 pb-24"
      )}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: appleEase }}
            className="text-primary text-xs tracking-[0.3em] uppercase mb-3 md:mb-4 block font-medium"
          >
            Descubre
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: appleEase }}
            className={cn(
              "font-serif font-bold text-white",
              isMobile ? "text-4xl mb-3" : "text-7xl lg:text-8xl mb-6"
            )}
          >
            Galería
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: appleEase }}
            className="text-white/40 text-base md:text-lg font-light max-w-xl mx-auto"
          >
            Un vistazo a la esencia de Touza.
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[52px] md:top-[60px] z-40 bg-black/80 backdrop-blur-2xl border-y border-white/5 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto scrollbar-hide">
            {galleryCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-5 py-2.5 text-sm font-light rounded-full transition-all duration-300 whitespace-nowrap",
                  selectedCategory === category.id
                    ? "bg-white text-black"
                    : "bg-transparent text-white/40 hover:text-white/70"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className={cn("bg-black", isMobile ? "py-4 px-3" : "py-12 px-6")}>
        <div className="max-w-7xl mx-auto">
          <LayoutGroup>
            <motion.div
              layout
              className={cn(
                "grid gap-2 md:gap-4",
                isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-4"
              )}
            >
              <AnimatePresence mode="popLayout">
                {filteredImages.map((item, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, delay: index * 0.05, ease: appleEase }}
                    key={item.id}
                    onClick={() => openLightbox(item)}
                    className={cn(
                      "group cursor-pointer relative overflow-hidden rounded-2xl",
                      !isMobile && index % 5 === 0 && "col-span-2 row-span-2"
                    )}
                  >
                    <div className={cn(
                      "w-full overflow-hidden",
                      isMobile ? "aspect-square" : (index % 5 === 0 ? "aspect-square" : "aspect-[4/5]")
                    )}>
                      <OptimizedImage
                        imagen={item.image}
                        alt={item.alt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                        /* Las primeras son candidatas a LCP: nunca lazy. */
                        priority={index < 4}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/30 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        </div>
      </section>

      {/* Lightbox with swipe */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl w-[95vw] bg-black border-white/5 p-0 md:p-4 rounded-2xl">
          {selectedImage && (
            <div className="relative overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={selectedImage.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: appleEase }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <OptimizedImage
                    imagen={selectedImage.image}
                    alt={selectedImage.alt}
                    sizes="95vw"
                    className="w-full h-auto max-h-[80vh] object-contain rounded-xl select-none pointer-events-none"
                    priority={true}
                  />
                </motion.div>
              </AnimatePresence>
              <button
                onClick={() => navigateLightbox("prev")}
                className={cn(
                  "absolute left-3 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white text-lg transition-all duration-200 hover:bg-white/20",
                  isMobile ? "bottom-20 w-14 h-14" : "top-1/2 -translate-y-1/2 w-12 h-12"
                )}
                aria-label="Anterior"
              >
                ←
              </button>
              <button
                onClick={() => navigateLightbox("next")}
                className={cn(
                  "absolute right-3 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white text-lg transition-all duration-200 hover:bg-white/20",
                  isMobile ? "bottom-20 w-14 h-14" : "top-1/2 -translate-y-1/2 w-12 h-12"
                )}
                aria-label="Siguiente"
              >
                →
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-white/60">
                {currentIndex + 1} / {filteredImages.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Galeria;

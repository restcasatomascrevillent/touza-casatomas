import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { BARRA_BAJO_CABECERA } from "@/lib/cabecera";
import { OptimizedImage } from "@/components/ui/optimized-image";
import Seo from "@/components/Seo";
import { IMAGENES, imagenRemota } from "@/assets/imagenes";
import { canonical } from "@/lib/site";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

// Sin filtro "El Reservado": no hay ninguna foto real de la sala. Las que
// lo llevaban eran un mojito, unas botellas de champagne (dos veces, en dos
// recortes) y la foto de la barra repetida. Se recupera cuando el dueño
// mande fotos del espacio.
const galleryCategories = [
  { id: "all", name: "Todo" },
  { id: "ambiente", name: "Ambiente" },
  { id: "cocktails", name: "Cócteles" },
];

// Las fotos locales (IMAGENES) son propias y cada `alt` describe lo que se
// ve en ellas, no lo que se querría enseñar.
// ⚠️ Las 5 de Unsplash siguen siendo stock: un bar real ilustrado con fotos
// de catálogo resta credibilidad frente a la ficha de Google, donde sí habrá
// fotos reales. Pendiente de fotos del dueño.
// El orden importa: las posiciones 0 y 5 son las casillas grandes (2×2).
const galleryData = [
  { id: 1, category: "ambiente", image: IMAGENES.interior, alt: "Interior de Touza: sofá corrido color mostaza, mesas de mármol y sillas tapizadas" },
  { id: 2, category: "cocktails", image: imagenRemota("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=800&fit=crop", 600, 800), alt: "Cóctel Signature" },
  { id: 3, category: "ambiente", image: IMAGENES.barra, alt: "Bartender colando un cóctel sobre hielo en la barra" },
  { id: 4, category: "cocktails", image: imagenRemota("https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=800&fit=crop", 600, 800), alt: "Cóctel tropical" },
  { id: 5, category: "cocktails", image: IMAGENES.mojito, alt: "Mojito con hielo picado y pajita de Touza, recién servido en la barra" },
  { id: 8, category: "ambiente", image: IMAGENES.champanMesa, alt: "Tres botellas de champagne y una copa servida sobre una mesa de mármol" },
  { id: 6, category: "cocktails", image: imagenRemota("https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&h=800&fit=crop", 600, 800), alt: "Cóctel clásico" },
  { id: 7, category: "ambiente", image: IMAGENES.botellas, alt: "Botellas de aperitivo, ron y licores junto a un spritz en la barra" },
  { id: 9, category: "cocktails", image: imagenRemota("https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=800&fit=crop", 600, 800), alt: "Mojito" },
  { id: 11, category: "cocktails", image: imagenRemota("https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=600&h=800&fit=crop", 600, 800), alt: "Margarita" },
];

const Galeria = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<typeof galleryData[0] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  // Las fotos del primer pintado (HTML del SSG) nunca llevan opacity:0; solo
  // las que entran después, al cambiar de filtro, se animan.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

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

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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
        description="Explora la galería de imágenes de Touza: nuestros cócteles artesanales, la barra y el ambiente del local en Crevillente."
        canonical={canonical("/galeria")}
        keywords={['fotos touza', 'galería cócteles', 'imágenes bar crevillente']}
      />

      {/* Cabecera con foto, como Carta y El Reservado (antes, un bloque negro
          con el titular). Foto con priority y sin fundido: es el LCP. */}
      <section className="relative overflow-hidden h-[44vh] min-h-[19rem] md:h-[62vh]">
        <div className="absolute inset-0">
          <OptimizedImage
            imagen={IMAGENES.botellas}
            alt=""
            className="w-full h-full object-cover [&_img]:object-[50%_38%]"
            sizes="100vw"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black" />
        </div>
        <div className="absolute inset-0 z-10 flex items-end px-6 pb-10 md:pb-16">
          <div className="max-w-4xl mx-auto w-full text-center">
            <span
              style={{ animationDelay: "0.1s" }}
              className="entrada-hero text-primary text-xs tracking-[0.3em] uppercase mb-3 md:mb-4 block font-medium"
            >
              Descubre
            </span>
            <h1
              style={{ animationDelay: "0.2s" }}
              className="entrada-hero font-serif font-bold text-white leading-[0.9] text-5xl mb-3 md:text-7xl md:mb-6 lg:text-8xl"
            >
              Galería
            </h1>
            <p
              style={{ animationDelay: "0.35s" }}
              className="entrada-hero text-white/70 text-base md:text-lg font-light max-w-xl mx-auto"
            >
              Un vistazo a la esencia de Touza.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className={cn(BARRA_BAJO_CABECERA, "bg-black/80 backdrop-blur-2xl border-y border-white/5 py-4")}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto scrollbar-hide" role="group" aria-label="Filtrar fotos">
            {galleryCategories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={selectedCategory === category.id}
                className={cn(
                  "px-5 py-2.5 text-sm font-light rounded-full transition-all duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  selectedCategory === category.id
                    ? "bg-white text-black"
                    : "bg-transparent text-white/60 hover:text-white"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-black py-4 px-3 md:py-12 md:px-6">
        <div className="max-w-7xl mx-auto">
          <LayoutGroup>
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 md:grid-flow-dense"
            >
              <AnimatePresence mode="popLayout">
                {filteredImages.map((item, index) => (
                  <motion.div
                    layout
                    initial={montado ? { opacity: 0, scale: 0.95 } : false}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, delay: index * 0.05, ease: appleEase }}
                    key={item.id}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl",
                      index % 5 === 0 && "md:col-span-2 md:row-span-2"
                    )}
                  >
                    {/* Antes el clic estaba en el <div>: con teclado no había
                        forma de abrir ninguna foto. */}
                    <button
                      type="button"
                      onClick={() => openLightbox(item)}
                      aria-label={`Ampliar foto: ${item.alt}`}
                      className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    />
                    <div className={cn(
                      "w-full h-full overflow-hidden aspect-square",
                      index % 5 !== 0 && "md:aspect-[4/5]"
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
        <DialogContent
          className="max-w-5xl w-[95vw] bg-black border-white/5 p-0 md:p-4 rounded-2xl"
          // Flechas del teclado para pasar de foto (antes solo con los botones).
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") navigateLightbox("next");
            if (e.key === "ArrowLeft") navigateLightbox("prev");
          }}
        >
          <DialogTitle className="sr-only">{selectedImage?.alt ?? "Foto de Touza"}</DialogTitle>
          <DialogDescription className="sr-only">
            Foto {currentIndex + 1} de {filteredImages.length}. Usa las flechas para pasar de foto.
          </DialogDescription>
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
                type="button"
                onClick={() => navigateLightbox("prev")}
                className="absolute left-3 bottom-3 w-12 h-12 md:bottom-auto md:top-1/2 md:-translate-y-1/2 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors duration-200 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => navigateLightbox("next")}
                className="absolute right-3 bottom-3 w-12 h-12 md:bottom-auto md:top-1/2 md:-translate-y-1/2 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors duration-200 hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="w-6 h-6" aria-hidden="true" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-white/80 tabular-nums" aria-hidden="true">
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

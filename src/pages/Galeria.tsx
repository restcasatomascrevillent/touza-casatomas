import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { BARRA_BAJO_CABECERA } from "@/lib/cabecera";
import { OptimizedImage } from "@/components/ui/optimized-image";
import Seo from "@/components/Seo";
import { IMAGENES } from "@/assets/imagenes";
import { canonical } from "@/lib/site";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

// Dos filtros: ambiente y cócteles.
const galleryCategories = [
  { id: "all", name: "Todo" },
  { id: "ambiente", name: "Ambiente" },
  { id: "cocktails", name: "Cócteles" },
];

// Las fotos locales (IMAGENES) son propias y cada `alt` describe lo que se
// ve en ellas, no lo que se querría enseñar.
// Desde el 12/11/2026 todas son fotos reales de la barra (las 5 de Unsplash
// se han quitado).
// El orden importa: las posiciones múltiplo de 5 (0, 5, 10…) son las
// casillas grandes (2×2): ahí van las fotos con más escena.
const galleryData = [
  { id: 1, category: "ambiente", image: IMAGENES.interior, alt: "Interior de Touza: sofá corrido color mostaza, mesas de mármol y sillas tapizadas" },
  { id: 2, category: "cocktails", image: IMAGENES.moscowMule, alt: "Moscow Mule en taza de cobre con rodaja de lima deshidratada" },
  { id: 3, category: "ambiente", image: IMAGENES.sirviendo, alt: "El bartender sirviendo un cóctel rojo en copa coupé" },
  { id: 4, category: "cocktails", image: IMAGENES.aperol, alt: "Aperol Spritz en copa de vino sobre la barra de mármol" },
  { id: 5, category: "cocktails", image: IMAGENES.mango, alt: "Cóctel en copa coupé con borde de sal y chile" },
  { id: 6, category: "cocktails", image: IMAGENES.trio, alt: "Tres cócteles en copa coupé sobre la barra, con la estantería de botellas detrás" },
  { id: 7, category: "cocktails", image: IMAGENES.verde, alt: "Cóctel verde con hielo picado y rodaja de kiwi" },
  { id: 8, category: "ambiente", image: IMAGENES.barra, alt: "Bartender colando un cóctel sobre hielo en la barra" },
  { id: 9, category: "cocktails", image: IMAGENES.pinaColada, alt: "Piña Colada en vaso con forma de piña" },
  { id: 10, category: "cocktails", image: IMAGENES.copaEspuma, alt: "Cóctel naranja con espuma en copa coupé" },
  { id: 11, category: "cocktails", image: IMAGENES.coctelLogo, alt: "Cóctel rojo con arándanos delante de la T iluminada de Touza" },
  { id: 12, category: "cocktails", image: IMAGENES.mojitoBarra, alt: "Mojito con hierbabuena y lima en vaso alto" },
  { id: 13, category: "ambiente", image: IMAGENES.champanMesa, alt: "Tres botellas de champagne y una copa servida sobre una mesa de mármol" },
  { id: 14, category: "cocktails", image: IMAGENES.copaRoja, alt: "Cóctel rojo con espuma y arándanos en copa coupé" },
  { id: 15, category: "ambiente", image: IMAGENES.botellas, alt: "Botellas de aperitivo, ron y licores junto a un spritz en la barra" },
  { id: 16, category: "ambiente", image: IMAGENES.estanteria, alt: "La estantería de botellas de Touza, iluminada en dorado" },
  { id: 17, category: "cocktails", image: IMAGENES.mojito, alt: "Mojito con hielo picado y pajita de Touza, recién servido en la barra" },
  { id: 18, category: "ambiente", image: IMAGENES.agitando, alt: "El bartender agitando la coctelera detrás de la barra" },
  { id: 19, category: "cocktails", image: IMAGENES.copaFlor, alt: "Cóctel con espuma blanca y flor seca en copa coupé" },
  { id: 20, category: "cocktails", image: IMAGENES.tiki, alt: "Cóctel en vaso tiki de cerámica con rodaja de lima" },
  { id: 21, category: "cocktails", image: IMAGENES.tresCopas, alt: "Tres cócteles en copa coupé en fila sobre la barra" },
  { id: 22, category: "ambiente", image: IMAGENES.mojitoPreparando, alt: "La bartender rellenando un mojito con soda" },
  { id: 23, category: "cocktails", image: IMAGENES.kiwiVasoBajo, alt: "Cóctel en vaso bajo labrado con rodaja de kiwi" },
  { id: 24, category: "cocktails", image: IMAGENES.copaRoja2, alt: "Cóctel rojo con espuma y arándanos sobre el mármol" },
  { id: 25, category: "ambiente", image: IMAGENES.logo, alt: "La T de Touza iluminada en la pared" },
  { id: 26, category: "cocktails", image: IMAGENES.copasCenital, alt: "Tres cócteles en copa coupé vistos desde arriba" },
  { id: 27, category: "cocktails", image: IMAGENES.pinaBotellas, alt: "Piña Colada en la barra con la estantería iluminada detrás" },
  { id: 28, category: "ambiente", image: IMAGENES.pinaPreparando, alt: "El bartender sirviendo una Piña Colada desde la coctelera" },
  { id: 29, category: "cocktails", image: IMAGENES.moscowMule2, alt: "Moscow Mule en taza de cobre con pajita" },
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
        title="El bar por dentro · Touza Crevillente"
        description="Explora la galería de imágenes de Touza: nuestros cócteles artesanales, la barra y el ambiente del local en Crevillente."
        canonical={canonical("/galeria")}
        keywords={['fotos touza', 'galería cócteles', 'imágenes bar crevillente']}
      />

      {/* Cabecera con foto, como Carta (antes, un bloque negro
          con el titular). Foto con priority y sin fundido: es el LCP. */}
      <section className="escena-scroll relative overflow-hidden h-[44vh] min-h-[19rem] md:h-[62vh]">
        <div className="escena-foto absolute inset-0">
          <OptimizedImage
            imagen={IMAGENES.estanteria}
            alt=""
            className="w-full h-full object-cover [&_img]:object-[50%_38%]"
            sizes="100vw"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black" />
        </div>
        <div className="escena-texto absolute inset-0 z-10 flex items-end px-6 pb-10 md:pb-16">
          <div className="max-w-4xl mx-auto w-full text-center text-shadow">
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
              <span className="sr-only"> · Así es Touza</span>
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
      <section className={cn(BARRA_BAJO_CABECERA, "bg-black/85 backdrop-blur-2xl border-y border-white/5 py-2.5 md:py-4")}>
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto scrollbar-hide" role="group" aria-label="Filtrar fotos">
            {galleryCategories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={selectedCategory === category.id}
                className={cn(
                  "px-5 min-h-11 text-[15px] md:text-sm font-light rounded-full transition-all duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  selectedCategory === category.id
                    ? "bg-white text-black"
                    : "bg-transparent text-white/70 ring-1 ring-inset ring-white/10 hover:text-white hover:ring-white/25"
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
                      "marco-zoom group relative overflow-hidden rounded-2xl",
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
                        className="foto-zoom w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
          // En el móvil, visor a pantalla completa con los controles en una
          // fila bajo la foto (antes flotaban sobre las esquinas de la propia
          // foto). Desde md, ventana con los controles superpuestos.
          className="w-screen max-w-[100vw] h-[100dvh] rounded-none border-0 bg-black p-0 flex flex-col justify-center md:h-auto md:w-[95vw] md:max-w-5xl md:rounded-2xl md:border md:border-white/5 md:p-4"
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
                    className="w-full h-auto max-h-[calc(100dvh-9rem)] md:max-h-[80vh] object-contain md:rounded-xl select-none pointer-events-none"
                    priority={true}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center justify-between px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:contents">
                <button
                  type="button"
                  onClick={() => navigateLightbox("prev")}
                  className="w-12 h-12 md:absolute md:left-3 md:top-1/2 md:-translate-y-1/2 rounded-full bg-white/10 md:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors duration-200 hover:bg-black/70 active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-6 h-6" aria-hidden="true" />
                </button>
                <div className="px-4 py-2 rounded-full text-[13px] text-white/80 tabular-nums md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:bg-black/50 md:backdrop-blur-sm md:text-xs" aria-hidden="true">
                  {currentIndex + 1} / {filteredImages.length}
                </div>
                <button
                  type="button"
                  onClick={() => navigateLightbox("next")}
                  className="w-12 h-12 md:absolute md:right-3 md:top-1/2 md:-translate-y-1/2 rounded-full bg-white/10 md:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors duration-200 hover:bg-black/70 active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Galeria;

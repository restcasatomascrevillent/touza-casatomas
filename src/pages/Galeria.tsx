import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";

const galleryCategories = [
  { id: "all", name: "Todo" },
  { id: "ambiente", name: "Ambiente" },
  { id: "cocktails", name: "Cócteles" },
  { id: "reservado", name: "El Reservado" },
];

const galleryData = [
  { id: 1, category: "ambiente", image: "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-2-scaled.webp", alt: "Interior del bar con iluminación cálida" },
  { id: 2, category: "cocktails", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=800&fit=crop", alt: "Cóctel Signature" },
  { id: 3, category: "ambiente", image: "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-5-scaled.webp", alt: "Barra del bar" },
  { id: 4, category: "cocktails", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=800&fit=crop", alt: "Cóctel tropical" },
  { id: 5, category: "reservado", image: "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-7-scaled.webp", alt: "El Reservado - espacio privado" },
  { id: 6, category: "cocktails", image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&h=800&fit=crop", alt: "Cóctel clásico" },
  { id: 7, category: "ambiente", image: "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-10.webp", alt: "Detalle decoración" },
  { id: 8, category: "reservado", image: "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-8-1-scaled.webp", alt: "Mesa privada" },
  { id: 9, category: "cocktails", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=800&fit=crop", alt: "Mojito" },
  { id: 10, category: "ambiente", image: "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-8-scaled-e1699522690950.webp", alt: "Vista general del local" },
  { id: 11, category: "cocktails", image: "https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=600&h=800&fit=crop", alt: "Margarita" },
  { id: 12, category: "reservado", image: "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-5-scaled.webp", alt: "Evento en El Reservado" },
];

const Galeria = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<typeof galleryData[0] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredImages = galleryData.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const openLightbox = (image: typeof galleryData[0]) => {
    setSelectedImage(image);
    setCurrentIndex(filteredImages.findIndex((img) => img.id === image.id));
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    const newIndex = direction === "next"
      ? (currentIndex + 1) % filteredImages.length
      : (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-28 md:pt-32 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-2-scaled.webp" 
            alt="Galería" 
            className="w-full h-full object-cover opacity-25"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        <div className="relative z-10 container-custom text-center">
          <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block opacity-0 animate-fade-up">
            Descubre
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 opacity-0 animate-fade-up animation-delay-100">
            Galería
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto opacity-0 animate-fade-up animation-delay-200">
            Un vistazo a la esencia de Touza: ambiente, cócteles y momentos inolvidables.
          </p>
        </div>
      </section>

      {/* Category Filter - Enhanced for mobile */}
      <section className="py-3 md:py-6 border-y border-border/30 bg-charcoal/95 backdrop-blur-md sticky top-[52px] md:top-[73px] z-40">
        <div className="container-custom">
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto scrollbar-hide scroll-snap-x -mx-4 px-4 md:mx-0 md:px-0">
            {galleryCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-5 py-3 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap touch-target tap-highlight",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-secondary text-foreground/80 hover:bg-secondary/80 hover:text-foreground active:bg-secondary"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid - Uniform on mobile */}
      <section className="py-6 md:section-padding">
        <div className="container-custom px-3 md:px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
            {filteredImages.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(item)}
                className={cn(
                  "group cursor-pointer relative overflow-hidden rounded-lg tap-highlight",
                  // Only apply special sizing on tablet+
                  index % 5 === 0 && "md:col-span-2 md:row-span-2"
                )}
              >
                <div className={cn(
                  "w-full overflow-hidden", 
                  // Uniform aspect ratio on mobile
                  "aspect-square",
                  // Variable on desktop
                  index % 5 === 0 ? "md:aspect-square" : "md:aspect-[4/5]"
                )}>
                  <img 
                    src={item.image} 
                    alt={item.alt} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 active:scale-100"
                    loading="lazy"
                  />
                </div>
                {/* Overlay only on desktop hover */}
                <div className="absolute inset-0 bg-background/0 md:group-hover:bg-background/30 transition-all duration-300 flex items-center justify-center pointer-events-none">
                  <span className="text-foreground opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 font-serif text-base md:text-lg">
                    Ver
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox - Fullscreen on mobile */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl w-[95vw] md:w-auto bg-background/98 backdrop-blur-2xl border-border/50 p-0 md:p-4 rounded-xl md:rounded-lg">
          {selectedImage && (
            <div className="relative">
              <img 
                src={selectedImage.image} 
                alt={selectedImage.alt} 
                className="w-full h-auto max-h-[75vh] md:max-h-[80vh] object-contain rounded-lg"
              />
              {/* Navigation - Larger buttons positioned for thumbs */}
              <button 
                onClick={() => navigateLightbox("prev")} 
                className="absolute left-2 bottom-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-14 h-14 md:w-12 md:h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground text-xl font-bold hover:bg-primary hover:text-primary-foreground transition-all duration-200 touch-target-lg shadow-lg tap-highlight" 
                aria-label="Anterior"
              >
                ←
              </button>
              <button 
                onClick={() => navigateLightbox("next")} 
                className="absolute right-2 bottom-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-14 h-14 md:w-12 md:h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground text-xl font-bold hover:bg-primary hover:text-primary-foreground transition-all duration-200 touch-target-lg shadow-lg tap-highlight" 
                aria-label="Siguiente"
              >
                →
              </button>
              {/* Counter - More prominent */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-medium text-foreground shadow-lg">
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

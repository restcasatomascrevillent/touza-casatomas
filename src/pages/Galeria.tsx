import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";

// Categorías de galería
const galleryCategories = [
  { id: "all", name: "Todo" },
  { id: "ambiente", name: "Ambiente" },
  { id: "cocktails", name: "Cócteles" },
  { id: "reservado", name: "El Reservado" },
];

// Datos de galería
const galleryData = [
  {
    id: 1,
    category: "ambiente",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=600&fit=crop",
    alt: "Interior del bar con iluminación cálida",
  },
  {
    id: 2,
    category: "cocktails",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=800&fit=crop",
    alt: "Cóctel Signature",
  },
  {
    id: 3,
    category: "ambiente",
    image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=600&fit=crop",
    alt: "Barra del bar",
  },
  {
    id: 4,
    category: "cocktails",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=800&fit=crop",
    alt: "Cóctel tropical",
  },
  {
    id: 5,
    category: "reservado",
    image: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=800&h=600&fit=crop",
    alt: "El Reservado - espacio privado",
  },
  {
    id: 6,
    category: "cocktails",
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&h=800&fit=crop",
    alt: "Cóctel clásico",
  },
  {
    id: 7,
    category: "ambiente",
    image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&h=600&fit=crop",
    alt: "Detalle decoración",
  },
  {
    id: 8,
    category: "reservado",
    image: "https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=800&h=600&fit=crop",
    alt: "Mesa privada",
  },
  {
    id: 9,
    category: "cocktails",
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=800&fit=crop",
    alt: "Mojito",
  },
  {
    id: 10,
    category: "ambiente",
    image: "https://images.unsplash.com/photo-1574096079513-d8259312b785?w=800&h=600&fit=crop",
    alt: "Vista general del local",
  },
  {
    id: 11,
    category: "cocktails",
    image: "https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=600&h=800&fit=crop",
    alt: "Margarita",
  },
  {
    id: 12,
    category: "reservado",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop",
    alt: "Evento en El Reservado",
  },
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
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % filteredImages.length
        : (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1920&h=600&fit=crop"
            alt="Galería"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        <div className="relative z-10 container-custom text-center">
          <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
            Descubre
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            Galería
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Un vistazo a la esencia de Touza: ambiente, cócteles y 
            momentos inolvidables.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-y border-border/30 bg-charcoal sticky top-[73px] z-40">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {galleryCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-5 py-2 text-sm font-medium rounded-full transition-all duration-300",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(item)}
                className={cn(
                  "group cursor-pointer relative overflow-hidden rounded-lg",
                  // Crear diseño masonry con diferentes tamaños
                  index % 5 === 0 && "md:col-span-2 md:row-span-2",
                  index % 7 === 3 && "lg:col-span-2"
                )}
              >
                <div className={cn(
                  "w-full overflow-hidden",
                  index % 5 === 0 ? "aspect-square" : "aspect-[4/5]"
                )}>
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-all duration-300 flex items-center justify-center">
                  <span className="text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-serif text-lg">
                    Ver
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl bg-background/95 backdrop-blur-lg border-border p-0">
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.image}
                alt={selectedImage.alt}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              {/* Navigation */}
              <button
                onClick={() => navigateLightbox("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Anterior"
              >
                ←
              </button>
              <button
                onClick={() => navigateLightbox("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Siguiente"
              >
                →
              </button>

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-4 py-2 rounded-full text-sm text-foreground">
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

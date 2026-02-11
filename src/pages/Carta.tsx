import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Filter, Wine, Beer, Martini, GlassWater, Sparkles, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { useCocteles, transformCoctelesToUI, type CoctelUI } from "@/hooks/useCocteles";
import { useVinos, transformVinosToUI } from "@/hooks/useVinos";
import { useBebidas, transformBebidasToUI } from "@/hooks/useBebidas";
import { Skeleton } from "@/components/ui/skeleton";
import Seo from "@/components/Seo";
import { OptimizedImage } from "@/components/ui/optimized-image";
import ScrollTextReveal from "@/components/ScrollTextReveal";

interface GenericDrink {
  id: number | string;
  name: string;
  price: string;
  type?: string;
  tag?: string;
  description?: string;
  image?: string;
}

// Categorías principales de bebidas
const mainCategories = [
  { id: "cocteles", name: "Cócteles", icon: Martini },
  { id: "champagne", name: "Champagne", icon: Sparkles },
  { id: "cavas", name: "Cavas", icon: Wine },
  { id: "cervezas", name: "Cervezas", icon: Beer },
  { id: "copas", name: "Copas de Vino", icon: Wine },
  { id: "whiskies", name: "Whiskies", icon: GlassWater },
];

// Subcategorías de cócteles
const cocktailCategories = [
  { id: "all", name: "Todos" },
  { id: "autor", name: "De Autor" },
  { id: "clasicos", name: "Clásicos" },
  { id: "sin-alcohol", name: "Sin Alcohol" },
];

// Bases de cócteles para filtrar
const bases = [
  { id: "all", name: "Todas" },
  { id: "ginebra", name: "Ginebra" },
  { id: "vodka", name: "Vodka" },
  { id: "ron", name: "Ron" },
  { id: "tequila", name: "Tequila" },
  { id: "aperol", name: "Aperol" },
  { id: "sin-alcohol", name: "Sin Alcohol" },
];

// Tapas para maridaje
const tapasData = [
  {
    id: 1,
    name: "Tabla de Quesos Gallegos",
    description: "Selección de quesos artesanales con membrillo y nueces",
    price: "14€",
    image: "https://images.unsplash.com/photo-1631379578550-7038263db699?q=80&w=2074&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Pulpo a la Gallega",
    description: "Pulpo tierno con pimentón de la Vera y aceite de oliva",
    price: "16€",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Croquetas de Jamón",
    description: "Cremosas croquetas caseras de jamón ibérico",
    price: "10€",
    image: "https://images.unsplash.com/photo-1551024601-562963525c5c?w=400&h=300&fit=crop",
  },
];

// Skeleton para bebidas
const DrinksSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-card/50 border border-white/5 rounded-2xl p-6 h-32 flex flex-col justify-between">
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/2 bg-white/10" />
          <Skeleton className="h-4 w-3/4 bg-white/5" />
        </div>
        <Skeleton className="h-6 w-16 bg-white/10 self-end" />
      </div>
    ))}
  </div>
);

const Carta = () => {
  const [activeMainCategory, setActiveMainCategory] = useState("cocteles");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBase, setSelectedBase] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCocktail, setSelectedCocktail] = useState<CoctelUI | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // SCROLL TO TOP ON MOUNT
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contentSectionRef = useRef<HTMLElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Cargar datos
  const { data: coctelesData, isLoading: loadingCocteles } = useCocteles();
  const cocktailsData = useMemo(() => transformCoctelesToUI(coctelesData), [coctelesData]);

  const { data: champagnesRaw, isLoading: loadingChampagnes } = useVinos('CHAMPAGNES');
  const { data: cavasRaw, isLoading: loadingCavas } = useVinos('CAVAS Y OTROS ESPUMOSOS');
  const champagneData = useMemo(() => transformVinosToUI(champagnesRaw), [champagnesRaw]);
  const cavasData = useMemo(() => transformVinosToUI(cavasRaw), [cavasRaw]);

  const { data: cervezasRaw, isLoading: loadingCervezas } = useBebidas('Cervezas');
  const { data: copasRaw, isLoading: loadingCopas } = useBebidas('Copas');
  const { data: whiskiesRaw, isLoading: loadingWhiskies } = useBebidas('Whiskies');
  const cervezasData = useMemo(() => transformBebidasToUI(cervezasRaw), [cervezasRaw]);
  const copasData = useMemo(() => transformBebidasToUI(copasRaw), [copasRaw]);
  const whiskiesData = useMemo(() => transformBebidasToUI(whiskiesRaw), [whiskiesRaw]);

  const handleCategoryChange = (category: string) => {
    setActiveMainCategory(category);
    // Smooth scroll little bit to hide hero if needed, but keeping it visible is nice too
    // setTimeout(() => {
    //   contentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // }, 100);
  };

  // Filtrar cócteles
  const filteredCocktails = cocktailsData.filter((cocktail) => {
    const matchesCategory = selectedCategory === "all" || cocktail.category === selectedCategory;
    const matchesBase = selectedBase === "all" || cocktail.base === selectedBase;
    const matchesSearch = cocktail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cocktail.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesBase && matchesSearch;
  });

  // Filtrar otras bebidas
  const filterBySearch = <T extends { name: string }>(items: T[]) => {
    if (!searchTerm) return items;
    return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  // Animations
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } as Transition }
  };

  return (
    <Layout>
      <Seo
        title="Carta de Cócteles y Bebidas | Touza"
        description="Explora nuestra selección de cócteles de autor, vinos premium y más."
        keywords={['carta', 'menú', 'cócteles', 'precios']}
      />

      {/* Cinematic Hero */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 px-6 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 opacity-40">
          <OptimizedImage
            src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=2000&auto=format&fit=crop"
            alt="Carta Background"
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-background" />
        </div>

        <div className="relative z-10 container-custom text-center max-w-4xl mx-auto">
          <span
            className="text-primary text-xs tracking-[0.3em] uppercase mb-6 block font-medium"
          >
            Selección Exclusiva
          </span>
          <h1
            className="font-serif text-4xl md:text-7xl lg:text-8xl font-bold text-white mb-6 md:mb-8"
          >
            Nuestra Carta
          </h1>
          <div className="flex justify-center">
            <ScrollTextReveal className="text-white/80 text-lg md:text-xl font-normal text-center justify-center max-w-2xl drop-shadow-sm">
              Una colección curada de sabores. Desde clásicos atemporales hasta innovaciones audaces.
            </ScrollTextReveal>
          </div>
        </div>
      </section>

      {/* Sticky Tabs */}
      <div className="sticky top-20 z-40 bg-background/80 backdrop-blur-xl border-y border-white/5 py-4">
        <div className="container-custom overflow-x-auto scrollbar-hide">
          <div className="flex justify-start md:justify-center min-w-max px-4">
            <Tabs value={activeMainCategory} onValueChange={handleCategoryChange}>
              <TabsList className="bg-white/5 p-1 rounded-full border border-white/10">
                {mainCategories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="rounded-full px-6 py-2.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-black transition-all"
                  >
                    <cat.icon className="w-4 h-4 mr-2" />
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Search & Filters (Only visible for Cocktails or if needed) */}
      <div className="container-custom py-8 px-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 rounded-full h-12 focus:ring-1 focus:ring-primary/50 text-white placeholder:text-white/30"
            />
          </div>

          {activeMainCategory === "cocteles" && (
            <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
              {cocktailCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm whitespace-nowrap border transition-all",
                    selectedCategory === cat.id
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white/60 border-white/10 hover:border-white/30"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="min-h-[50vh]"
        >
          {/* COCTELES GRID */}
          {activeMainCategory === "cocteles" && (
            loadingCocteles ? <DrinksSkeleton /> :
              <motion.div
                variants={containerVars}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-4 md:gap-y-8"
              >
                {filteredCocktails.map((cocktail) => (
                  <motion.div
                    variants={itemVars}
                    key={cocktail.id}
                    onClick={() => setSelectedCocktail(cocktail)}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 relative mb-4">
                      <OptimizedImage
                        src={cocktail.image}
                        alt={cocktail.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                      <span className="absolute bottom-3 right-3 bg-white text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        {cocktail.price}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg md:text-xl text-white group-hover:text-primary transition-colors text-center md:text-left mb-1 leading-tight">{cocktail.name}</h3>
                    <p className="text-white/70 text-sm line-clamp-2 text-center md:text-left font-normal group-hover:text-white/90 transition-colors">{cocktail.description}</p>
                  </motion.div>
                ))}
              </motion.div>
          )}

          {/* GENERIC DRINK LIST (WINES, BEERS, WHISKIES) */}
          {activeMainCategory !== "cocteles" && (
            <motion.div
              variants={containerVars}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {/* Show Loading Skeletons */}
              {(
                (activeMainCategory === "champagne" && loadingChampagnes) ||
                (activeMainCategory === "cavas" && loadingCavas) ||
                (activeMainCategory === "cervezas" && loadingCervezas) ||
                (activeMainCategory === "copas" && loadingCopas) ||
                (activeMainCategory === "whiskies" && loadingWhiskies)
              ) ? <DrinksSkeleton /> : null}

              {/* Show Data */}
              {filterBySearch(
                activeMainCategory === "champagne" ? champagneData :
                  activeMainCategory === "cavas" ? cavasData :
                    activeMainCategory === "cervezas" ? cervezasData :
                      activeMainCategory === "copas" ? copasData :
                        whiskiesData
              ).map((drink) => (
                <motion.div
                  variants={itemVars}
                  key={drink.id}
                  className="bg-white/5 border border-white/5 rounded-2xl p-6 flex justify-between items-start hover:bg-white/10 hover:border-white/20 transition-all duration-300 group hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)] hover:-translate-y-1"
                >
                  <div>
                    <h3 className="font-serif text-xl text-white mb-1 group-hover:text-primary transition-colors">{drink.name}</h3>
                    {/* description/type if available */}
                    {(drink as GenericDrink).type && <span className="text-xs text-white/60 uppercase tracking-wider block mb-2 font-medium">{(drink as GenericDrink).type}</span>}
                    {/* Tag */}
                    {(drink as GenericDrink).tag && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-sm font-bold border border-primary/20">{(drink as GenericDrink).tag}</span>}
                  </div>
                  <span className="text-primary font-bold text-xl drop-shadow-[0_0_5px_rgba(255,215,0,0.3)]">{drink.price}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* TAPEA CON TU COCTEL SECTION */}
      <section className="py-20 bg-white/5 mt-20">
        <div className="container-custom text-center mb-12">
          <h2 className="font-serif text-4xl text-white mb-4">Tapea con tu Cóctel</h2>
          <p className="text-white/50 max-w-2xl mx-auto">El maridaje perfecto para elevar la experiencia.</p>
        </div>
        <div className="container-custom flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide md:grid md:grid-cols-3 md:pb-0">
          {tapasData.map((tapa, i) => (
            <div key={tapa.id} className="min-w-[280px] snap-center group">
              <div className="aspect-video rounded-xl overflow-hidden mb-4 relative">
                <OptimizedImage
                  src={tapa.image}
                  alt={tapa.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white border border-white/10 px-3 py-1 rounded-full text-sm">
                  {tapa.price}
                </span>
              </div>
              <h3 className="font-serif text-xl text-white mb-2">{tapa.name}</h3>
              <p className="text-white/50 text-sm font-light">{tapa.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coctel Detail Modal (Fullscreen on mobile, dialog on desktop) */}
      <Dialog open={!!selectedCocktail} onOpenChange={() => setSelectedCocktail(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-[#0a0a0a] border-white/10 text-white rounded-2xl">
          <div className="grid md:grid-cols-2 h-[80vh] md:h-auto">
            <div className="relative h-64 md:h-full bg-white/5">
              {selectedCocktail && (
                <OptimizedImage
                  src={selectedCocktail.image}
                  alt={selectedCocktail.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
              {selectedCocktail && (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-primary text-xs uppercase tracking-widest mb-2 block">{selectedCocktail.category}</span>
                      <DialogTitle className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 leading-[0.9] text-white">
                        {selectedCocktail.name}
                      </DialogTitle>
                    </div>
                  </div>

                  <p className="text-xl text-white/70 font-light leading-relaxed mb-8">
                    {selectedCocktail.description}
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm uppercase tracking-widest text-white/40 mb-3">Notas de cata</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCocktail.ingredients.map((ing, i) => (
                          <span key={i} className="px-3 py-1 rounded-full border border-white/10 text-sm text-white/80">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-white/10">
                      <div className="text-sm text-white/40">
                        Base: <span className="text-white capitalize">{selectedCocktail.base}</span>
                      </div>
                      <span className="text-3xl font-serif text-primary">{selectedCocktail.price}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogClose className="absolute top-4 right-4 bg-black/20 hover:bg-white/20 p-2 rounded-full text-white transition-colors">
            <X className="w-5 h-5" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Carta;

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Wine, Beer, Martini, GlassWater, Sparkles, X } from "lucide-react";
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
import { usePlatosTouza, transformPlatosToUI } from "@/hooks/usePlatos";
import { Skeleton } from "@/components/ui/skeleton";
import Seo from "@/components/Seo";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useIsMobile } from "@/hooks/use-mobile";
import { CocktailHoverOutlineSVG } from "@/components/ui/svg/CocktailHoverOutlineSVG";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

interface GenericDrink {
  id: number | string;
  name: string;
  price: string;
  type?: string;
  tag?: string;
  description?: string;
  image?: string;
}

const mainCategories = [
  { id: "cocteles", name: "Cócteles" },
  { id: "champagne", name: "Champagne" },
  { id: "cavas", name: "Cavas" },
  { id: "cervezas", name: "Cervezas" },
  { id: "copas", name: "Copas de Vino" },
  { id: "whiskies", name: "Whiskies" },
];

const cocktailCategories = [
  { id: "all", name: "Todos" },
  { id: "autor", name: "De Autor" },
  { id: "clasicos", name: "Clásicos" },
  { id: "sin-alcohol", name: "Sin Alcohol" },
];

import { LiquidLoaderSVG } from "@/components/ui/svg/LiquidLoaderSVG";

const DrinksSkeleton = () => (
  <div className="w-full flex justify-center py-20 col-span-full">
    <LiquidLoaderSVG />
  </div>
);

const Carta = () => {
  const [activeMainCategory, setActiveMainCategory] = useState("cocteles");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBase, setSelectedBase] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCocktail, setSelectedCocktail] = useState<CoctelUI | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => { window.scrollTo(0, 0); }, []);

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

  const { data: platosRaw, isLoading: loadingPlatos } = usePlatosTouza();
  const tapasData = useMemo(() => transformPlatosToUI(platosRaw), [platosRaw]);

  const filteredCocktails = cocktailsData.filter((cocktail) => {
    const matchesCategory = selectedCategory === "all" || cocktail.category === selectedCategory;
    const matchesBase = selectedBase === "all" || cocktail.base === selectedBase;
    const matchesSearch = cocktail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cocktail.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesBase && matchesSearch;
  });

  const filterBySearch = <T extends { name: string }>(items: T[]) => {
    if (!searchTerm) return items;
    return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: appleEase } as Transition }
  };

  return (
    <Layout>
      <Seo
        title="Carta de Cócteles y Bebidas | Touza"
        description="Explora nuestra selección de cócteles de autor, vinos premium y más."
        keywords={['carta', 'menú', 'cócteles', 'precios']}
      />

      {/* Hero */}
      <section className={cn(
        "relative overflow-hidden",
        isMobile ? "h-[60vh]" : "h-[80vh]"
      )}>
        <motion.div
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: appleEase }}
          className="absolute inset-0"
        >
          <OptimizedImage
            src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-5-scaled.webp"
            alt="Barra de Touza"
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />
        </motion.div>

        <div className="absolute inset-0 z-10 flex items-end pb-12 md:pb-20 px-6">
          <div className="max-w-6xl mx-auto w-full text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: appleEase }}
              className="text-primary text-xs tracking-[0.3em] uppercase mb-4 block font-medium"
            >
              Selección Exclusiva
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: appleEase }}
              className={cn(
                "font-serif font-bold text-white leading-[0.9]",
                isMobile ? "text-4xl mb-4" : "text-7xl lg:text-8xl mb-6"
              )}
            >
              Nuestra Carta
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: appleEase }}
              className="text-white/50 text-base md:text-lg font-light max-w-xl mx-auto"
            >
              Una colección curada de sabores. Desde clásicos atemporales hasta innovaciones audaces.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-[52px] md:top-[60px] z-40 bg-black/80 backdrop-blur-2xl border-y border-white/5 py-3">
        <div className="max-w-6xl mx-auto overflow-x-auto scrollbar-hide px-4">
          <div className="flex justify-start md:justify-center min-w-max">
            <Tabs value={activeMainCategory} onValueChange={setActiveMainCategory}>
              <TabsList className="bg-transparent p-0 gap-1">
                {mainCategories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className={cn(
                      "rounded-full px-5 py-2.5 text-sm font-light transition-all duration-300",
                      "data-[state=active]:bg-white data-[state=active]:text-black",
                      "data-[state=inactive]:text-white/40 data-[state=inactive]:hover:text-white/70"
                    )}
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          <div className="relative w-full md:w-80 group">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-transparent focus:border-white/20 rounded-full h-12 text-white placeholder:text-white/20 pl-5 pr-10"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {activeMainCategory === "cocteles" && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {cocktailCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-light whitespace-nowrap transition-all duration-300",
                    selectedCategory === cat.id
                      ? "bg-white text-black"
                      : "text-white/40 hover:text-white/70"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-[50vh]">
          {/* Cocktails Grid */}
          {activeMainCategory === "cocteles" && (
            loadingCocteles ? <DrinksSkeleton /> :
              <div className={cn(
                "grid gap-x-3 gap-y-6 md:gap-x-5 md:gap-y-8",
                isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-4"
              )}
              >
                {filteredCocktails.map((cocktail, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.06, ease: appleEase }}
                    key={cocktail.id}
                    onClick={() => setSelectedCocktail(cocktail)}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 relative mb-4">
                      <OptimizedImage
                        src={cocktail.image}
                        alt={cocktail.name}
                        className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-40 transition-all duration-700"
                      />
                      <CocktailHoverOutlineSVG />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent group-hover:from-black/90 transition-all duration-700" />
                      <span className="absolute bottom-3 right-3 bg-white text-black text-xs font-medium px-3 py-1 rounded-full z-30">
                        {cocktail.price}
                      </span>
                    </div>
                    <h3 className="font-serif text-base md:text-lg text-white group-hover:text-primary transition-colors leading-tight mb-1">{cocktail.name}</h3>
                    <p className="text-white/30 text-sm line-clamp-2 font-light">{cocktail.description}</p>
                  </motion.div>
                ))}
              </div>
          )}

          {/* Generic Drinks */}
          {activeMainCategory !== "cocteles" && (
            <div className="max-w-4xl mx-auto">

              {(
                (activeMainCategory === "champagne" && loadingChampagnes) ||
                (activeMainCategory === "cavas" && loadingCavas) ||
                (activeMainCategory === "cervezas" && loadingCervezas) ||
                (activeMainCategory === "copas" && loadingCopas) ||
                (activeMainCategory === "whiskies" && loadingWhiskies)
              ) ? <DrinksSkeleton /> : null}

              {filterBySearch(
                activeMainCategory === "champagne" ? champagneData :
                  activeMainCategory === "cavas" ? cavasData :
                    activeMainCategory === "cervezas" ? cervezasData :
                      activeMainCategory === "copas" ? copasData :
                        whiskiesData
              ).map((drink, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: index * 0.04, ease: appleEase }}
                  key={drink.id}
                  className="flex justify-between items-center py-5 border-b border-white/5 group"
                >
                  <div>
                    <h3 className="font-serif text-lg text-white group-hover:text-primary transition-colors duration-300">{drink.name}</h3>
                    {(drink as GenericDrink).type && (
                      <span className="text-xs text-white/30 uppercase tracking-wider font-light">{(drink as GenericDrink).type}</span>
                    )}
                  </div>
                  <span className="text-primary font-medium text-lg">{drink.price}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tapas Section */}
      {(loadingPlatos || tapasData.length > 0) && (
        <section className="py-20 bg-white/[0.02] mt-16">
          <div className="max-w-6xl mx-auto px-6 text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: appleEase }}
              className="font-serif text-3xl md:text-4xl text-white mb-4"
            >
              Tapea con tu Cóctel
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: appleEase }}
              className="text-white/30 font-light"
            >
              El maridaje perfecto para elevar la experiencia.
            </motion.p>
          </div>
          {loadingPlatos ? (
            <div className="w-full flex justify-center py-10">
              <LiquidLoaderSVG />
            </div>
          ) : (
            <div className={cn(
              "max-w-6xl mx-auto px-6",
              isMobile ? "flex overflow-x-auto gap-4 snap-x scrollbar-hide" : "grid grid-cols-3 gap-8"
            )}>
              {tapasData.map((tapa, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: appleEase }}
                  key={tapa.id}
                  className={cn("group", isMobile && "min-w-[280px] snap-center")}
                >
                  <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                    <OptimizedImage
                      src={tapa.image}
                      alt={tapa.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-lg text-white mb-1">{tapa.name}</h3>
                      <p className="text-white/30 text-sm font-light">{tapa.description}</p>
                    </div>
                    <span className="text-primary font-medium ml-4">{tapa.price}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedCocktail} onOpenChange={() => setSelectedCocktail(null)}>
        <DialogContent className={cn(
          "p-0 overflow-hidden bg-black border-white/5 text-white",
          isMobile ? "max-w-[100vw] h-[100dvh] rounded-none" : "max-w-4xl rounded-2xl"
        )}>
          <div className={cn("grid", isMobile ? "grid-rows-[40vh_1fr]" : "md:grid-cols-2")}>
            <div className="relative bg-white/5">
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
                  <span className="text-primary text-xs uppercase tracking-widest mb-3">{selectedCocktail.category}</span>
                  <DialogTitle className="font-serif text-3xl md:text-5xl mb-6 leading-[0.9] text-white">
                    {selectedCocktail.name}
                  </DialogTitle>
                  <p className="text-lg text-white/50 font-light leading-relaxed mb-8">
                    {selectedCocktail.description}
                  </p>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-white/30 mb-3">Notas de cata</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCocktail.ingredients.map((ing, i) => (
                        <span key={i} className="px-3 py-1 rounded-full border border-white/10 text-sm text-white/60 font-light">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/5">
                    <span className="text-xs text-white/30">Base: <span className="text-white/60 capitalize">{selectedCocktail.base}</span></span>
                    <span className="text-3xl font-serif text-primary">{selectedCocktail.price}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout >
  );
};

export default Carta;

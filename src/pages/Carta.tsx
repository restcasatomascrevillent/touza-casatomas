import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Filter, Wine, Beer, Martini, GlassWater, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { useCocteles, transformCoctelesToUI, type CoctelUI } from "@/hooks/useCocteles";
import { useVinos, transformVinosToUI } from "@/hooks/useVinos";
import { useBebidas, transformBebidasToUI } from "@/hooks/useBebidas";
import { Skeleton } from "@/components/ui/skeleton";

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
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop",
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
    image: "https://images.unsplash.com/photo-1554433607-66b5efe9d304?w=400&h=300&fit=crop",
  },
];

// Skeleton para bebidas
const DrinksSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-card border border-border/50 rounded-xl p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
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
  const [animationKey, setAnimationKey] = useState(0);
  const [tabIndicatorStyle, setTabIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  
  const contentSectionRef = useRef<HTMLElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const { ref: heroRef, isVisible: heroVisible } = useAnimateOnScroll<HTMLDivElement>();

  // Cargar cócteles desde Supabase
  const { data: coctelesData, isLoading: loadingCocteles } = useCocteles();
  const cocktailsData = useMemo(() => transformCoctelesToUI(coctelesData), [coctelesData]);

  // Cargar champagnes y cavas desde Vinos
  const { data: champagnesRaw, isLoading: loadingChampagnes } = useVinos('CHAMPAGNES');
  const { data: cavasRaw, isLoading: loadingCavas } = useVinos('CAVAS Y OTROS ESPUMOSOS');
  const champagneData = useMemo(() => transformVinosToUI(champagnesRaw), [champagnesRaw]);
  const cavasData = useMemo(() => transformVinosToUI(cavasRaw), [cavasRaw]);

  // Cargar cervezas, copas y whiskies desde Bebidas
  const { data: cervezasRaw, isLoading: loadingCervezas } = useBebidas('Cervezas');
  const { data: copasRaw, isLoading: loadingCopas } = useBebidas('Copas');
  const { data: whiskiesRaw, isLoading: loadingWhiskies } = useBebidas('Whiskies');
  const cervezasData = useMemo(() => transformBebidasToUI(cervezasRaw), [cervezasRaw]);
  const copasData = useMemo(() => transformBebidasToUI(copasRaw), [copasRaw]);
  const whiskiesData = useMemo(() => transformBebidasToUI(whiskiesRaw), [whiskiesRaw]);

  // Update tab indicator position
  useEffect(() => {
    const updateIndicator = () => {
      const activeTab = tabsContainerRef.current?.querySelector('[data-state="active"]') as HTMLElement;
      if (activeTab) {
        const container = tabsContainerRef.current;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const tabRect = activeTab.getBoundingClientRect();
          setTabIndicatorStyle({
            left: tabRect.left - containerRect.left,
            width: tabRect.width,
          });
        }
      }
    };
    
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeMainCategory]);

  // Handle modal open with animation
  const openCocktailModal = (cocktail: CoctelUI) => {
    setIsModalAnimating(true);
    setSelectedCocktail(cocktail);
    setTimeout(() => setIsModalAnimating(false), 50);
  };

  const handleCategoryChange = (category: string) => {
    setActiveMainCategory(category);
    setAnimationKey(prev => prev + 1);
    // Scroll suave a la sección de contenido
    setTimeout(() => {
      contentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Filtrar cócteles
  const filteredCocktails = cocktailsData.filter((cocktail) => {
    const matchesCategory = selectedCategory === "all" || cocktail.category === selectedCategory;
    const matchesBase = selectedBase === "all" || cocktail.base === selectedBase;
    const matchesSearch = cocktail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cocktail.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesBase && matchesSearch;
  });

  // Filtrar otras bebidas por búsqueda
  const filterBySearch = <T extends { name: string }>(items: T[]) => {
    if (!searchTerm) return items;
    return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  return (
    <Layout>
      {/* Hero with parallax */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1574096079513-d8259312b785?w=1920&h=600&fit=crop"
            alt="Cócteles"
            className="w-full h-full object-cover opacity-30 scale-110 transform-gpu"
            style={{ willChange: 'transform' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        <div 
          ref={heroRef}
          className={cn(
            "relative z-10 container-custom text-center transition-all duration-1000",
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block animate-fade-in">
            Explora
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Nuestra Carta
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '300ms' }}>
            Cada bebida es una experiencia única, elaborada con pasión 
            y los ingredientes más selectos.
          </p>
        </div>
      </section>

      {/* Main Category Tabs - Optimized for mobile */}
      <section className="py-3 md:py-6 border-y border-border/30 bg-charcoal/95 backdrop-blur-md sticky top-[52px] md:top-[73px] z-40 transition-all duration-300">
        <div className="container-custom">
          <Tabs value={activeMainCategory} onValueChange={handleCategoryChange} className="w-full">
            <div ref={tabsContainerRef} className="relative">
              {/* Animated indicator - Hidden on mobile for cleaner look */}
              <div 
                className="hidden md:block absolute bottom-0 h-0.5 bg-gradient-to-r from-primary via-gold to-primary rounded-full transition-all duration-500 ease-out"
                style={{
                  left: tabIndicatorStyle.left,
                  width: tabIndicatorStyle.width,
                  boxShadow: '0 0 10px hsl(var(--primary) / 0.5)',
                }}
              />
              <TabsList className="w-full h-auto flex flex-nowrap justify-start gap-2 bg-transparent p-0 pb-1 overflow-x-auto scrollbar-hide scroll-snap-x -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center md:pb-2">
                {mainCategories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeMainCategory === category.id;
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className={cn(
                        "relative px-4 py-3 md:py-2.5 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2 flex-shrink-0 touch-target tap-highlight",
                        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20",
                        "data-[state=inactive]:bg-secondary/80 data-[state=inactive]:text-foreground/80 data-[state=inactive]:active:bg-secondary"
                      )}
                    >
                      <Icon className="w-4 h-4 md:w-4 md:h-4" />
                      <span className="whitespace-nowrap">{category.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </Tabs>
        </div>
      </section>

      {/* Search Bar - Optimized for mobile */}
      <section className="py-4 md:py-6 bg-background border-b border-border/30">
        <div className="container-custom px-4">
          <div className="flex flex-col lg:flex-row gap-3 md:gap-4 items-stretch lg:items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 md:h-11 bg-secondary border-border rounded-xl text-base"
              />
            </div>

            {/* Cocktail-specific filters */}
            {activeMainCategory === "cocteles" && (
              <>
                {/* Category Tabs - Desktop */}
                <div className="hidden lg:flex items-center gap-2">
                  {cocktailCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Base Filter */}
                <div className="hidden lg:flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Base:</span>
                  <select
                    value={selectedBase}
                    onChange={(e) => setSelectedBase(e.target.value)}
                    className="bg-secondary border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {bases.map((base) => (
                      <option key={base.id} value={base.id}>
                        {base.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  className="lg:hidden h-12 border-border rounded-xl tap-highlight"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros
                  {(selectedCategory !== "all" || selectedBase !== "all") && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-primary" />
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Filters for Cocktails - Enhanced */}
          {activeMainCategory === "cocteles" && showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-border/30 space-y-4">
              {/* Category filter */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tipo:</label>
                <div className="flex flex-wrap gap-2">
                  {cocktailCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-200 tap-highlight",
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground active:bg-secondary/80"
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Base filter */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Base:</label>
                <select
                  value={selectedBase}
                  onChange={(e) => setSelectedBase(e.target.value)}
                  className="w-full h-12 bg-secondary border border-border rounded-xl px-4 text-base text-foreground"
                >
                  {bases.map((base) => (
                    <option key={base.id} value={base.id}>
                      {base.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content based on selected category */}
      <section ref={contentSectionRef} className="py-6 md:section-padding scroll-mt-36">
        <div className="container-custom px-3 md:px-4">
          {/* CÓCTELES */}
          {activeMainCategory === "cocteles" && (
            <div key={animationKey}>
              {filteredCocktails.length === 0 ? (
                <div className="text-center py-12 md:py-16">
                  <p className="text-muted-foreground text-base md:text-lg">
                    No se encontraron cócteles con esos criterios.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 h-12 rounded-xl tap-highlight"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedBase("all");
                      setSearchTerm("");
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {filteredCocktails.map((cocktail, index) => (
                    <div
                      key={`${animationKey}-${cocktail.id}`}
                      onClick={() => openCocktailModal(cocktail)}
                      style={{ animationDelay: `${index * 40}ms`, opacity: 0 }}
                      className="group cursor-pointer mobile-card animate-stagger-fade-up tap-highlight"
                    >
                      <div className="aspect-[3/4] md:aspect-[4/5] overflow-hidden relative">
                        {/* Image */}
                        <img
                          src={cocktail.image}
                          alt={cocktail.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                        {/* Price badge */}
                        <div className="absolute top-2 right-2 md:top-4 md:right-4">
                          <span className="bg-primary text-primary-foreground text-xs md:text-sm font-semibold px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg">
                            {cocktail.price}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 md:p-5">
                        <h3 className="font-serif text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-200">
                          {cocktail.name}
                        </h3>
                        <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">
                          {cocktail.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CHAMPAGNE */}
          {activeMainCategory === "champagne" && (
            <div key={animationKey} className="space-y-8">
              {/* Header Image with parallax effect */}
              <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-8 animate-scale-fade-in group" style={{ opacity: 0 }}>
                <img
                  src="https://images.unsplash.com/photo-1594372365401-3b5ff14eaaed?w=1200&h=400&fit=crop"
                  alt="Champagne"
                  className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Champagne</h2>
                  <p className="text-muted-foreground text-sm md:text-base">Las mejores burbujas de Francia</p>
                </div>
              </div>
              {loadingChampagnes ? (
                <DrinksSkeleton count={9} />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(champagneData).map((item, index) => (
                    <div
                      key={item.id}
                      style={{ animationDelay: `${index * 50 + 200}ms`, opacity: 0 }}
                      className={cn(
                        "group bg-card border border-border/50 rounded-xl p-5 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 animate-stagger-fade-up cursor-pointer",
                        item.featured && "border-primary/50 bg-gradient-to-br from-card to-primary/5 ring-1 ring-primary/20"
                      )}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                            {item.name}
                          </h3>
                          {item.featured && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary font-medium animate-pulse">
                              <span className="text-gold">✦</span> Premium
                            </span>
                          )}
                        </div>
                        <span className="text-primary font-bold text-lg whitespace-nowrap group-hover:scale-110 transition-transform duration-300">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CAVAS */}
          {activeMainCategory === "cavas" && (
            <div key={animationKey} className="space-y-8">
              {/* Header Image with parallax effect */}
              <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-8 animate-scale-fade-in group" style={{ opacity: 0 }}>
                <img
                  src="https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=1200&h=400&fit=crop"
                  alt="Cavas"
                  className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Cavas</h2>
                  <p className="text-muted-foreground text-sm md:text-base">Espumosos españoles de primera calidad</p>
                </div>
              </div>
              {loadingCavas ? (
                <DrinksSkeleton count={6} />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(cavasData).map((item, index) => (
                    <div
                      key={item.id}
                      style={{ animationDelay: `${index * 50 + 200}ms`, opacity: 0 }}
                      className={cn(
                        "group bg-card border border-border/50 rounded-xl p-5 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 animate-stagger-fade-up cursor-pointer",
                        item.featured && "border-primary/50 bg-gradient-to-br from-card to-primary/5 ring-1 ring-primary/20"
                      )}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                            {item.name}
                          </h3>
                          {item.featured && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary font-medium animate-pulse">
                              <span className="text-gold">✦</span> Premium
                            </span>
                          )}
                        </div>
                        <span className="text-primary font-bold text-lg whitespace-nowrap group-hover:scale-110 transition-transform duration-300">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CERVEZAS */}
          {activeMainCategory === "cervezas" && (
            <div key={animationKey} className="space-y-8">
              <div className="text-center mb-8 animate-scale-fade-in" style={{ opacity: 0 }}>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Cervezas</h2>
                <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-gold mx-auto mb-3" />
                <p className="text-muted-foreground">Selección nacional e internacional</p>
              </div>
              {loadingCervezas ? (
                <DrinksSkeleton count={8} />
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filterBySearch(cervezasData).map((item, index) => (
                    <div
                      key={item.id}
                      style={{ animationDelay: `${index * 50 + 200}ms`, opacity: 0 }}
                      className="group bg-card border border-border/50 rounded-xl p-5 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 animate-stagger-fade-up cursor-pointer"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                            {item.name}
                          </h3>
                          {item.tag && (
                            <span className="inline-block mt-1 text-xs text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full">
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <span className="text-primary font-bold text-lg whitespace-nowrap group-hover:scale-110 transition-transform duration-300">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COPAS DE VINO */}
          {activeMainCategory === "copas" && (
            <div key={animationKey} className="space-y-8">
              <div className="text-center mb-8 animate-scale-fade-in" style={{ opacity: 0 }}>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Copas de Vino, Cava y Champagne</h2>
                <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-gold mx-auto mb-3" />
                <p className="text-muted-foreground">Disfruta por copas de nuestra selección</p>
              </div>
              {loadingCopas ? (
                <DrinksSkeleton count={6} />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(copasData).map((item, index) => (
                    <div
                      key={item.id}
                      style={{ animationDelay: `${index * 50 + 200}ms`, opacity: 0 }}
                      className="group bg-card border border-border/50 rounded-xl p-5 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 animate-stagger-fade-up cursor-pointer"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                            {item.name}
                          </h3>
                          <span className="inline-block mt-1 text-xs text-primary/80">
                            {item.type}
                          </span>
                        </div>
                        <span className="text-primary font-bold text-lg whitespace-nowrap group-hover:scale-110 transition-transform duration-300">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WHISKIES */}
          {activeMainCategory === "whiskies" && (
            <div key={animationKey} className="space-y-8">
              {/* Header Image with parallax effect */}
              <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-8 animate-scale-fade-in group" style={{ opacity: 0 }}>
                <img
                  src="https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=1200&h=400&fit=crop"
                  alt="Whiskies"
                  className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Whiskies</h2>
                  <p className="text-muted-foreground text-sm md:text-base">Selección de los mejores whiskies del mundo</p>
                </div>
              </div>
              {loadingWhiskies ? (
                <DrinksSkeleton count={9} />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterBySearch(whiskiesData).map((item, index) => (
                    <div
                      key={item.id}
                      style={{ animationDelay: `${index * 50 + 200}ms`, opacity: 0 }}
                      className={cn(
                        "group bg-card border border-border/50 rounded-xl p-5 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 animate-stagger-fade-up cursor-pointer",
                        item.featured && "border-primary/50 bg-gradient-to-br from-card to-primary/5 ring-1 ring-primary/20"
                      )}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                            {item.name}
                          </h3>
                          <span className="inline-block mt-1 text-xs text-muted-foreground">
                            {item.type}
                          </span>
                          {item.featured && (
                            <span className="inline-flex items-center gap-1 ml-2 text-xs text-primary font-medium animate-pulse">
                              <span className="text-gold">✦</span> Premium
                            </span>
                          )}
                        </div>
                        <span className="text-primary font-bold text-lg whitespace-nowrap group-hover:scale-110 transition-transform duration-300">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Tapea con tu cóctel - Mobile optimized */}
      <section className="py-10 md:section-padding bg-charcoal">
        <div className="container-custom px-3 md:px-4">
          <div className="text-center mb-8 md:mb-12">
            <span className="text-primary text-xs md:text-sm tracking-[0.2em] uppercase mb-3 md:mb-4 block">
              Maridaje perfecto
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
              Tapea con tu Cóctel
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
              Acompaña tu bebida favorita con nuestras deliciosas tapas.
            </p>
          </div>

          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-3 px-3 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible scroll-snap-x scrollbar-hide">
            {tapasData.map((tapa) => (
              <div
                key={tapa.id}
                className="group bg-card border border-border/50 rounded-xl overflow-hidden flex-shrink-0 w-[260px] md:w-auto tap-highlight"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={tapa.image}
                    alt={tapa.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground">
                      {tapa.name}
                    </h3>
                    <span className="text-primary font-semibold">{tapa.price}</span>
                  </div>
                  <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">{tapa.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cocktail Detail Modal - Mobile fullscreen sheet */}
      <Dialog open={!!selectedCocktail} onOpenChange={() => setSelectedCocktail(null)}>
        <DialogContent className="max-w-2xl w-[95vw] md:w-auto bg-card border-border/50 p-0 overflow-hidden rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] md:max-h-none overflow-y-auto">
          {selectedCocktail && (
            <div className="flex flex-col md:grid md:grid-cols-2">
              {/* Image - Full width on mobile */}
              <div className="aspect-[4/3] md:aspect-auto relative overflow-hidden flex-shrink-0">
                <img
                  src={selectedCocktail.image}
                  alt={selectedCocktail.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/50 md:block hidden" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-secondary/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1.5 rounded-full capitalize">
                    {selectedCocktail.category === "autor" ? "De Autor" : 
                     selectedCocktail.category === "clasicos" ? "Clásico" : "Sin Alcohol"}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5 md:p-8 flex flex-col relative">
                <DialogHeader className="mb-3 md:mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-primary text-2xl md:text-3xl font-bold">
                      {selectedCocktail.price}
                    </span>
                  </div>
                  <DialogTitle className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                    {selectedCocktail.name}
                  </DialogTitle>
                </DialogHeader>
                
                <p className="text-muted-foreground text-sm md:text-base mb-5 md:mb-6 leading-relaxed">
                  {selectedCocktail.description}
                </p>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                    <span className="w-6 md:w-8 h-0.5 bg-gradient-to-r from-primary to-transparent rounded-full" />
                    Ingredientes
                  </h4>
                  <ul className="space-y-2 md:space-y-3">
                    {selectedCocktail.ingredients.map((ingredient, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 text-muted-foreground text-sm md:text-base"
                      >
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gradient-to-r from-primary to-gold flex-shrink-0" />
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Base indicator */}
                <div className="mt-auto pt-5 md:pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">Base:</span>
                    <span className="capitalize">{selectedCocktail.base === "all" ? "Sin alcohol" : selectedCocktail.base}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Carta;

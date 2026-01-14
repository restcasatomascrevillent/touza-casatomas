import { useState, useRef, useEffect } from "react";
import { Search, Filter, Wine, Beer, Martini, GlassWater, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";

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
];

// CÓCTELES REALES DE TOUZA
const cocktailsData = [
  // Cócteles de Autor
  {
    id: 1,
    name: "Green Dream",
    category: "autor",
    base: "ginebra",
    price: "9,00€",
    description: "Un sueño verde refrescante que combina la frescura del kiwi con notas de manzana verde.",
    ingredients: ["Puré de kiwi", "Lima", "Sirope de manzana verde", "Ginebra"],
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&h=600&fit=crop",
  },
  {
    id: 2,
    name: "Beso Escarlata",
    category: "autor",
    base: "ginebra",
    price: "9,00€",
    description: "Un beso de frutos rojos con la elegancia del licor de flor de saúco.",
    ingredients: ["Ginebra", "Zumo de lima", "Licor de flor de saúco", "Fresa", "Frambuesa"],
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&h=600&fit=crop",
  },
  {
    id: 3,
    name: "Furia Frutal",
    category: "autor",
    base: "ron",
    price: "10,00€",
    description: "Una explosión tropical de sabores intensos con un toque de almendra amarga.",
    ingredients: ["Ron especiado", "Licor Chartreuse", "Mango", "Fruta de la pasión", "Lima", "Sirope de almendra amarga"],
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&h=600&fit=crop",
  },
  {
    id: 4,
    name: "Spicy Mango Margarita",
    category: "autor",
    base: "tequila",
    price: "9,00€",
    description: "El clásico mexicano reinventado con mango picante y borde de Tajín.",
    ingredients: ["Tequila", "Zumo de lima", "Triple seco", "Mango picante", "Borde de Tajín"],
    image: "https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=500&h=600&fit=crop",
  },
  // Cócteles Clásicos
  {
    id: 5,
    name: "Pornstar Martini",
    category: "clasicos",
    base: "vodka",
    price: "10,00€",
    description: "El sensual clásico moderno con fruta de la pasión y su chupito de cava.",
    ingredients: ["Vodka", "Vainilla", "Lima", "Licor de fruta de la pasión", "Chupito de cava"],
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&h=600&fit=crop",
  },
  {
    id: 6,
    name: "Clover Club",
    category: "clasicos",
    base: "ginebra",
    price: "8,50€",
    description: "Elegante cóctel pre-prohibición con frambuesa fresca y espuma sedosa.",
    ingredients: ["Ginebra", "Limón", "Frambuesa"],
    image: "https://images.unsplash.com/photo-1527761939622-9119094290d4?w=500&h=600&fit=crop",
  },
  {
    id: 7,
    name: "Piña Colada",
    category: "clasicos",
    base: "ron",
    price: "8,50€",
    description: "El clásico tropical cremoso con coco natural y piña fresca.",
    ingredients: ["Ron blanco", "Zumo de piña", "Puré de coco"],
    image: "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=500&h=600&fit=crop",
  },
  {
    id: 8,
    name: "Aperol Spritz",
    category: "clasicos",
    base: "aperol",
    price: "8,50€",
    description: "El aperitivo italiano por excelencia, refrescante y vibrante.",
    ingredients: ["Aperol", "Vino espumoso", "Soda"],
    image: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=500&h=600&fit=crop",
  },
  {
    id: 9,
    name: "Mojito",
    category: "clasicos",
    base: "ron",
    price: "8,50€",
    description: "El inmortal cubano con hierbabuena fresca machacada a mano.",
    ingredients: ["Ron", "Lima", "Sirope de caña", "Hierbabuena"],
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&h=600&fit=crop",
  },
  {
    id: 10,
    name: "Moscow Mule",
    category: "clasicos",
    base: "vodka",
    price: "8,50€",
    description: "Refrescante y especiado, servido en su icónica taza de cobre.",
    ingredients: ["Vodka", "Ginger beer", "Lima"],
    image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=500&h=600&fit=crop",
  },
  // Mocktails (Sin Alcohol)
  {
    id: 11,
    name: "Colada Virgen",
    category: "sin-alcohol",
    base: "all",
    price: "7,00€",
    description: "Toda la cremosidad tropical sin alcohol.",
    ingredients: ["Coco", "Puré de piña", "Zumo de piña"],
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=600&fit=crop",
  },
  {
    id: 12,
    name: "Ipanema",
    category: "sin-alcohol",
    base: "all",
    price: "7,00€",
    description: "La versión brasileña sin alcohol del mojito, refrescante y tropical.",
    ingredients: ["Zumo de lima", "Piña natural", "Ginger beer"],
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&h=600&fit=crop",
  },
  {
    id: 13,
    name: "Mojito Virgen",
    category: "sin-alcohol",
    base: "all",
    price: "7,00€",
    description: "Toda la frescura del mojito con variantes de sabor: frambuesa, fruta de la pasión o jabuticaba.",
    ingredients: ["Lima", "Frambuesa / Fruta de la pasión / Jabuticaba", "Hierbabuena", "Soda"],
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&h=600&fit=crop",
  },
];

// CHAMPAGNE
const champagneData = [
  { id: 1, name: "Roederer Collection 243", price: "80,00€" },
  { id: 2, name: "Roederer Brut Vintage Rosé 2012", price: "200,00€" },
  { id: 3, name: "Roederer Brut Vintage Rosé 2016", price: "120,00€" },
  { id: 4, name: "Roederer Brut Vintage Rosé Magnum", price: "198,00€" },
  { id: 5, name: "Roederer Cristal", price: "420,00€", featured: true },
  { id: 6, name: "Laurent-Perrier La Cuvée", price: "68,00€" },
  { id: 7, name: "Laurent-Perrier Ultra Brut", price: "87,00€" },
  { id: 8, name: "Laurent-Perrier Millésime 2012", price: "110,00€" },
  { id: 9, name: "Laurent-Perrier Rosé", price: "110,00€" },
  { id: 10, name: "Laurent-Perrier Magnum", price: "155,00€" },
  { id: 11, name: "Laurent-Perrier Rosé Magnum", price: "250,00€" },
  { id: 12, name: "Louis Martin Rosé", price: "150,00€" },
  { id: 13, name: "Cuvée Vincent Blanc de Blancs Brut", price: "180,00€" },
  { id: 14, name: "Louis Martin Grand Cru", price: "130,00€" },
  { id: 15, name: "Martel Prestige Brut", price: "48,50€" },
  { id: 16, name: "Martel Premier Cru", price: "65,90€" },
  { id: 17, name: "Martel Blanc de Blanc", price: "65,50€" },
  { id: 18, name: "Martel Rosé Brut", price: "55,00€" },
  { id: 19, name: "Roederer Brut Vintage 2015", price: "110,00€" },
  { id: 20, name: "Martel Victoire Celebration 150 Aniversario", price: "78,50€" },
  { id: 21, name: "Collet Brut", price: "51,00€" },
  { id: 22, name: "Collet Rosé", price: "66,00€" },
  { id: 23, name: "Dom Pérignon Plénitude 2 - 2002", price: "735,00€", featured: true },
  { id: 24, name: "Dom Pérignon Rosé Vintage 2005", price: "530,00€", featured: true },
  { id: 25, name: "Laurent-Perrier Alexandra Rosé", price: "620,00€", featured: true },
  { id: 26, name: "Laurent-Perrier Gran Siècle", price: "320,00€", featured: true },
  { id: 27, name: "Krug Grande Cuvée 170 Ed.", price: "295,00€", featured: true },
  { id: 28, name: "Moët Chandon Grand Vintage", price: "115,00€" },
  { id: 29, name: "Moët Grand Vintage Rosé", price: "125,00€" },
  { id: 30, name: "Philippe Gonet Signature", price: "68,00€" },
  { id: 31, name: "Piper-Heidsieck", price: "56,00€" },
  { id: 32, name: "Piper-Heidsieck Rosado", price: "60,00€" },
  { id: 33, name: "Ruinart Rosé", price: "110,00€" },
  { id: 34, name: "Ruinart Blanc de Blancs", price: "125,00€" },
  { id: 35, name: "Laurent-Perrier Millésime 2015", price: "130,00€" },
  { id: 36, name: "Dom Pérignon Vintage 2013", price: "320,00€", featured: true },
];

// CAVAS
const cavasData = [
  { id: 1, name: "Agustí Torelló", price: "35,00€" },
  { id: 2, name: "Agustí Torelló Kripta G.Rva.", price: "90,00€", featured: true },
  { id: 3, name: "Crémant de Chanceny Brut Rosé", price: "27,00€" },
  { id: 4, name: "Edone Cuvée de María", price: "18,50€" },
  { id: 5, name: "Edone Grand Cuvée Magnum", price: "50,00€" },
  { id: 6, name: "Edone Grand Cuvée", price: "25,00€" },
  { id: 7, name: "Juvé & Camps Rva. Familia", price: "27,00€" },
  { id: 8, name: "Juvé & Camps Millésime", price: "35,00€" },
  { id: 9, name: "Juvé & Camps Gran Juvé", price: "50,00€", featured: true },
  { id: 10, name: "Mirgin Gran Reserva", price: "22,50€" },
  { id: 11, name: "Torelló", price: "26,50€" },
  { id: 12, name: "Torelló Rosé", price: "27,50€" },
  { id: 13, name: "Torelló Rosé Magnum", price: "61,60€" },
];

// CERVEZAS
const cervezasData = [
  { id: 1, name: "Heineken", price: "3,00€" },
  { id: 2, name: "Heineken 0.0", price: "3,00€", tag: "Sin Alcohol" },
  { id: 3, name: "Amstel Oro 0.0", price: "3,00€", tag: "Sin Alcohol" },
  { id: 4, name: "Desperados", price: "3,50€" },
  { id: 5, name: "Sol", price: "3,50€" },
  { id: 6, name: "Rubia 18/70", price: "3,50€" },
  { id: 7, name: "Cruz Campo Sin Gluten", price: "3,00€", tag: "Sin Gluten" },
  { id: 8, name: "Cruz Campo Gran Reserva", price: "3,50€" },
  { id: 9, name: "Radler", price: "3,00€" },
  { id: 10, name: "Mort Subite", price: "3,00€" },
  { id: 11, name: "Águila Dorada", price: "3,00€" },
  { id: 12, name: "Judas", price: "4,00€", tag: "Especial" },
  { id: 13, name: "Ladrón de Manzanas", price: "3,00€", tag: "Sidra" },
  { id: 14, name: "Águila Sin Filtrar", price: "3,50€" },
  { id: 15, name: "Alcázar", price: "4,00€" },
  { id: 16, name: "Paulaner", price: "4,50€", tag: "Premium" },
];

// COPAS DE VINO, CAVA Y CHAMPAGNE
const copasData = [
  { id: 1, name: "Copa Ribera del Duero Aster Crianza", price: "4,50€", type: "Tinto" },
  { id: 2, name: "Copa Rosado Marqués de Riscal XR", price: "4,50€", type: "Rosado" },
  { id: 3, name: "Copa Verdejo", price: "4,50€", type: "Blanco" },
  { id: 4, name: "Copa Cava Edone", price: "5,00€", type: "Cava" },
  { id: 5, name: "Copa Champagne Laurent-Perrier", price: "13,50€", type: "Champagne" },
  { id: 6, name: "Copa Cava Juvé & Camps", price: "5,00€", type: "Cava" },
  { id: 7, name: "Copa Cava Rosado", price: "5,00€", type: "Cava" },
  { id: 8, name: "Copa Vino Dulce Oremus Tokaji", price: "12,00€", type: "Dulce" },
  { id: 9, name: "Copa Champagne Laurent-Perrier Rosé", price: "25,00€", type: "Champagne" },
  { id: 10, name: "Copa Champagne Laurent-Perrier Millésime", price: "28,00€", type: "Champagne" },
  { id: 11, name: "Copa Champagne Laurent-Perrier Ultra Brut", price: "25,00€", type: "Champagne" },
];

// WHISKIES
const whiskiesData = [
  { id: 1, name: "Johnnie Walker Red Label", price: "7,00€", type: "Blend" },
  { id: 2, name: "Johnnie Walker Black Label", price: "9,00€", type: "Blend 12 años" },
  { id: 3, name: "Johnnie Walker Green Label", price: "12,00€", type: "Blended Malt 15 años" },
  { id: 4, name: "Johnnie Walker Blue Label", price: "40,00€", type: "Premium Blend", featured: true },
  { id: 5, name: "Jack Daniel's Rye", price: "8,00€", type: "Tennessee Rye" },
  { id: 6, name: "Jack Daniel's Gentleman Jack", price: "9,00€", type: "Tennessee Whiskey" },
  { id: 7, name: "Jack Daniel's Single Barrel Select", price: "11,00€", type: "Single Barrel" },
  { id: 8, name: "Glenrothes 12", price: "10,00€", type: "Single Malt, Speyside" },
  { id: 9, name: "Glenfarclas Family Malt", price: "8,00€", type: "Single Malt, Speyside" },
  { id: 10, name: "Dewar's 12 Double Aged", price: "10,00€", type: "Blend" },
  { id: 11, name: "Monkey Shoulder", price: "8,00€", type: "Blend, Speyside" },
  { id: 12, name: "The Kurayoshi Pure Malt 12 años", price: "15,00€", type: "Japanese Whisky", featured: true },
  { id: 13, name: "Lagavulin 8", price: "10,00€", type: "Single Malt, Islay" },
  { id: 14, name: "Aberfeldy 12 años", price: "9,00€", type: "Single Malt, Highlands" },
  { id: 15, name: "Ballantine's", price: "7,00€", type: "Blend" },
  { id: 16, name: "Ballantine's 10", price: "8,00€", type: "Blend 10 años" },
  { id: 17, name: "Ballantine's Light", price: "7,00€", type: "Blend Light" },
  { id: 18, name: "Chivas Regal 18", price: "15,00€", type: "Blend Premium", featured: true },
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

const Carta = () => {
  const [activeMainCategory, setActiveMainCategory] = useState("cocteles");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBase, setSelectedBase] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCocktail, setSelectedCocktail] = useState<typeof cocktailsData[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [tabIndicatorStyle, setTabIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  
  const contentSectionRef = useRef<HTMLElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const { ref: heroRef, isVisible: heroVisible } = useAnimateOnScroll<HTMLDivElement>();

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
  const openCocktailModal = (cocktail: typeof cocktailsData[0]) => {
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

      {/* Main Category Tabs with animated indicator */}
      <section className="py-6 border-y border-border/30 bg-charcoal/95 backdrop-blur-md sticky top-[73px] z-40 transition-all duration-300">
        <div className="container-custom">
          <Tabs value={activeMainCategory} onValueChange={handleCategoryChange} className="w-full">
            <div ref={tabsContainerRef} className="relative">
              {/* Animated indicator */}
              <div 
                className="absolute bottom-0 h-0.5 bg-gradient-to-r from-primary via-gold to-primary rounded-full transition-all duration-500 ease-out"
                style={{
                  left: tabIndicatorStyle.left,
                  width: tabIndicatorStyle.width,
                  boxShadow: '0 0 10px hsl(var(--primary) / 0.5)',
                }}
              />
              <TabsList className="w-full h-auto flex-wrap justify-start gap-2 bg-transparent p-0 pb-2">
                {mainCategories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeMainCategory === category.id;
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className={cn(
                        "relative px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 overflow-hidden group",
                        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20",
                        "data-[state=inactive]:bg-secondary/80 data-[state=inactive]:text-foreground data-[state=inactive]:hover:bg-secondary data-[state=inactive]:hover:scale-105"
                      )}
                    >
                      {/* Ripple effect on hover */}
                      <span className="absolute inset-0 bg-primary/20 scale-0 rounded-full transition-transform duration-500 group-hover:scale-150 opacity-0 group-hover:opacity-100" />
                      <Icon className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">{category.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </Tabs>
        </div>
      </section>

      {/* Search Bar - Common for all categories */}
      <section className="py-6 bg-background border-b border-border/30">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
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
                        "px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
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
                  className="lg:hidden border-border"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </>
            )}
          </div>

          {/* Mobile Filters for Cocktails */}
          {activeMainCategory === "cocteles" && showFilters && (
            <div className="lg:hidden mt-6 pt-6 border-t border-border/30">
              <div className="flex flex-wrap gap-2 mb-4">
                {cocktailCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              <select
                value={selectedBase}
                onChange={(e) => setSelectedBase(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-sm text-foreground"
              >
                {bases.map((base) => (
                  <option key={base.id} value={base.id}>
                    Base: {base.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Content based on selected category */}
      <section ref={contentSectionRef} className="section-padding scroll-mt-36">
        <div className="container-custom">
          {/* CÓCTELES */}
          {activeMainCategory === "cocteles" && (
            <div key={animationKey}>
              {filteredCocktails.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">
                    No se encontraron cócteles con esos criterios.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCocktails.map((cocktail, index) => (
                    <div
                      key={`${animationKey}-${cocktail.id}`}
                      onClick={() => openCocktailModal(cocktail)}
                      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
                      className="group cursor-pointer bg-card border border-border/50 rounded-xl overflow-hidden transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 animate-stagger-fade-up hover:-translate-y-2 card-hover-lift"
                    >
                      <div className="aspect-[4/5] overflow-hidden relative">
                        {/* Image with zoom and overlay */}
                        <img
                          src={cocktail.image}
                          alt={cocktail.name}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-90"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                        {/* Animated gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        {/* Price badge with shimmer */}
                        <div className="absolute top-4 right-4">
                          <span className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1.5 rounded-full shadow-lg group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105 inline-block">
                            <span className="relative">
                              {cocktail.price}
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </span>
                          </span>
                        </div>
                        {/* View indicator */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <span className="bg-background/90 backdrop-blur-sm text-foreground px-4 py-2 rounded-full text-sm font-medium transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                            Ver detalles
                          </span>
                        </div>
                      </div>
                      <div className="p-5 relative overflow-hidden">
                        {/* Subtle background glow on hover */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 relative">
                          {cocktail.name}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 relative">
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
            </div>
          )}
        </div>
      </section>

      {/* Tapea con tu cóctel */}
      <section className="section-padding bg-charcoal">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
              Maridaje perfecto
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tapea con tu Cóctel
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Acompaña tu bebida favorita con nuestras deliciosas tapas, 
              inspiradas en la gastronomía gallega y mediterránea.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tapasData.map((tapa) => (
              <div
                key={tapa.id}
                className="group bg-card border border-border/50 rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={tapa.image}
                    alt={tapa.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-xl font-semibold text-foreground">
                      {tapa.name}
                    </h3>
                    <span className="text-primary font-semibold">{tapa.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{tapa.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cocktail Detail Modal - Enhanced with animations */}
      <Dialog open={!!selectedCocktail} onOpenChange={() => setSelectedCocktail(null)}>
        <DialogContent className={cn(
          "max-w-2xl bg-card border-border/50 p-0 overflow-hidden rounded-2xl shadow-2xl",
          "data-[state=open]:animate-blur-in",
          isModalAnimating && "scale-95 opacity-0"
        )}>
          {selectedCocktail && (
            <div className="grid md:grid-cols-2">
              {/* Image with parallax-like effect */}
              <div className="aspect-square md:aspect-auto relative overflow-hidden group">
                <img
                  src={selectedCocktail.image}
                  alt={selectedCocktail.name}
                  className="w-full h-full object-cover scale-105 transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/50 md:block hidden" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:hidden" />
                {/* Category badge */}
                <div className="absolute top-4 left-4 animate-slide-down" style={{ animationDelay: '200ms' }}>
                  <span className="bg-secondary/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1.5 rounded-full capitalize">
                    {selectedCocktail.category === "autor" ? "De Autor" : 
                     selectedCocktail.category === "clasicos" ? "Clásico" : "Sin Alcohol"}
                  </span>
                </div>
              </div>
              
              {/* Content with staggered animations */}
              <div className="p-8 flex flex-col relative">
                {/* Decorative glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                
                <DialogHeader className="mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-primary text-3xl font-bold animate-scale-fade-in" style={{ animationDelay: '200ms' }}>
                      {selectedCocktail.price}
                    </span>
                  </div>
                  <DialogTitle className="font-serif text-3xl font-bold text-foreground animate-slide-up" style={{ animationDelay: '150ms' }}>
                    {selectedCocktail.name}
                  </DialogTitle>
                </DialogHeader>
                
                <p className="text-muted-foreground mb-6 animate-fade-in leading-relaxed" style={{ animationDelay: '250ms' }}>
                  {selectedCocktail.description}
                </p>
                
                <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-gradient-to-r from-primary to-transparent rounded-full" />
                    Ingredientes
                  </h4>
                  <ul className="space-y-3">
                    {selectedCocktail.ingredients.map((ingredient, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 text-muted-foreground animate-slide-in-left"
                        style={{ animationDelay: `${350 + index * 80}ms`, opacity: 0 }}
                      >
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-gold flex-shrink-0 animate-pulse" />
                        <span className="transition-colors hover:text-foreground">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Base indicator */}
                <div className="mt-auto pt-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
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

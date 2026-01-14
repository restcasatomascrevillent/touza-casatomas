import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";

// Categorías de cócteles
const categories = [
  { id: "all", name: "Todos" },
  { id: "signature", name: "Signature" },
  { id: "clasicos", name: "Clásicos" },
  { id: "tropicales", name: "Tropicales" },
  { id: "sin-alcohol", name: "Sin Alcohol" },
];

// Bases de cócteles para filtrar
const bases = [
  { id: "all", name: "Todas" },
  { id: "gin", name: "Ginebra" },
  { id: "vodka", name: "Vodka" },
  { id: "ron", name: "Ron" },
  { id: "whisky", name: "Whisky" },
  { id: "tequila", name: "Tequila" },
];

// Datos de ejemplo de cócteles
const cocktailsData = [
  {
    id: 1,
    name: "Touza Signature",
    category: "signature",
    base: "gin",
    price: "12€",
    description: "Nuestra creación estrella que fusiona los sabores de Galicia con el Mediterráneo.",
    ingredients: ["Ginebra Premium", "Cítricos mediterráneos", "Romero fresco", "Tónica artesanal"],
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&h=600&fit=crop",
  },
  {
    id: 2,
    name: "Mediterranean Sunset",
    category: "tropicales",
    base: "ron",
    price: "11€",
    description: "Una explosión de sabores tropicales con un toque mediterráneo único.",
    ingredients: ["Ron añejo", "Maracuyá fresca", "Lima", "Especias exóticas", "Sirope de agave"],
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&h=600&fit=crop",
  },
  {
    id: 3,
    name: "Galician Mist",
    category: "signature",
    base: "gin",
    price: "13€",
    description: "Un homenaje a nuestras raíces gallegas con ingredientes autóctonos.",
    ingredients: ["Orujo gallego", "Miel de brezo", "Esencia de eucalipto", "Cítricos"],
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&h=600&fit=crop",
  },
  {
    id: 4,
    name: "Old Fashioned",
    category: "clasicos",
    base: "whisky",
    price: "10€",
    description: "El clásico por excelencia, preparado con la técnica tradicional.",
    ingredients: ["Bourbon", "Angostura", "Azúcar moreno", "Piel de naranja"],
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&h=600&fit=crop",
  },
  {
    id: 5,
    name: "Mojito Especial",
    category: "clasicos",
    base: "ron",
    price: "9€",
    description: "Nuestra versión del clásico cubano con hierbabuena fresca del huerto.",
    ingredients: ["Ron blanco", "Hierbabuena fresca", "Lima", "Soda", "Azúcar de caña"],
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&h=600&fit=crop",
  },
  {
    id: 6,
    name: "Margarita",
    category: "clasicos",
    base: "tequila",
    price: "10€",
    description: "El icónico cóctel mexicano con el equilibrio perfecto.",
    ingredients: ["Tequila reposado", "Triple sec", "Lima fresca", "Sal"],
    image: "https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=500&h=600&fit=crop",
  },
  {
    id: 7,
    name: "Piña Colada Artesanal",
    category: "tropicales",
    base: "ron",
    price: "11€",
    description: "Cremosa y refrescante, elaborada con coco natural.",
    ingredients: ["Ron añejo", "Crema de coco", "Piña natural", "Nata"],
    image: "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=500&h=600&fit=crop",
  },
  {
    id: 8,
    name: "Virgin Sunrise",
    category: "sin-alcohol",
    base: "all",
    price: "7€",
    description: "Refrescante y vibrante, perfecto para cualquier momento.",
    ingredients: ["Zumo de naranja", "Granadina", "Lima", "Soda", "Frutas frescas"],
    image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=500&h=600&fit=crop",
  },
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBase, setSelectedBase] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCocktail, setSelectedCocktail] = useState<typeof cocktailsData[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar cócteles
  const filteredCocktails = cocktailsData.filter((cocktail) => {
    const matchesCategory = selectedCategory === "all" || cocktail.category === selectedCategory;
    const matchesBase = selectedBase === "all" || cocktail.base === selectedBase;
    const matchesSearch = cocktail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cocktail.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesBase && matchesSearch;
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1574096079513-d8259312b785?w=1920&h=600&fit=crop"
            alt="Cócteles"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        <div className="relative z-10 container-custom text-center">
          <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
            Explora
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            Nuestra Carta
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Cada cóctel es una obra de arte líquida, elaborada con pasión 
            y los ingredientes más selectos.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-y border-border/30 bg-charcoal sticky top-[73px] z-40">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar cóctel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>

            {/* Category Tabs - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {categories.map((category) => (
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
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-6 pt-6 border-t border-border/30">
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
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

      {/* Cocktails Grid */}
      <section className="section-padding">
        <div className="container-custom">
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
              {filteredCocktails.map((cocktail) => (
                <div
                  key={cocktail.id}
                  onClick={() => setSelectedCocktail(cocktail)}
                  className="group cursor-pointer bg-card border border-border/50 rounded-lg overflow-hidden transition-all duration-500 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img
                      src={cocktail.image}
                      alt={cocktail.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full">
                        {cocktail.price}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {cocktail.name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {cocktail.description}
                    </p>
                  </div>
                </div>
              ))}
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
              Acompaña tu cóctel favorito con nuestras deliciosas tapas, 
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

      {/* Cocktail Detail Modal */}
      <Dialog open={!!selectedCocktail} onOpenChange={() => setSelectedCocktail(null)}>
        <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden">
          {selectedCocktail && (
            <div className="grid md:grid-cols-2">
              <div className="aspect-square md:aspect-auto">
                <img
                  src={selectedCocktail.image}
                  alt={selectedCocktail.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex flex-col">
                <DialogHeader className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-primary text-2xl font-bold">
                      {selectedCocktail.price}
                    </span>
                  </div>
                  <DialogTitle className="font-serif text-3xl font-bold text-foreground">
                    {selectedCocktail.name}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground mb-6">
                  {selectedCocktail.description}
                </p>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Ingredientes</h4>
                  <ul className="space-y-2">
                    {selectedCocktail.ingredients.map((ingredient, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {ingredient}
                      </li>
                    ))}
                  </ul>
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

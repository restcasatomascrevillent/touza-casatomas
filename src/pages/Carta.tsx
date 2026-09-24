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
import { useVinos, useVinosRestantes, transformVinosToUI, type VinoUI } from "@/hooks/useVinos";
import { agruparVinosPorTipo, capitalizarEtiqueta } from "@/lib/vinos-carta";
import { useBebidas, transformBebidasToUI, type BebidaUI } from "@/hooks/useBebidas";
import { usePlatosTouza, transformPlatosToUI } from "@/hooks/usePlatos";
import { AVISO_SIN_ALERGENOS } from "@/lib/alergenos";
import { Skeleton } from "@/components/ui/skeleton";
import Seo from "@/components/Seo";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useIsMobile } from "@/hooks/use-mobile";
import { CocktailHoverOutlineSVG } from "@/components/ui/svg/CocktailHoverOutlineSVG";
import { IMAGENES } from "@/assets/imagenes";
import { canonical } from "@/lib/site";
import { menuSchema } from "@/lib/negocio";
import { CARTA_SSG } from "@/lib/carta-ssg";

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

// CHAMPAGNES y CAVAS Y OTROS ESPUMOSOS son las dos únicas categorías de
// Vinos sin denominación de origen (no llevan "—"), así que siguen pidiendo
// su propia pestaña fija con useVinos(categoria). Todo lo demás (tintos,
// blancos...) se pide de una vez con useVinosRestantes excluyendo estas dos,
// y se agrupa en pestañas dinámicas — ver gruposVino más abajo.
const CATEGORIAS_VINO_FIJAS = ["CHAMPAGNES", "CAVAS Y OTROS ESPUMOSOS"];

// Pestañas que no dependen de datos: cócteles, los dos vinos sin
// denominación y las bebidas. Las pestañas de vino con denominación
// (Blancos, Tintos...) se insertan entre "cavas" y "cervezas" en tabsCarta,
// derivadas de gruposVino para que una categoría nueva en el admin no vuelva
// a quedarse sin pestaña.
const mainCategoriesAntesDeVinos = [
  { id: "cocteles", name: "Cócteles" },
  { id: "champagne", name: "Champagne" },
  { id: "cavas", name: "Cavas" },
];
const mainCategoriesDespuesDeVinos = [
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

  // El filtro secundario (pills bajo el buscador) cambia de significado según
  // la pestaña activa: categoría de cóctel, o denominación de vino. Si no se
  // reinicia al cambiar de pestaña, un filtro elegido en "Tintos" (p.ej.
  // "Rioja") se arrastraría a "Blancos" y no encajaría con ninguna
  // denominación de esa pestaña, dejando la lista vacía.
  useEffect(() => { setSelectedCategory("all"); }, [activeMainCategory]);

  const { data: coctelesData, isLoading: loadingCocteles } = useCocteles();
  const cocktailsData = useMemo(() => transformCoctelesToUI(coctelesData), [coctelesData]);
  const { data: champagnesRaw, isLoading: loadingChampagnes } = useVinos('CHAMPAGNES');
  const { data: cavasRaw, isLoading: loadingCavas } = useVinos('CAVAS Y OTROS ESPUMOSOS');
  const champagneData = useMemo(() => transformVinosToUI(champagnesRaw), [champagnesRaw]);
  const cavasData = useMemo(() => transformVinosToUI(cavasRaw), [cavasRaw]);
  // Resto de vinos con denominación de origen (tintos, blancos...): una sola
  // consulta para todo, agrupada por tipo real de los datos en vez de
  // categorías escritas a mano. Ver src/lib/vinos-carta.ts.
  //
  // `useVinosRestantes` no tiene instantánea de build propia (no siembra con
  // `initialData`, a diferencia de useVinos/useCocteles/useBebidas/usePlatos
  // — ver el comentario en su definición), así que en el primer render
  // —tanto en Node durante `vite-react-ssg build` como en el navegador antes
  // de que resuelva su fetch— `vinosRestoRaw` viene `undefined`. Sin más,
  // `gruposVino` saldría `[]` y las pestañas Blancos/Tintos no existirían en
  // el HTML prerenderizado (el bug que arregla este cambio). `vinosRestoSSG`
  // cubre ese hueco con la instantánea de `CARTA_SSG.vinos` —ahora con TODAS
  // las categorías reales, no solo las dos fijas, ver
  // scripts/carta-ssg-plugin.mjs— para que el primer render, en Node y en el
  // navegador, ya tenga los mismos datos; en cuanto `useVinosRestantes`
  // resuelve su fetch real, `gruposVino` se recalcula con esos datos frescos.
  const vinosRestoSSG = useMemo(() => {
    if (!CARTA_SSG) return undefined;
    return Object.entries(CARTA_SSG.vinos)
      .filter(([categoria]) => !CATEGORIAS_VINO_FIJAS.includes(categoria))
      .flatMap(([, vinosDeCategoria]) => vinosDeCategoria);
  }, []);
  const { data: vinosRestoRaw } = useVinosRestantes(CATEGORIAS_VINO_FIJAS);
  const gruposVino = useMemo(
    () => agruparVinosPorTipo(vinosRestoRaw ?? vinosRestoSSG ?? []),
    [vinosRestoRaw, vinosRestoSSG]
  );
  const tabsCarta = useMemo(
    () => [
      ...mainCategoriesAntesDeVinos,
      ...gruposVino.map((grupo) => ({ id: grupo.id, name: grupo.etiqueta })),
      ...mainCategoriesDespuesDeVinos,
    ],
    [gruposVino]
  );
  const { data: cervezasRaw, isLoading: loadingCervezas } = useBebidas('Cervezas');
  const { data: copasRaw, isLoading: loadingCopas } = useBebidas('Copas');
  const { data: whiskiesRaw, isLoading: loadingWhiskies } = useBebidas('Whiskies');
  const cervezasData = useMemo(() => transformBebidasToUI(cervezasRaw), [cervezasRaw]);
  const copasData = useMemo(() => transformBebidasToUI(copasRaw), [copasRaw]);
  const whiskiesData = useMemo(() => transformBebidasToUI(whiskiesRaw), [whiskiesRaw]);

  const { data: platosRaw, isLoading: loadingPlatos } = usePlatosTouza();
  const tapasData = useMemo(() => transformPlatosToUI(platosRaw), [platosRaw]);

  // JSON-LD `Menu` con TODA la carta, no solo la pestaña activa.
  // En pantalla champagnes, cavas, cervezas, copas y whiskies viven detrás de
  // una pestaña, así que no están en el HTML inicial; aquí sí llegan, con
  // nombre y precio, legibles por buscadores y por asistentes de IA.
  // Se construye desde la instantánea del build (constante) para que el HTML
  // prerenderizado y el de la hidratación sean idénticos.
  const schemaCarta = useMemo(() => {
    if (!CARTA_SSG) return undefined;
    // Blancos, Tintos y cualquier otra denominación: una sección de Menu por
    // cada categoría real de CARTA_SSG.vinos que no sea Champagnes/Cavas
    // (esas dos ya tienen su sección fija justo debajo, con su nombre
    // legible de siempre). Reutiliza capitalizarEtiqueta (src/lib/vinos-carta.ts)
    // para el nombre de sección en vez de mostrar la categoría en bruto de
    // la base de datos ("VINOS TINTOS — RIBERA DEL DUERO").
    const seccionesVinoResto = Object.entries(CARTA_SSG.vinos)
      .filter(([categoria]) => !CATEGORIAS_VINO_FIJAS.includes(categoria))
      .map(([categoria, vinosDeCategoria]) => ({
        nombre: capitalizarEtiqueta(categoria),
        items: vinosDeCategoria,
      }));
    return menuSchema([
      { nombre: "Cócteles", items: CARTA_SSG.cocteles },
      { nombre: "Champagnes", items: CARTA_SSG.vinos["CHAMPAGNES"] ?? [] },
      { nombre: "Cavas y otros espumosos", items: CARTA_SSG.vinos["CAVAS Y OTROS ESPUMOSOS"] ?? [] },
      ...seccionesVinoResto,
      { nombre: "Cervezas", items: CARTA_SSG.bebidas["Cervezas"] ?? [] },
      { nombre: "Copas de vino", items: CARTA_SSG.bebidas["Copas"] ?? [] },
      { nombre: "Whiskies", items: CARTA_SSG.bebidas["Whiskies"] ?? [] },
      { nombre: "Tapas", items: CARTA_SSG.platos },
    ]);
  }, []);

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

  // Grupo de vino (Blancos, Tintos...) que corresponde a la pestaña activa,
  // si la activa es una de vino con denominación. `undefined` en cualquier
  // otra pestaña (cócteles, champagne, cavas, cervezas, copas, whiskies).
  const grupoVinoActivo = useMemo(
    () => gruposVino.find((grupo) => grupo.id === activeMainCategory),
    [gruposVino, activeMainCategory]
  );

  // Pills bajo el buscador: categorías de cóctel en "Cócteles", denominación
  // de origen en una pestaña de vino con más de una denominación, nada en el
  // resto (igual que hoy en Champagne, Cavas, Cervezas...).
  const subFilterOptions = useMemo(() => {
    if (activeMainCategory === "cocteles") return cocktailCategories;
    if (grupoVinoActivo && grupoVinoActivo.denominaciones.length > 1) {
      return [
        { id: "all", name: "Todos" },
        ...grupoVinoActivo.denominaciones.map((denom) => ({ id: denom.id, name: denom.etiqueta })),
      ];
    }
    return [];
  }, [activeMainCategory, grupoVinoActivo]);

  // Datos de la pestaña "genérica" activa (todo lo que no es cócteles):
  // champagne/cavas/cervezas/copas/whiskies son fijos; una pestaña de vino
  // con denominación se resuelve contra grupoVinoActivo y, si hay una
  // denominación concreta seleccionada, se filtra a esa.
  const activeDrinkData = useMemo<(VinoUI | BebidaUI)[]>(() => {
    switch (activeMainCategory) {
      case "champagne": return champagneData;
      case "cavas": return cavasData;
      case "cervezas": return cervezasData;
      case "copas": return copasData;
      case "whiskies": return whiskiesData;
      default:
        if (!grupoVinoActivo) return [];
        if (selectedCategory === "all") return grupoVinoActivo.vinos;
        return (
          grupoVinoActivo.denominaciones.find((denom) => denom.id === selectedCategory)?.vinos ??
          grupoVinoActivo.vinos
        );
    }
  }, [activeMainCategory, champagneData, cavasData, cervezasData, copasData, whiskiesData, grupoVinoActivo, selectedCategory]);

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
        title="Carta de Cócteles y Bebidas"
        description="Explora nuestra selección de cócteles de autor, vinos premium y más."
        canonical={canonical("/carta")}
        keywords={['carta', 'menú', 'cócteles', 'precios']}
        schema={schemaCarta}
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
            imagen={IMAGENES.barra}
            alt="Barra de Touza"
            className="w-full h-full object-cover"
            sizes="100vw"
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
                {tabsCarta.map((cat) => (
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

          {subFilterOptions.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {subFilterOptions.map(cat => (
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
                    {cocktail.alergenos.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {cocktail.alergenos.map((alergeno) => (
                          <span
                            key={alergeno}
                            className="px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-white/50 font-light uppercase tracking-wide"
                          >
                            {alergeno}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-[10px] text-destructive uppercase tracking-wide font-light">
                        {AVISO_SIN_ALERGENOS}
                      </p>
                    )}
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
                // Blancos/Tintos no necesitan su propia condición aquí: al
                // derivarse de gruposVino, esas pestañas solo existen (y por
                // tanto solo se pueden seleccionar) una vez que sus datos ya
                // han llegado — ver tabsCarta.
              ) ? <DrinksSkeleton /> : null}

              {filterBySearch(activeDrinkData).map((drink, index) => (
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
                      {tapa.alergenos.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tapa.alergenos.map((alergeno) => (
                            <span
                              key={alergeno}
                              className="px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-white/50 font-light uppercase tracking-wide"
                            >
                              {alergeno}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-[10px] text-destructive uppercase tracking-wide font-light">
                          {AVISO_SIN_ALERGENOS}
                        </p>
                      )}
                      {tapa.alergenosNota && (
                        <p className="mt-1 text-[10px] italic text-destructive/90">{tapa.alergenosNota}</p>
                      )}
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
                  <div className="mt-6">
                    <h4 className="text-xs uppercase tracking-widest text-white/30 mb-3">Alérgenos</h4>
                    {selectedCocktail.alergenos.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCocktail.alergenos.map((alergeno, i) => (
                          <span key={i} className="px-3 py-1 rounded-full border border-white/10 text-sm text-white/60 font-light">
                            {alergeno}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-destructive">{AVISO_SIN_ALERGENOS}</p>
                    )}
                    {selectedCocktail.alergenosNota && (
                      <p className="mt-2 text-xs italic text-destructive/90">{selectedCocktail.alergenosNota}</p>
                    )}
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

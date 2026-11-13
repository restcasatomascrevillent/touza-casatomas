import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Wine, Beer, Martini, GlassWater, Sparkles, X, Info } from "lucide-react";
import { motion } from "framer-motion";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { BARRA_BAJO_CABECERA } from "@/lib/cabecera";
import { irA } from "@/lib/scroll";
import { useCocteles, transformCoctelesToUI, type CoctelUI } from "@/hooks/useCocteles";
import { useEspumosos, esChampagne, PREFIJO_ESPUMOSOS, transformVinosToUI, type Vino, type VinoUI } from "@/hooks/useVinos";
import { useBebidas, transformBebidasToUI, type BebidaUI } from "@/hooks/useBebidas";
import { usePlatosTouza, transformPlatosToUI, useMostrarFotosPlatosTouza } from "@/hooks/usePlatos";
import { AVISO_ALERGENOS_CARTA, AVISO_SIN_ALERGENOS } from "@/lib/alergenos";
import { Skeleton } from "@/components/ui/skeleton";
import Seo from "@/components/Seo";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { CocktailHoverOutlineSVG } from "@/components/ui/svg/CocktailHoverOutlineSVG";
import { IMAGENES } from "@/assets/imagenes";
import { canonical } from "@/lib/site";
import { menuSchema } from "@/lib/negocio";
import { CARTA_SSG, platosParaJsonLd } from "@/lib/carta-ssg";

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

// Touza solo tiene espumosos (13/11/2026: «los vinos en Touza van fuera»):
// Champagne y Cavas (cava, crémant, moscato…) salen de las categorías
// «VINOS ESPUMOSOS — …» de Vinos. Tintos, blancos y rosados no tienen
// pestaña aunque alguno siga marcado touza=true en el panel.
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

/** Minúsculas y sin diacríticos, para comparar búsquedas. */
const normalizarBusqueda = (texto: string) =>
  texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const SinResultados = ({ termino, onLimpiar }: { termino: string; onLimpiar: () => void }) => (
  <div className="col-span-full py-16 text-center" role="status">
    <p className="font-serif text-2xl text-white mb-2">
      {termino ? <>Nada con «{termino}» en esta sección</> : "No hay nada en esta sección ahora mismo"}
    </p>
    {termino ? (
      <>
        <p className="text-white/60 font-light mb-6">Prueba con otra palabra o mira en otra pestaña de la carta.</p>
        <button
          type="button"
          onClick={onLimpiar}
          className="px-6 py-2.5 rounded-full border border-white/20 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Borrar búsqueda
        </button>
      </>
    ) : (
      <p className="text-white/60 font-light">Pregúntanos en barra por las opciones del día.</p>
    )}
  </div>
);

const DrinksSkeleton = () => (
  <div className="w-full flex justify-center py-20 col-span-full">
    <LiquidLoaderSVG />
  </div>
);

const Carta = () => {
  const [activeMainCategory, setActiveMainCategory] = useState("cocteles");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCocktail, setSelectedCocktail] = useState<CoctelUI | null>(null);

  // El filtro secundario (pills bajo el buscador) cambia de significado según
  // la pestaña activa: categoría de cóctel, o denominación de vino. Si no se
  // reinicia al cambiar de pestaña, un filtro elegido en "Tintos" (p.ej.
  // "Rioja") se arrastraría a "Blancos" y no encajaría con ninguna
  // denominación de esa pestaña, dejando la lista vacía.
  useEffect(() => { setSelectedCategory("all"); }, [activeMainCategory]);

  // Al cambiar de pestaña en el móvil: (1) la pestaña elegida se centra en la
  // fila (con 9 pestañas, las de los extremos quedaban medio fuera), y (2) si
  // se venía de mitad de una lista larga (p. ej. el vino 40 de Tintos), la
  // lista nueva empieza arriba, justo bajo la barra pegajosa, en vez de abrir
  // a media altura de otra lista.
  const filaPestanasRef = useRef<HTMLDivElement>(null);
  const barraPestanasRef = useRef<HTMLDivElement>(null);
  const inicioListaRef = useRef<HTMLDivElement>(null);
  const cambiarPestana = (id: string) => {
    setActiveMainCategory(id);
    const barra = barraPestanasRef.current;
    const inicio = inicioListaRef.current;
    if (barra && inicio) {
      const altoBarra = barra.getBoundingClientRect().bottom;
      const top = inicio.getBoundingClientRect().top;
      if (top < altoBarra) irA(window.scrollY + top - altoBarra);
    }
  };
  useEffect(() => {
    const fila = filaPestanasRef.current;
    const activa = fila?.querySelector<HTMLElement>('[data-state="active"]');
    if (!fila || !activa) return;
    const destino = Math.max(0, activa.offsetLeft - (fila.clientWidth - activa.offsetWidth) / 2);
    // jsdom (tests) no implementa `Element.scrollTo`.
    if (typeof fila.scrollTo !== "function") {
      fila.scrollLeft = destino;
      return;
    }
    fila.scrollTo({
      left: destino,
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [activeMainCategory]);

  const { data: coctelesData, isLoading: loadingCocteles } = useCocteles();
  const cocktailsData = useMemo(() => transformCoctelesToUI(coctelesData), [coctelesData]);
  const { data: espumososRaw, isLoading: loadingEspumosos } = useEspumosos();
  const champagneData = useMemo(
    () => transformVinosToUI(espumososRaw?.filter((vino) => esChampagne(vino.categoria))),
    [espumososRaw]
  );
  const cavasData = useMemo(
    () => transformVinosToUI(espumososRaw?.filter((vino) => !esChampagne(vino.categoria))),
    [espumososRaw]
  );
  const loadingChampagnes = loadingEspumosos;
  const loadingCavas = loadingEspumosos;
  const tabsCarta = useMemo(() => [...mainCategoriesAntesDeVinos, ...mainCategoriesDespuesDeVinos], []);
  const { data: cervezasRaw, isLoading: loadingCervezas } = useBebidas('Cervezas');
  const { data: copasRaw, isLoading: loadingCopas } = useBebidas('Copas');
  const { data: whiskiesRaw, isLoading: loadingWhiskies } = useBebidas('Whiskies');
  const cervezasData = useMemo(() => transformBebidasToUI(cervezasRaw), [cervezasRaw]);
  const copasData = useMemo(() => transformBebidasToUI(copasRaw), [copasRaw]);
  const whiskiesData = useMemo(() => transformBebidasToUI(whiskiesRaw), [whiskiesRaw]);

  const { data: platosRaw, isLoading: loadingPlatos } = usePlatosTouza();
  // Interruptor «Fotos de platos en Touza» del panel. Falla abierto: solo un
  // `false` explícito oculta las fotos (sin foto ni placeholder).
  const mostrarFotosPlatos = useMostrarFotosPlatosTouza() !== false;
  const tapasData = useMemo(
    () => transformPlatosToUI(platosRaw, { mostrarFotos: mostrarFotosPlatos }),
    [platosRaw, mostrarFotosPlatos]
  );

  // JSON-LD `Menu` con TODA la carta, no solo la pestaña activa.
  // En pantalla champagnes, cavas, cervezas, copas y whiskies viven detrás de
  // una pestaña, así que no están en el HTML inicial; aquí sí llegan, con
  // nombre y precio, legibles por buscadores y por asistentes de IA.
  // Se construye desde la instantánea del build (constante) para que el HTML
  // prerenderizado y el de la hidratación sean idénticos.
  const schemaCarta = useMemo(() => {
    if (!CARTA_SSG) return undefined;
    const espumosos = Object.entries(CARTA_SSG.vinos)
      .filter(([categoria]) => categoria.startsWith(PREFIJO_ESPUMOSOS))
      .flatMap(([, vinos]) => vinos as Vino[]);
    return menuSchema([
      { nombre: "Cócteles", items: CARTA_SSG.cocteles },
      { nombre: "Champagnes", items: espumosos.filter((vino) => esChampagne(vino.categoria)) },
      { nombre: "Cavas y otros espumosos", items: espumosos.filter((vino) => !esChampagne(vino.categoria)) },
      { nombre: "Cervezas", items: CARTA_SSG.bebidas["Cervezas"] ?? [] },
      { nombre: "Copas de vino", items: CARTA_SSG.bebidas["Copas"] ?? [] },
      { nombre: "Whiskies", items: CARTA_SSG.bebidas["Whiskies"] ?? [] },
      // Sin fotos si el panel las apagó al construir (ver `platosParaJsonLd`).
      { nombre: "Tapas", items: platosParaJsonLd(CARTA_SSG.platos) },
    ]);
  }, []);

  // Búsqueda sin distinguir mayúsculas ni tildes: "cafe" encuentra "Café",
  // "rioja" encuentra "RIOJA". Antes una tilde de menos dejaba la lista vacía.
  const busqueda = normalizarBusqueda(searchTerm.trim());

  const filteredCocktails = cocktailsData.filter((cocktail) => {
    const matchesCategory = selectedCategory === "all" || cocktail.category === selectedCategory;
    const matchesSearch = !busqueda ||
      normalizarBusqueda(cocktail.name).includes(busqueda) ||
      normalizarBusqueda(cocktail.description).includes(busqueda);
    return matchesCategory && matchesSearch;
  });

  const filterBySearch = <T extends { name: string }>(items: T[]) => {
    if (!busqueda) return items;
    return items.filter(item => normalizarBusqueda(item.name).includes(busqueda));
  };

  // Pills bajo el buscador: categorías de cóctel en "Cócteles", denominación
  // de origen en una pestaña de vino con más de una denominación, nada en el
  // resto (igual que hoy en Champagne, Cavas, Cervezas...).
  const subFilterOptions = useMemo(() => {
    if (activeMainCategory === "cocteles") return cocktailCategories;
    return [];
  }, [activeMainCategory]);

  // Datos de la pestaña "genérica" activa (todo lo que no es cócteles):
  // champagne/cavas/cervezas/copas/whiskies.
  const activeDrinkData = useMemo<(VinoUI | BebidaUI)[]>(() => {
    switch (activeMainCategory) {
      case "champagne": return champagneData;
      case "cavas": return cavasData;
      case "cervezas": return cervezasData;
      case "copas": return copasData;
      case "whiskies": return whiskiesData;
      default: return [];
    }
  }, [activeMainCategory, champagneData, cavasData, cervezasData, copasData, whiskiesData]);

  // Lista completa (sin buscador ni filtros) de una pestaña que no es la
  // activa: se pinta oculta para que su sección esté en el HTML.
  const bebidasDePestana = (id: string): (VinoUI | BebidaUI)[] => {
    switch (id) {
      case "champagne": return champagneData;
      case "cavas": return cavasData;
      case "cervezas": return cervezasData;
      case "copas": return copasData;
      case "whiskies": return whiskiesData;
      default: return [];
    }
  };
  const cargandoPestana = (id: string): boolean => {
    switch (id) {
      case "champagne": return loadingChampagnes;
      case "cavas": return loadingCavas;
      case "cervezas": return loadingCervezas;
      case "copas": return loadingCopas;
      case "whiskies": return loadingWhiskies;
      default: return false;
    }
  };

  return (
    <Layout>
      <Seo
        title="Carta de cócteles, vinos y champagne · Touza Crevillente"
        description="Carta de Touza, bar de copas en Crevillente: cócteles de autor y clásicos, cócteles sin alcohol, champagne, vinos, cervezas y whiskies, con precios."
        canonical={canonical("/carta")}
        keywords={['carta touza', 'cócteles crevillente', 'coctelería crevillente', 'champagne', 'precios']}
        schema={schemaCarta}
      />

      {/* Hero */}
      {/* En móvil el héroe baja de 60vh a 46vh: esta es la página de la carta,
          y con 60vh la primera bebida caía a 725 px del inicio (casi una
          pantalla entera por debajo del pliegue). En escritorio no cambia. */}
      <section className="escena-scroll relative overflow-hidden h-[46vh] md:h-[80vh]">
        <motion.div
          // Sin fundido de opacidad: la foto es el LCP y con opacity:0 inicial
          // el HTML del SSG la traía invisible hasta hidratar.
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: appleEase }}
          className="escena-foto absolute inset-0"
        >
          <OptimizedImage
            imagen={IMAGENES.sirviendo}
            alt="El bartender de Touza sirviendo un cóctel en copa coupé"
            className="w-full h-full object-cover"
            sizes="100vw"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />
        </motion.div>

        <div className="escena-texto absolute inset-0 z-10 flex items-end pb-12 md:pb-20 px-6">
          <div className="max-w-6xl mx-auto w-full text-center text-shadow">
            <span
              style={{ animationDelay: "0.15s" }}
              className="entrada-hero text-primary text-xs tracking-[0.3em] uppercase mb-4 block font-medium"
            >
              Selección Exclusiva
            </span>
            <h1
              style={{ animationDelay: "0.25s" }}
              className="entrada-hero font-serif font-bold text-white leading-[0.9] text-4xl mb-4 md:text-7xl md:mb-6 lg:text-8xl"
            >
              Nuestra Carta
              <span className="sr-only"> de cócteles y copas</span>
            </h1>
            <p
              style={{ animationDelay: "0.4s" }}
              className="entrada-hero text-white/70 text-base md:text-lg font-light max-w-xl mx-auto"
            >
              Una colección curada de sabores. Desde clásicos atemporales hasta innovaciones audaces.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div ref={barraPestanasRef} className={cn(BARRA_BAJO_CABECERA, "bg-black/85 backdrop-blur-2xl border-y border-white/5 py-2.5")}>
        <div ref={filaPestanasRef} className="relative max-w-6xl mx-auto overflow-x-auto scrollbar-hide px-4">
          <div className="flex justify-start md:justify-center min-w-max">
            <Tabs value={activeMainCategory} onValueChange={cambiarPestana}>
              <TabsList className="bg-transparent p-0 gap-1">
                {tabsCarta.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className={cn(
                      "rounded-full px-5 min-h-11 text-[15px] md:text-sm font-light transition-all duration-300",
                      "data-[state=active]:bg-white data-[state=active]:text-black",
                      "data-[state=inactive]:text-white/60 data-[state=inactive]:hover:text-white",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
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
      <div ref={inicioListaRef} className="max-w-6xl mx-auto py-5 px-5 md:px-6 md:py-8">
        {/* items-stretch en móvil: con items-center la fila de filtros, más
            ancha que la pantalla, desbordaba por los DOS lados y "Todos" quedaba
            cortado a la izquierda sin poder llegar a él con el scroll. */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-4 md:mb-8">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" aria-hidden="true" />
            <Input
              type="search"
              aria-label="Buscar en la carta"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-transparent focus:border-white/20 rounded-full h-12 text-white placeholder:text-white/40 pl-11 pr-11 [&::-webkit-search-cancel-button]:hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Borrar búsqueda"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {subFilterOptions.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0" role="group" aria-label="Filtrar">
              {subFilterOptions.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  aria-pressed={selectedCategory === cat.id}
                  className={cn(
                    "px-5 min-h-11 rounded-full text-[15px] md:text-sm font-light whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    selectedCategory === cat.id
                      ? "bg-white text-black"
                      : "text-white/70 ring-1 ring-inset ring-white/10 hover:text-white hover:ring-white/25"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Aviso de alérgenos de toda la carta. Sustituye al bloque que antes
            se repetía bajo CADA tarjeta de cóctel y de tapa. Vive aquí, fuera
            del condicional de pestaña, para que se vea en todas (cócteles,
            vinos, cervezas...). Ver AVISO_ALERGENOS_CARTA en lib/alergenos.ts. */}
        <p className="mb-6 flex items-start gap-2 text-[13px] md:text-xs font-light leading-relaxed text-white/65 md:mb-8">
          <Info className="mt-[2px] h-3.5 w-3.5 flex-shrink-0 text-white/50" aria-hidden="true" />
          <span>{AVISO_ALERGENOS_CARTA}</span>
        </p>

        {/* Todas las secciones de la carta van en el HTML (también el
            prerenderizado), cada una con su <h2>, aunque en pantalla se vea
            solo la pestaña activa: las demás se ocultan con `hidden`, no se
            desmontan. Así Google y los asistentes de IA leen la carta entera.
            Buscador y filtros solo afectan a la sección activa. */}
        <div className="min-h-[50vh]">
          {tabsCarta.map((pestana) => {
            const activa = pestana.id === activeMainCategory;
            const idTitulo = `carta-${pestana.id}-titulo`;

            if (pestana.id === "cocteles") {
              const coctelesPanel = activa ? filteredCocktails : cocktailsData;
              return (
                <section key={pestana.id} hidden={!activa} aria-labelledby={idTitulo}>
                  <h2 id={idTitulo} className="sr-only">{pestana.name}</h2>
                  {loadingCocteles ? (activa ? <DrinksSkeleton /> : null) : coctelesPanel.length === 0 ? (
                    activa ? <SinResultados termino={searchTerm.trim()} onLimpiar={() => setSearchTerm("")} /> : null
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-5 md:gap-y-8">
                    {coctelesPanel.map((cocktail, index) => (
                      // <Reveal> y no `whileInView`: el HTML del SSG ya no trae las
                      // tarjetas con opacity:0. El retraso escalona por columna
                      // (index % 4), no por posición: con `index * 0.06` la tarjeta
                      // 12 esperaba 0,7 s después de entrar en pantalla.
                      <Reveal
                        key={cocktail.id}
                        y={25}
                        delay={(index % 4) * 0.06}
                        className="group relative"
                      >
                        {/* Botón que cubre toda la tarjeta: antes el clic vivía en un
                            <div> y con teclado no había forma de abrir el detalle. */}
                        <button
                          type="button"
                          onClick={() => setSelectedCocktail(cocktail)}
                          aria-label={`Ver detalle de ${cocktail.name}, ${cocktail.price}`}
                          className="absolute inset-0 z-40 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                        />
                        <div className="marco-zoom aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 relative mb-4">
                          <OptimizedImage
                            src={cocktail.image}
                            alt={cocktail.name}
                            className="foto-zoom w-full h-full object-cover group-hover:scale-105 group-hover:opacity-40 transition-all duration-700"
                          />
                          <CocktailHoverOutlineSVG />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent group-hover:from-black/90 transition-all duration-700" />
                          <span className="absolute bottom-3 right-3 bg-white text-black text-[13px] md:text-xs font-medium tabular-nums px-3 py-1 rounded-full z-30">
                            {cocktail.price}
                          </span>
                        </div>
                        <h3 className="font-serif text-base md:text-lg text-white group-hover:text-primary transition-colors leading-tight mb-1">{cocktail.name}</h3>
                        <p className="text-white/55 text-sm line-clamp-2 font-light">{cocktail.description}</p>
                        {/* Solo las etiquetas reales. El "no consta" ya no se pinta
                            aquí (eran 13 bloques idénticos en la rejilla): vive una
                            vez en la cabecera de la carta y, por cóctel, en su
                            diálogo de detalle. */}
                        {cocktail.alergenos.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {cocktail.alergenos.map((alergeno) => (
                              <span
                                key={alergeno}
                                className="px-2 py-0.5 rounded-full border border-white/10 text-[11px] text-white/60 font-light uppercase tracking-wide"
                              >
                                {alergeno}
                              </span>
                            ))}
                          </div>
                        )}
                      </Reveal>
                    ))}
                    </div>
                  )}
                </section>
              );
            }

            const filasPanel = activa ? filterBySearch(activeDrinkData) : bebidasDePestana(pestana.id);
            const cargando = cargandoPestana(pestana.id);
            return (
              <section key={pestana.id} hidden={!activa} aria-labelledby={idTitulo} className="max-w-4xl mx-auto">
                <h2 id={idTitulo} className="sr-only">{pestana.name}</h2>
                {activa && (cargando ? <DrinksSkeleton /> : filasPanel.length === 0 ? (
                  <SinResultados termino={searchTerm.trim()} onLimpiar={() => setSearchTerm("")} />
                ) : null)}
                {/* Sin retraso por posición: las filas entran de una en una al
                    hacer scroll, y con `index * 0.04` el vino 60 de una lista
                    esperaba 2,4 s después de llegar a la pantalla. */}
                    {filasPanel.map((drink) => (
                      <Reveal
                        key={drink.id}
                        y={15}
                        className="flex justify-between items-center gap-4 py-3.5 md:py-5 border-b border-white/5 group"
                      >
                        {/* Foto de la botella al lado, estrecha (3:5) como en la
                            carta de vinos de Casa Tomás. Sin foto, fila de texto. */}
                        {drink.image && (
                          <div className="shrink-0 w-16 md:w-20 aspect-[3/5] overflow-hidden rounded-lg bg-white/5">
                            <img
                              src={drink.image}
                              alt={drink.name}
                              width={900}
                              height={1500}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg text-white group-hover:text-primary transition-colors duration-300">{drink.name}</h3>
                          {(drink as GenericDrink).type && (
                            <span className="text-xs text-white/50 uppercase tracking-wider font-light">{(drink as GenericDrink).type}</span>
                          )}
                        </div>
                        <span className="text-primary font-medium text-lg whitespace-nowrap tabular-nums">{drink.price}</span>
                      </Reveal>
                    ))}
              </section>
            );
          })}
        </div>
      </div>

      {/* Tapas Section */}
      {(loadingPlatos || tapasData.length > 0) && (
        <section className="py-12 md:py-20 bg-white/[0.02] mt-8 md:mt-16">
          <div className="max-w-6xl mx-auto px-6 text-center mb-8 md:mb-12">
            <Reveal as="h2" y={30} className="font-serif text-3xl md:text-4xl text-white mb-3 md:mb-4">
              Tapea con tu Cóctel
            </Reveal>
            <Reveal as="p" y={0} delay={0.1} className="text-white/60 font-light">
              El maridaje perfecto para elevar la experiencia.
            </Reveal>
          </div>
          {loadingPlatos ? (
            <div className="w-full flex justify-center py-10">
              <LiquidLoaderSVG />
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-6 flex overflow-x-auto gap-4 snap-x scrollbar-hide md:grid md:grid-cols-3 md:gap-8 md:overflow-visible">
              {tapasData.map((tapa, index) => (
                <Reveal
                  key={tapa.id}
                  y={25}
                  delay={(index % 3) * 0.1}
                  className="group min-w-[280px] snap-center md:min-w-0"
                >
                  {tapa.image && (
                    <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                      <OptimizedImage
                        src={tapa.image}
                        alt={tapa.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-lg text-white mb-1">{tapa.name}</h3>
                      <p className="text-white/55 text-sm font-light">{tapa.description}</p>
                      {tapa.alergenos.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tapa.alergenos.map((alergeno) => (
                            <span
                              key={alergeno}
                              className="px-2 py-0.5 rounded-full border border-white/10 text-[11px] text-white/60 font-light uppercase tracking-wide"
                            >
                              {alergeno}
                            </span>
                          ))}
                        </div>
                      )}
                      {tapa.alergenosNota && (
                        <p className="mt-1 text-xs italic text-red-300">{tapa.alergenosNota}</p>
                      )}
                    </div>
                    <span className="text-primary font-medium ml-4 whitespace-nowrap tabular-nums">{tapa.price}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedCocktail} onOpenChange={() => setSelectedCocktail(null)}>
        {/* En móvil, a pantalla completa y con scroll en el propio diálogo: antes
            el texto largo (ingredientes + alérgenos) se salía por abajo sin
            poder llegar a él. */}
        <DialogContent className="p-0 gap-0 bg-black border-white/5 text-white w-full max-w-[100vw] h-[100dvh] overflow-y-auto rounded-none md:h-auto md:max-h-[90vh] md:max-w-4xl md:overflow-hidden md:rounded-2xl">
          <div className="grid grid-rows-[40vh_auto] md:grid-rows-none md:grid-cols-2">
            <div className="relative bg-white/5 md:min-h-[480px]">
              {selectedCocktail && (
                <OptimizedImage
                  src={selectedCocktail.image}
                  alt={selectedCocktail.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="px-6 pt-7 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] md:p-12 flex flex-col justify-center md:max-h-[90vh] md:overflow-y-auto">
              {selectedCocktail && (
                <>
                  <span className="text-primary text-xs uppercase tracking-widest mb-3">
                    {/* El nombre legible ("Clásicos"), no el id interno ("clasicos"). */}
                    {cocktailCategories.find((c) => c.id === selectedCocktail.category)?.name ?? selectedCocktail.category}
                  </span>
                  <DialogTitle className="font-serif text-3xl md:text-5xl mb-6 leading-[0.9] text-white">
                    {selectedCocktail.name}
                  </DialogTitle>
                  <DialogDescription className="text-lg text-white/70 font-light leading-relaxed mb-8">
                    {selectedCocktail.description}
                  </DialogDescription>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-white/55 mb-3">Notas de cata</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCocktail.ingredients.map((ing, i) => (
                        <span key={i} className="px-3 py-1 rounded-full border border-white/10 text-sm text-white/60 font-light">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-xs uppercase tracking-widest text-white/55 mb-3">Alérgenos</h4>
                    {selectedCocktail.alergenos.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCocktail.alergenos.map((alergeno, i) => (
                          <span key={i} className="px-3 py-1 rounded-full border border-white/10 text-sm text-white/60 font-light">
                            {alergeno}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-red-300">{AVISO_SIN_ALERGENOS}</p>
                    )}
                    {selectedCocktail.alergenosNota && (
                      <p className="mt-2 text-xs italic text-red-300">{selectedCocktail.alergenosNota}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/5">
                    <span className="text-xs text-white/55">Base: <span className="text-white/80 capitalize">{selectedCocktail.base}</span></span>
                    <span className="text-3xl font-serif text-primary">{selectedCocktail.price}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Carta;

import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, X, Info } from "lucide-react";
import { motion } from "framer-motion";
import Reveal from "@/components/Reveal";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { BARRA_BAJO_CABECERA } from "@/lib/cabecera";
import { irA } from "@/lib/scroll";
import { precargarImagenes } from "@/lib/precarga";
import { FOTO_BOTELLA, FOTO_DETALLE, fotoResponsive, volverAFotoOriginal } from "@/lib/foto";
import { useCocteles, transformCoctelesToUI, type CoctelUI } from "@/hooks/useCocteles";
import { useEspumosos, esChampagne, PREFIJO_ESPUMOSOS, transformVinosToUI, type Vino, type VinoUI } from "@/hooks/useVinos";
import { useBebidas, transformBebidasToUI, type BebidaUI } from "@/hooks/useBebidas";
import { usePlatosTouza, transformPlatosToUI, useMostrarFotosPlatosTouza } from "@/hooks/usePlatos";
import { AVISO_ALERGENOS_CARTA, AVISO_SIN_ALERGENOS } from "@/lib/alergenos";
import Seo from "@/components/Seo";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { canonical } from "@/lib/site";
import { NEGOCIO, menuSchema, sinDuplicados } from "@/lib/negocio";
import { agruparChampagne, resumenCocteles, slugCarta } from "@/lib/carta";
import { CARTA_SSG, platosParaJsonLd } from "@/lib/carta-ssg";
import FilaBotella from "@/components/carta/FilaBotella";
import TarjetaCoctel from "@/components/carta/TarjetaCoctel";
import HeroLlenado from "@/components/carta/HeroLlenado";
import { LiquidLoaderSVG } from "@/components/ui/svg/LiquidLoaderSVG";

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
// En «Por copas» solo champagne y cava: las copas de tinto, blanco, rosado o
// dulce no salen aunque sigan marcadas para Touza en el panel.
const esCopaEspumosa = (copa: { tipo?: string | null }) => /^(champagne|cava)$/i.test(copa.tipo ?? "");

// Una línea bajo el título de cada pestaña de bebidas: cómo se sirve.
const INTRO_PESTANA: Record<string, string> = {
  champagne: "Por botella.",
  cavas: "Cava y otros espumosos, por botella.",
  copas: "Champagne y cava, por copa.",
  whiskies: "Por copa: solo, con hielo o con agua.",
};

const tabsCarta = [
  { id: "cocteles", name: "Cócteles" },
  { id: "champagne", name: "Champagne" },
  { id: "cavas", name: "Cavas" },
  { id: "cervezas", name: "Cervezas" },
  { id: "copas", name: "Por copas" },
  { id: "whiskies", name: "Whiskies" },
];

const cocktailCategories = [
  { id: "all", name: "Todos" },
  { id: "autor", name: "De Autor" },
  { id: "clasicos", name: "Clásicos" },
  { id: "sin-alcohol", name: "Sin Alcohol" },
];

/** Alto de cabecera + barra de pestañas: lo que tapa arriba al saltar a un ancla. */
const MARGEN_ANCLA = 140;

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
        <p className="text-white/75 mb-6">Prueba con otra palabra o mira en otra pestaña de la carta.</p>
        <button
          type="button"
          onClick={onLimpiar}
          className="px-6 py-2.5 rounded-full border border-white/20 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Borrar búsqueda
        </button>
      </>
    ) : (
      <p className="text-white/75">Pregúntanos en barra por las opciones del día.</p>
    )}
  </div>
);

const DrinksSkeleton = () => (
  <div className="w-full flex justify-center py-20 col-span-full">
    <LiquidLoaderSVG />
  </div>
);

const EtiquetasAlergenos = ({ alergenos }: { alergenos: string[] }) =>
  alergenos.length > 0 ? (
    <div className="relative z-0 mt-2 flex flex-wrap gap-1">
      {alergenos.map((alergeno) => (
        <span key={alergeno} className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-white/70">
          {alergeno}
        </span>
      ))}
    </div>
  ) : null;

const Carta = () => {
  const [activeMainCategory, setActiveMainCategory] = useState("cocteles");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCocktail, setSelectedCocktail] = useState<CoctelUI | null>(null);
  // Cócteles cuya foto no ha cargado: pasan de la rejilla a la lista de texto.
  const [fotosRotas, setFotosRotas] = useState<ReadonlySet<string>>(() => new Set());
  const marcarFotoRota = (id: string) =>
    setFotosRotas((previas) => (previas.has(id) ? previas : new Set(previas).add(id)));

  // El filtro secundario (pills bajo el buscador) solo existe en Cócteles: se
  // reinicia al cambiar de pestaña para no arrastrar un filtro que no aplica.
  useEffect(() => { setSelectedCategory("all"); }, [activeMainCategory]);

  // Al cambiar de pestaña en el móvil: (1) la pestaña elegida se centra en la
  // fila, y (2) si se venía de mitad de una lista larga, la lista nueva
  // empieza arriba, justo bajo la barra pegajosa.
  const filaPestanasRef = useRef<HTMLDivElement>(null);
  const barraPestanasRef = useRef<HTMLDivElement>(null);
  const inicioListaRef = useRef<HTMLDivElement>(null);
  const cambiarPestana = (id: string) => {
    precargarPestana(id);
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

  // Datos. `sinDuplicados` es la misma limpieza que ya hacía el JSON-LD:
  // «Heineken» dos veces o «Cruz Campo» y «Cruzcampo Gran Reserva» salían
  // repetidos en pantalla aunque no en los datos estructurados.
  const { data: coctelesData, isLoading: loadingCocteles } = useCocteles();
  const coctelesUnicos = useMemo(() => sinDuplicados(coctelesData ?? []), [coctelesData]);
  const cocktailsData = useMemo(() => transformCoctelesToUI(coctelesUnicos), [coctelesUnicos]);
  const resumen = useMemo(() => resumenCocteles(coctelesUnicos), [coctelesUnicos]);

  const { data: espumososRaw, isLoading: loadingEspumosos } = useEspumosos();
  const espumososUnicos = useMemo(() => sinDuplicados(espumososRaw ?? []), [espumososRaw]);
  const champagneData = useMemo(
    () => transformVinosToUI(espumososUnicos.filter((vino) => esChampagne(vino.categoria))),
    [espumososUnicos]
  );
  const cavasData = useMemo(
    () => transformVinosToUI(espumososUnicos.filter((vino) => !esChampagne(vino.categoria))),
    [espumososUnicos]
  );
  const { data: cervezasRaw, isLoading: loadingCervezas } = useBebidas('Cervezas');
  const { data: copasRaw, isLoading: loadingCopas } = useBebidas('Copas');
  const { data: whiskiesRaw, isLoading: loadingWhiskies } = useBebidas('Whiskies');
  const cervezasData = useMemo(() => transformBebidasToUI(sinDuplicados(cervezasRaw ?? [])), [cervezasRaw]);
  const copasData = useMemo(() => transformBebidasToUI(sinDuplicados((copasRaw ?? []).filter(esCopaEspumosa))), [copasRaw]);
  const whiskiesData = useMemo(() => transformBebidasToUI(sinDuplicados(whiskiesRaw ?? [])), [whiskiesRaw]);

  const { data: platosRaw, isLoading: loadingPlatos } = usePlatosTouza();
  // Interruptor «Fotos de platos en Touza» del panel. Falla abierto: solo un
  // `false` explícito oculta las fotos (sin foto ni placeholder).
  const mostrarFotosPlatos = useMostrarFotosPlatosTouza() !== false;
  const tapasData = useMemo(
    () => transformPlatosToUI(platosRaw, { mostrarFotos: mostrarFotosPlatos }),
    [platosRaw, mostrarFotosPlatos]
  );

  // JSON-LD `Menu` con TODA la carta, no solo la pestaña activa. Se construye
  // desde la instantánea del build (constante) para que el HTML prerenderizado
  // y el de la hidratación sean idénticos.
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
      { nombre: "Champagne y cava por copas", items: (CARTA_SSG.bebidas["Copas"] ?? []).filter(esCopaEspumosa) },
      { nombre: "Whiskies", items: CARTA_SSG.bebidas["Whiskies"] ?? [] },
      // Sin fotos si el panel las apagó al construir (ver `platosParaJsonLd`).
      { nombre: "Tapas", items: platosParaJsonLd(CARTA_SSG.platos) },
    ]);
  }, []);

  // Enlaces a un cóctel desde otras páginas (`/carta#moscow-mule`): abre la
  // pestaña de cócteles sin filtros y lleva la tarjeta justo bajo la barra de
  // pestañas. Espera a que acabe la transición de página (0,3 s), que antes
  // sube la página al principio.
  const { hash } = useLocation();
  const hayCocteles = cocktailsData.length > 0;
  useEffect(() => {
    const slug = decodeURIComponent(hash.replace(/^#/, ""));
    if (!slug || !hayCocteles) return;
    if (!cocktailsData.some((c) => slugCarta(c.name) === slug)) return;
    setActiveMainCategory("cocteles");
    setSelectedCategory("all");
    setSearchTerm("");
    const temporizador = window.setTimeout(() => {
      const destino = document.getElementById(slug);
      if (destino) irA(Math.max(0, destino.getBoundingClientRect().top + window.scrollY - MARGEN_ANCLA));
    }, 350);
    return () => window.clearTimeout(temporizador);
    // Solo cuando cambia el ancla o llegan los cócteles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, hayCocteles]);

  // Búsqueda sin distinguir mayúsculas ni tildes: "cafe" encuentra "Café".
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

  const subFilterOptions = activeMainCategory === "cocteles" ? cocktailCategories : [];

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
  // Fotos de una pestaña en el orden en que se ven (el champagne, agrupado),
  // con el mismo srcset que la fila: se precarga la miniatura, no la original.
  const fotosDePestana = (id: string) => {
    const filas = id === "champagne" ? agruparChampagne(champagneData).flatMap((g) => g.items) : bebidasDePestana(id);
    return filas
      .map((fila) => fila.image)
      .filter((url): url is string => !!url)
      .map((url) => fotoResponsive(url, FOTO_BOTELLA.anchos, FOTO_BOTELLA.sizes));
  };
  // Al acercarse a una pestaña (ratón encima, foco o primer toque) se piden
  // ya sus fotos, delante de todo lo demás: así al abrirla están o casi.
  // Nada más: las pestañas ocultas no se precargan «por si acaso» al entrar
  // (auditoría de carga v0.10: competían con lo que sí se ve en el móvil).
  const precargarPestana = (id: string) => precargarImagenes(fotosDePestana(id), { delante: true });

  const cargandoPestana = (id: string): boolean => {
    switch (id) {
      case "champagne":
      case "cavas": return loadingEspumosos;
      case "cervezas": return loadingCervezas;
      case "copas": return loadingCopas;
      case "whiskies": return loadingWhiskies;
      default: return false;
    }
  };

  const tieneFoto = (coctel: CoctelUI) => !!coctel.image && !fotosRotas.has(coctel.id);
  const fotoDetalle = selectedCocktail && tieneFoto(selectedCocktail);

  return (
    <Layout>
      <Seo
        title="Carta de cócteles, champagne y whisky · Touza Crevillente"
        description="Carta de Touza, bar de copas en Crevillente: cócteles de autor y clásicos, cócteles sin alcohol, champagne, cava, cervezas y whiskies, con precios."
        canonical={canonical("/carta")}
        keywords={['carta touza', 'cócteles crevillente', 'coctelería crevillente', 'champagne', 'precios']}
        schema={schemaCarta}
      />

      {/* Hero: la copa se llena con el scroll (ver HeroLlenado). El texto va
          en la franja oscura de abajo, nunca encima del líquido. */}
      <HeroLlenado alt="El bartender de Touza llenando una copa coupé con un cóctel rojo">
        <div className="max-w-6xl mx-auto w-full text-center">
          <h1
            style={{ animationDelay: "0.15s" }}
            className="entrada-hero font-serif font-bold text-white leading-[0.9] text-5xl md:text-7xl lg:text-8xl"
          >
            Nuestra carta
            <span className="sr-only"> de cócteles y copas</span>
          </h1>
          <p
            style={{ animationDelay: "0.3s" }}
            className="entrada-hero mx-auto mt-4 max-w-xl text-base text-white/80 [font-variant-numeric:lining-nums] md:mt-6 md:text-lg"
          >
            {resumen
              ? `${resumen}. También champagne, cava, whisky y cerveza.`
              : "Cócteles de autor y clásicos, champagne, cava, whisky y cerveza."}
          </p>
        </div>
      </HeroLlenado>

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
                    onPointerEnter={() => precargarPestana(cat.id)}
                    onFocus={() => precargarPestana(cat.id)}
                    onTouchStart={() => precargarPestana(cat.id)}
                    className={cn(
                      "relative rounded-none px-4 md:px-5 min-h-11 text-[15px] md:text-sm tracking-wide transition-colors duration-300",
                      "data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#D8B47E]",
                      "data-[state=inactive]:text-white/70 data-[state=inactive]:hover:text-white",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                    )}
                  >
                    {cat.name}
                    {/* Subrayado dorado que se desliza a la pestaña elegida. */}
                    {cat.id === activeMainCategory && (
                      <motion.span
                        layoutId="subrayado-pestana"
                        aria-hidden="true"
                        className="absolute inset-x-4 md:inset-x-5 bottom-1.5 h-px bg-[#D8B47E]"
                        transition={{ duration: 0.45, ease: appleEase }}
                      />
                    )}
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
            ancha que la pantalla, desbordaba por los DOS lados. */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6 md:mb-10">
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
                    "px-5 min-h-11 rounded-full text-[15px] md:text-sm whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    selectedCategory === cat.id
                      ? "bg-white text-black"
                      : "text-white/75 ring-1 ring-inset ring-white/15 hover:text-white hover:ring-white/30"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

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
              // Los que tienen foto propia, en tarjetas; los que no, al final
              // en filas de texto como las botellas (antes, una caja «TOUZA»).
              const conFoto = coctelesPanel.filter(tieneFoto);
              const sinFoto = coctelesPanel.filter((c) => !tieneFoto(c));
              return (
                <section key={pestana.id} hidden={!activa} aria-labelledby={idTitulo}>
                  <h2 id={idTitulo} className="sr-only">{pestana.name}</h2>
                  {loadingCocteles ? (activa ? <DrinksSkeleton /> : null) : coctelesPanel.length === 0 ? (
                    activa ? <SinResultados termino={searchTerm.trim()} onLimpiar={() => setSearchTerm("")} /> : null
                  ) : (
                    <>
                      {conFoto.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5 md:gap-y-12">
                          {conFoto.map((cocktail, indice) => (
                            <TarjetaCoctel
                              key={cocktail.id}
                              id={slugCarta(cocktail.name)}
                              coctel={cocktail}
                              // Las cuatro primeras (las que se ven al bajar del hero), sin `lazy`.
                              prioritaria={activa && indice < 4}
                              alAbrir={() => setSelectedCocktail(cocktail)}
                              alFallar={() => marcarFotoRota(cocktail.id)}
                            />
                          ))}
                        </div>
                      )}
                      {sinFoto.length > 0 && (
                        <div className={conFoto.length > 0 ? "mt-14 md:mt-20" : undefined}>
                          {conFoto.length > 0 && (
                            <h3 className="mb-2 font-serif text-3xl leading-none text-[#F3EEE4] md:mb-4 md:text-4xl">
                              Más cócteles
                            </h3>
                          )}
                          <ul className="grid grid-cols-1 md:grid-cols-2 md:gap-x-14">
                            {sinFoto.map((cocktail, indice) => (
                              <FilaBotella
                                key={cocktail.id}
                                id={slugCarta(cocktail.name)}
                                indice={indice}
                                nivel={conFoto.length > 0 ? 4 : 3}
                                nombre={cocktail.name}
                                precio={cocktail.price}
                                descripcion={cocktail.description}
                                alPulsar={() => setSelectedCocktail(cocktail)}
                                etiquetaBoton={`Ver detalle de ${cocktail.name}, ${cocktail.price}`}
                              >
                                <EtiquetasAlergenos alergenos={cocktail.alergenos} />
                              </FilaBotella>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </section>
              );
            }

            const filasPanel = activa ? filterBySearch(bebidasDePestana(pestana.id)) : bebidasDePestana(pestana.id);
            const cargando = cargandoPestana(pestana.id);
            // Champagne por tipo (brut, rosado, añada) cuando no se busca nada.
            const grupos =
              pestana.id === "champagne" && !(activa && busqueda)
                ? agruparChampagne(filasPanel)
                : [{ titulo: null, items: filasPanel }];
            // Mismo alto de fila: si alguna botella de la pestaña tiene foto,
            // las que no la tienen guardan su hueco.
            const conHueco = filasPanel.some((fila) => !!fila.image);
            return (
              <section key={pestana.id} hidden={!activa} aria-labelledby={idTitulo}>
                <header className="mb-2 md:mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <h2 id={idTitulo} className="font-serif text-4xl md:text-6xl leading-none text-[#F3EEE4]">{pestana.name}</h2>
                  {INTRO_PESTANA[pestana.id] && (
                    <p className="text-sm text-white/70 md:text-right">{INTRO_PESTANA[pestana.id]}</p>
                  )}
                </header>
                {activa && (cargando ? <DrinksSkeleton /> : filasPanel.length === 0 ? (
                  <SinResultados termino={searchTerm.trim()} onLimpiar={() => setSearchTerm("")} />
                ) : null)}
                {grupos.map((grupo, numeroGrupo) => (
                  <div key={grupo.titulo ?? "todo"} className={grupo.titulo ? "mt-10 first-of-type:mt-6 md:mt-14" : undefined}>
                    {grupo.titulo && (
                      <h3 className="mb-1 font-serif text-2xl text-[#D8B47E] md:mb-2 md:text-3xl">{grupo.titulo}</h3>
                    )}
                    {/* `grid-cols-1` (= minmax(0, 1fr)): sin columna fija, la
                        columna implícita crecía hasta la fila más ancha y en el
                        móvil el «€» de los champagnes se salía de la pantalla. */}
                    <ul className="grid grid-cols-1 md:grid-cols-2 md:gap-x-14">
                      {grupo.items.map((drink, indice) => (
                        <FilaBotella
                          key={drink.id}
                          indice={indice}
                          nivel={grupo.titulo ? 4 : 3}
                          conHueco={conHueco}
                          nombre={drink.name}
                          precio={drink.price}
                          descripcion={drink.description}
                          tipo={(drink as GenericDrink).type}
                          imagen={drink.image}
                          // Solo las primeras filas de la pestaña VISIBLE, sin `lazy`
                          // y con prioridad alta. Las ocultas, `lazy`: no se piden
                          // hasta abrir su pestaña.
                          prioritaria={activa && !cargando && numeroGrupo === 0 && indice < 4}
                        />
                      ))}
                    </ul>
                  </div>
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
            <Reveal as="p" y={0} delay={0.1} className="text-white/75">
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
                      <p className="text-white/75 text-sm">{tapa.description}</p>
                      <EtiquetasAlergenos alergenos={tapa.alergenos} />
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

      {/* Pie de la carta: el aviso de alérgenos una sola vez (antes salía
          arriba, en cada pestaña) y dónde está el bar. */}
      <div className="max-w-6xl mx-auto px-5 pt-12 pb-16 md:px-6 md:pt-20 md:pb-24">
        <div className="grid gap-8 border-t border-white/10 pt-8 md:grid-cols-12 md:gap-12 md:pt-10">
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-white/75 md:col-span-5 md:text-sm">
            <Info className="mt-[3px] h-3.5 w-3.5 flex-shrink-0 text-white/60" aria-hidden="true" />
            <span>{AVISO_ALERGENOS_CARTA}</span>
          </p>
          <div className="md:col-span-7 md:text-right">
            <p className="font-serif text-xl leading-snug text-[#F3EEE4] md:text-2xl">
              Touza está en la {NEGOCIO.calle}, Crevillent, junto a Casa Tomás. Sin reservas.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 md:justify-end">
              <Link
                to="/contacto"
                className="inline-flex min-h-11 items-center rounded-full border border-[#D8B47E]/60 px-6 text-sm font-medium text-[#F3EEE4] transition-colors hover:bg-[#D8B47E] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Cómo llegar
              </Link>
              <Link
                to="/despues-de-cenar"
                className="text-sm text-white/80 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-[#D8B47E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
              >
                Copas después de cenar en Casa Tomás
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle del cóctel. En móvil, a pantalla completa y con scroll en el
          propio diálogo. Sin foto propia, una sola columna. */}
      <Dialog open={!!selectedCocktail} onOpenChange={() => setSelectedCocktail(null)}>
        <DialogContent
          className={cn(
            "p-0 gap-0 bg-black border-white/5 text-white w-full max-w-[100vw] h-[100dvh] overflow-y-auto rounded-none md:h-auto md:max-h-[90vh] md:overflow-hidden md:rounded-2xl",
            fotoDetalle ? "md:max-w-4xl" : "md:max-w-xl"
          )}
        >
          <div className={cn("grid", fotoDetalle && "grid-rows-[40vh_auto] md:grid-rows-none md:grid-cols-2")}>
            {fotoDetalle && selectedCocktail && (
              <div className="fondo-foto relative md:min-h-[480px]">
                <img
                  {...fotoResponsive(selectedCocktail.image, FOTO_DETALLE.anchos, FOTO_DETALLE.sizes)}
                  alt={selectedCocktail.name}
                  width={900}
                  height={1200}
                  onError={(evento) => volverAFotoOriginal(evento.currentTarget, selectedCocktail.image)}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            )}
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
                  <DialogDescription className="text-lg text-white/80 leading-relaxed mb-8">
                    {selectedCocktail.description}
                  </DialogDescription>
                  {selectedCocktail.ingredients.length > 0 && (
                    <div>
                      <h4 className="text-sm text-white/70 mb-3">Notas de cata</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCocktail.ingredients.map((ing, i) => (
                          <span key={i} className="px-3 py-1 rounded-full border border-white/10 text-sm text-white/75">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-6">
                    <h4 className="text-sm text-white/70 mb-3">Alérgenos</h4>
                    {selectedCocktail.alergenos.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCocktail.alergenos.map((alergeno, i) => (
                          <span key={i} className="px-3 py-1 rounded-full border border-white/10 text-sm text-white/75">
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
                    <span className="text-sm text-white/70">Base: <span className="text-white/80 capitalize">{selectedCocktail.base}</span></span>
                    <span className="text-3xl font-serif text-primary [font-variant-numeric:lining-nums]">{selectedCocktail.price}</span>
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

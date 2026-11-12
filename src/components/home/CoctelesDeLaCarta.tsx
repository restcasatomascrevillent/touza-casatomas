import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { IMAGENES, type ImagenResponsive } from "@/assets/imagenes";

/**
 * Cinco cócteles de la carta con su foto real (sesión del 12/11/2026).
 *
 * Sustituye a la antigua página /galeria: las fotos van donde se habla de
 * ellas. Solo se nombran los cócteles que se reconocen sin dudas en la foto
 * (Moscow Mule por la taza de cobre, Aperol por el logo de la copa…).
 * Las notas son las descripciones de la carta (Supabase, 12/11/2026).
 * En el móvil es una tira con desplazamiento lateral; desde md, cinco
 * columnas con la del centro algo más baja para romper la fila.
 */
const cocteles: { nombre: string; nota: string; imagen: ImagenResponsive; alt: string }[] = [
  { nombre: "Moscow Mule", nota: "Refrescante y especiado, servido en su icónica taza de cobre.", imagen: IMAGENES.moscowMule, alt: "Moscow Mule en taza de cobre con rodaja de lima deshidratada" },
  { nombre: "Spicy Mango Margarita", nota: "El clásico mexicano reinventado con mango picante y borde de Tajín.", imagen: IMAGENES.mango, alt: "Margarita de mango en copa coupé con borde de sal y chile" },
  { nombre: "Piña Colada", nota: "El clásico tropical cremoso con coco natural y piña fresca.", imagen: IMAGENES.pinaBotellas, alt: "Piña Colada en vaso con forma de piña, con la estantería de botellas detrás" },
  { nombre: "Aperol Spritz", nota: "El aperitivo italiano por excelencia, refrescante y vibrante.", imagen: IMAGENES.aperol, alt: "Aperol Spritz en copa de vino sobre la barra de mármol" },
  { nombre: "Mojito", nota: "El inmortal cubano con hierbabuena fresca machacada a mano.", imagen: IMAGENES.mojitoBarra, alt: "Mojito con hierbabuena y lima en vaso alto" },
];

const CoctelesDeLaCarta = () => (
  <section aria-labelledby="de-la-carta-titulo" className="py-10 md:py-24">
    <div className="max-w-7xl mx-auto px-5 md:px-6 flex items-end justify-between gap-6 mb-6 md:mb-12">
      <div>
        <Reveal as="span" className="block text-primary text-[11px] md:text-xs tracking-[0.3em] uppercase font-medium mb-3 md:mb-5">
          De la carta
        </Reveal>
        <Reveal as="h2" delay={0.08} className="font-serif text-3xl md:text-5xl text-foreground leading-[1.05]">
          <span id="de-la-carta-titulo">Lo que sale de la barra</span>
        </Reveal>
      </div>
      <Link
        to="/carta"
        className="hidden md:inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        Ver toda la carta <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>

    <ul className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-5 scrollbar-hide px-5 pb-2 md:grid md:grid-cols-5 md:gap-5 md:overflow-visible md:max-w-7xl md:mx-auto md:px-6">
      {cocteles.map((c, i) => (
        <Reveal
          as="li"
          key={c.nombre}
          delay={i * 0.06}
          className={`shrink-0 w-[62vw] max-w-[260px] snap-start md:w-auto md:max-w-none ${i === 2 ? "md:mt-16" : i % 2 === 1 ? "md:mt-8" : ""}`}
        >
          <Link to="/carta" className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-white/5">
              <OptimizedImage
                imagen={c.imagen}
                alt={c.alt}
                sizes="(min-width: 768px) 20vw, 62vw"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
            <h3 className="font-serif text-xl md:text-2xl text-white mt-3 md:mt-4 leading-tight">{c.nombre}</h3>
            <p className="text-white/55 text-sm font-light mt-1 leading-snug">{c.nota}</p>
          </Link>
        </Reveal>
      ))}
    </ul>

    <div className="px-5 mt-6 md:hidden">
      <Link to="/carta" className="inline-flex items-center gap-2 text-sm text-white/70">
        Ver toda la carta <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  </section>
);

export default CoctelesDeLaCarta;

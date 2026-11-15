import { Link } from "react-router-dom";
import { IMAGENES, type ImagenResponsive } from "@/assets/imagenes";
import FotoPortada from "./FotoPortada";

/**
 * Cinco cócteles de la carta con su foto real (sesión del 12/11/2026). Va
 * dentro de la vitrina «Cócteles de autor» (Showcase), sin título propio.
 *
 * Solo se nombran los cócteles que se reconocen sin dudas en la foto
 * (Moscow Mule por la taza de cobre, Aperol por el logo de la copa…). Las
 * notas son las descripciones de la carta (Supabase, 12/11/2026).
 * En el móvil es una tira con desplazamiento lateral; desde md, cinco
 * columnas con la del centro algo más baja para romper la fila. Al pasar por
 * encima: la foto crece un 3 % y el nombre se pone dorado, nada más.
 */
const cocteles: { nombre: string; nota: string; imagen: ImagenResponsive; alt: string }[] = [
  { nombre: "Moscow Mule", nota: "Refrescante y especiado, servido en su icónica taza de cobre.", imagen: IMAGENES.moscowMule, alt: "Moscow Mule en taza de cobre con rodaja de lima deshidratada" },
  { nombre: "Spicy Mango Margarita", nota: "El clásico mexicano reinventado con mango picante y borde de Tajín.", imagen: IMAGENES.mango, alt: "Margarita de mango en copa coupé con borde de sal y chile" },
  { nombre: "Piña Colada", nota: "El clásico tropical cremoso con coco natural y piña fresca.", imagen: IMAGENES.pinaBotellas, alt: "Piña Colada en vaso con forma de piña, con la estantería de botellas detrás" },
  { nombre: "Aperol Spritz", nota: "El aperitivo italiano por excelencia, refrescante y vibrante.", imagen: IMAGENES.aperol, alt: "Aperol Spritz en copa de vino sobre la barra de mármol" },
  { nombre: "Mojito", nota: "El inmortal cubano con hierbabuena fresca machacada a mano.", imagen: IMAGENES.mojitoBarra, alt: "Mojito con hierbabuena y lima en vaso alto" },
];

const CoctelesDeLaCarta = () => (
  <ul
    aria-label="Algunos cócteles de la carta"
    className="mt-16 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide md:mx-auto md:mt-24 md:grid md:max-w-7xl md:grid-cols-5 md:gap-5 md:overflow-visible md:px-8 lg:px-10"
  >
    {cocteles.map((c, i) => (
      <li
        key={c.nombre}
        className={`w-[62vw] max-w-[260px] shrink-0 snap-start md:w-auto md:max-w-none ${i === 2 ? "md:mt-16" : i % 2 === 1 ? "md:mt-8" : ""}`}
      >
        <Link to="/carta" className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {/* Mientras llega la foto, el fondo cálido de las tarjetas (no gris). */}
          <div className="fondo-foto aspect-[3/4] overflow-hidden rounded-2xl">
            <FotoPortada
              imagen={c.imagen}
              alt={c.alt}
              sizes="(min-width: 768px) 20vw, 62vw"
              className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
          <h3 className="mt-3 font-serif text-xl font-medium leading-tight tracking-normal text-cream transition-colors duration-300 group-hover:text-primary md:mt-4 md:text-2xl">
            {c.nombre}
          </h3>
          <p className="mt-1 text-sm leading-snug text-white/70">{c.nota}</p>
        </Link>
      </li>
    ))}
  </ul>
);

export default CoctelesDeLaCarta;

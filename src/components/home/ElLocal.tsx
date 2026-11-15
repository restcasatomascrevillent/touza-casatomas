import { Plus } from "lucide-react";
import Reveal from "@/components/Reveal";
import ScrollTextReveal from "@/components/ScrollTextReveal";
import { HERO_VARIANTE_MOVIL, IMAGENES } from "@/assets/imagenes";
import { NEGOCIO } from "@/lib/negocio";
import FotoPortada from "./FotoPortada";
import { HERO_CON_FOTO_INTERIOR } from "./medios";

/**
 * «El local»: el salón a sangre y dos líneas. Antes esta vitrina hablaba del
 * sofá y el mármol con fotos de botellas de champagne (auditoría visual del
 * 15/11/2026, punto 6).
 *
 * La foto es la del salón. Mientras el hero no tenga su vídeo (y por tanto
 * enseñe esa misma foto), aquí va la estantería, para no repetirla.
 *
 * Las dos líneas se encienden con el scroll (ScrollTextReveal, CSS). El texto
 * largo de «coctelería y bar de copas en Crevillente», que es lo que lee
 * Google, sigue en el HTML dentro de un <details> nativo cerrado («Más sobre
 * Touza»): se indexa igual y no es un muro de texto en el móvil.
 */
const foto = HERO_CON_FOTO_INTERIOR
  ? {
      imagen: IMAGENES.estanteria,
      alt: "La estantería de botellas de Touza iluminada en dorado, de pared a pared",
      variante: undefined,
    }
  : {
      imagen: IMAGENES.interior,
      alt: "El salón de Touza: sofá corrido color mostaza, mesas de mármol y la barra al fondo",
      variante: { ...HERO_VARIANTE_MOVIL, sizes: "100vw" },
    };

const ElLocal = () => (
  <section aria-labelledby="el-local-titulo">
    <Reveal efecto="destapar" className="relative h-[72svh] min-h-[24rem] w-full overflow-hidden bg-white/5 md:h-[86svh] md:min-h-[32rem]">
      <FotoPortada imagen={foto.imagen} alt={foto.alt} sizes="100vw" variante={foto.variante} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/60 to-transparent" />
    </Reveal>

    <div className="relative mx-auto -mt-16 max-w-6xl px-5 pb-20 md:-mt-24 md:px-8 md:pb-32 lg:px-10">
      <h2 id="el-local-titulo" className="antetitulo mb-5 md:mb-8">
        El local
      </h2>
      <ScrollTextReveal className="text-balance font-serif text-[2rem] font-medium leading-[1.12] text-cream md:text-5xl md:leading-[1.08] lg:text-[3.5rem]">
        Sofá corrido, mármol y la barra a la vista, en la puerta de al lado de Casa Tomás.
      </ScrollTextReveal>

      <details className="desplegable group mt-12 max-w-3xl border-t border-white/15 md:mt-16">
        <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-6 py-4 text-base font-medium text-white/85 transition-colors hover:text-white md:text-lg">
          Más sobre Touza
          <Plus className="icono-mas h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        </summary>
        <div className="space-y-5 pb-4 pt-2 text-base leading-relaxed text-white/75 md:text-[17px]">
          <h3 className="font-serif text-2xl font-medium tracking-normal text-cream md:text-3xl">
            Coctelería y bar de copas en Crevillente
          </h3>
          <p>
            Touza es una coctelería y bar de copas en el centro de Crevillente (Crevillent), en la {NEGOCIO.calle},
            justo al lado del Restaurante Casa Tomás, del que forma parte. Es el sitio para tomar algo antes o después
            de cenar, quedar con amigos o alargar la noche con una buena copa.
          </p>
          <p>
            La carta gira en torno a los cócteles: de autor, con recetas propias de la casa, y clásicos bien hechos.
            También hay cócteles sin alcohol, una selección amplia de champagne y cava, cervezas y whiskies. Detrás de
            la barra hay cinco años de experiencia preparando copas, con ingredientes seleccionados y una presentación
            cuidada.
          </p>
          <p>
            En Touza no se reserva: ven directamente, con tu pareja, con amigos o después de cenar en Casa Tomás. Si es
            tu primera vez, déjate aconsejar y empieza por un cóctel de autor; si prefieres algo más clásico, en la
            carta encontrarás champagne, cava y whisky para acompañar la noche.
          </p>
        </div>
      </details>
    </div>
  </section>
);

export default ElLocal;

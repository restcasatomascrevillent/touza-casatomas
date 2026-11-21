import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { NEGOCIO } from "@/lib/negocio";
import { LOCALIDAD } from "./hechos";

/**
 * El texto para buscadores de la portada, al final y discreto (rediseño A,
 * 21/11/2026): antes vivía en «El local», que se ha quitado porque las tres
 * puertas ya enseñan el sitio. Una línea de qué es Touza, el enlace a «copas
 * después de cenar» y, plegado en un <details> nativo, el texto largo de
 * «coctelería y bar de copas en Crevillente»: Google lo lee igual y en
 * pantalla no es un muro de texto.
 */
const SobreTouza = () => (
  <section aria-labelledby="sobre-touza-titulo" className="mx-auto max-w-7xl px-5 pb-16 pt-12 md:px-8 md:pb-20 md:pt-16 lg:px-10">
    <div className="max-w-3xl">
      <h2 id="sobre-touza-titulo" className="antetitulo mb-4">
        Sobre Touza
      </h2>
      <p className="text-[15px] leading-relaxed text-white/70 md:text-base">
        Coctelería y bar de copas en {LOCALIDAD}, junto a Casa Tomás. ¿Cenas en Casa Tomás? La copa, aquí al lado:{" "}
        <Link
          to="/despues-de-cenar"
          className="rounded-sm text-white underline decoration-primary/60 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          copas después de cenar
        </Link>
        .
      </p>

      <details className="desplegable group mt-6 border-t border-white/10">
        <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-6 py-3 text-[15px] font-medium text-white/75 transition-colors hover:text-white">
          Más sobre Touza
          <Plus className="icono-mas h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        </summary>
        <div className="space-y-4 pb-4 pt-2 text-[15px] leading-relaxed text-white/70">
          <h3 className="font-serif text-xl font-medium tracking-normal text-cream md:text-2xl">
            Coctelería y bar de copas en Crevillente
          </h3>
          <p>
            Touza es una coctelería y bar de copas en el centro de Crevillente (Crevillent), en la {NEGOCIO.calle},
            justo al lado del Restaurante Casa Tomás, del que forma parte. Es el sitio para tomar algo antes o
            después de cenar, quedar con amigos o alargar la noche con una buena copa.
          </p>
          <p>
            La carta gira en torno a los cócteles: de autor, con recetas propias de la casa, y clásicos bien hechos.
            También hay cócteles sin alcohol, una selección amplia de champagne y cava, cervezas, whisky y otros
            destilados. Detrás de la barra hay cinco años de experiencia preparando copas, con ingredientes
            seleccionados y una presentación cuidada.
          </p>
          <p>
            En Touza no se reserva: ven directamente, con tu pareja, con amigos o después de cenar en Casa Tomás. Si
            es tu primera vez, déjate aconsejar y empieza por un cóctel de autor; si prefieres algo más clásico, en
            la carta encontrarás champagne, cava y whisky para acompañar la noche.
          </p>
        </div>
      </details>
    </div>
  </section>
);

export default SobreTouza;

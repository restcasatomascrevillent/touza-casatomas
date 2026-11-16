import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import { canonical } from "@/lib/site";
import { HORARIO_EN_FRASE, VIA, paginaSchema, sinDuplicados } from "@/lib/negocio";
import { descripcionDespuesDeCenar, slugCarta } from "@/lib/carta";
import { FOTO_SOBREMESA, fotoResponsive, volverAFotoOriginal } from "@/lib/foto";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { IMAGENES } from "@/assets/imagenes";
import { useCocteles, transformCoctelesToUI, type CoctelUI } from "@/hooks/useCocteles";

/**
 * /despues-de-cenar: la página que responde a «copas después de cenar en Casa
 * Tomás» (auditoría SEO/GEO del 15/11/2026, hallazgo 4). Breve y con hechos:
 * dónde está (la puerta de al lado), el horario y tres cócteles con foto
 * propia que enlazan a su ficha en /carta.
 *
 * Arriba, la sala de Touza (auditoría visual v0.10: era la única página sin
 * foto en la cabecera y en escritorio media pantalla quedaba en negro). En el
 * móvil, una franja a sangre bajo la cabecera transparente; desde lg, a la
 * derecha del título. Es la misma <img> en los dos casos (una sola descarga).
 * El texto va en la misma rejilla que la cabecera: `max-w-6xl` con `px-6`.
 *
 * «Dentro de Touza» (tres clips del local a 406×720) se quitó el 16/11/2026:
 * a ese tamaño se veían mal. El local se enseña con la foto de la cabecera.
 */
const CONTENEDOR = "mx-auto max-w-6xl px-6";

const TITULO = "Copas después de cenar en Casa Tomás";

/** Los primeros de esta lista que tengan foto propia; si faltan, los primeros con foto. */
const PREFERIDOS = ["Clover Club", "Pornstar Martini", "Espresso Martini", "Moscow Mule", "Aperol Spritz"];

function elegirTres(cocteles: CoctelUI[]): CoctelUI[] {
  // La foto genérica de la «T» no cuenta: aquí se enseñan cócteles con la suya.
  const conFoto = cocteles.filter((c) => c.image && !c.fotoGenerica);
  const preferidos = PREFERIDOS.map((nombre) => conFoto.find((c) => c.name === nombre)).filter(
    (c): c is CoctelUI => !!c
  );
  const resto = conFoto.filter((c) => !preferidos.includes(c));
  return [...preferidos, ...resto].slice(0, 3);
}

const DespuesDeCenar = () => {
  const { data } = useCocteles();
  const unicos = useMemo(() => sinDuplicados(data ?? []), [data]);
  const tres = useMemo(() => elegirTres(transformCoctelesToUI(unicos)), [unicos]);
  // El rango de precios sale de la carta (ver `descripcionDespuesDeCenar`).
  const descripcion = useMemo(() => descripcionDespuesDeCenar(unicos), [unicos]);

  return (
    <Layout>
      <Seo
        title={`${TITULO} · Touza`}
        description={descripcion}
        canonical={canonical("/despues-de-cenar")}
        keywords={["copas después de cenar", "casa tomás crevillente", "copas crevillente", "coctelería junto a casa tomás"]}
        schema={paginaSchema({ ruta: "/despues-de-cenar", nombre: TITULO, descripcion })}
      />

      <section className="pb-12 md:pb-20">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-12 lg:gap-14 lg:px-6 lg:pt-40">
          {/* La foto: franja en el móvil, columna desde lg. Es el LCP. */}
          <div className="relative h-[42svh] min-h-[16rem] max-h-[26rem] overflow-hidden md:h-[48svh] md:max-h-[32rem] lg:order-2 lg:col-span-5 lg:h-auto lg:max-h-none lg:min-h-0 lg:self-start lg:aspect-[4/5] lg:rounded-2xl lg:ring-1 lg:ring-white/10">
            <OptimizedImage
              imagen={IMAGENES.sala}
              alt="La sala de Touza: banco corrido mostaza, sillones y mesas de mármol bajo los aros de luz"
              sizes="(min-width: 1024px) 420px, 100vw"
              priority
              className="h-full w-full object-cover object-[50%_62%] lg:object-center"
            />
            {/* Móvil: sombra arriba para la cabecera y fundido al fondo abajo,
                donde empieza el título. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent via-35% to-background lg:hidden"
            />
          </div>

          <div className="relative z-10 -mt-12 px-6 md:-mt-16 lg:order-1 lg:col-span-7 lg:mt-0 lg:px-0 lg:pt-4">
            <h1
              style={{ animationDelay: "0.1s" }}
              className="entrada-hero max-w-[13ch] font-serif text-5xl font-bold leading-[0.95] text-white md:text-7xl lg:text-[5.5rem]"
            >
              {TITULO}
            </h1>
            <p
              style={{ animationDelay: "0.25s" }}
              className="entrada-hero mt-6 max-w-xl text-base leading-relaxed text-white/80 md:mt-8 md:text-lg"
            >
              Cenas en Casa Tomás y la copa te la tomas en Touza, la coctelería de la casa.
            </p>

            <ul className="mt-10 max-w-3xl border-t border-white/10 md:mt-14">
              <li className="border-b border-white/10 py-5 font-serif text-xl leading-snug text-[#F3EEE4] md:py-6 md:text-2xl">
                Es la puerta de al lado: sales del restaurante y entras en el bar.
              </li>
              <li className="border-b border-white/10 py-5 md:py-6">
                <p className="font-serif text-xl leading-snug text-[#F3EEE4] md:text-2xl">
                  Casa Tomás está en el n.º 2 de la {VIA}; Touza, en el n.º 4.
                </p>
                {/* Las dos puertas, una junto a la otra. Sin borde de botón:
                    antes parecían un selector y no se podían pulsar. */}
                <div aria-hidden="true" className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
                  <span className="inline-flex items-center gap-2 text-white/70">
                    <MapPin className="h-4 w-4 text-white/45" />
                    Casa Tomás · n.º 2
                  </span>
                  <span className="inline-flex items-center gap-2 text-[#F3EEE4]">
                    <MapPin className="h-4 w-4 text-[#D8B47E]" />
                    Touza · n.º 4
                  </span>
                </div>
              </li>
              <li className="border-b border-white/10 py-5 font-serif text-xl leading-snug text-[#F3EEE4] [font-variant-numeric:lining-nums] md:py-6 md:text-2xl">
                {HORARIO_EN_FRASE}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {tres.length > 0 && (
        <section aria-labelledby="sobremesa-titulo" className="pb-12 md:pb-20">
          <div className={CONTENEDOR}>
            <h2 id="sobremesa-titulo" className="font-serif text-3xl text-[#F3EEE4] md:text-5xl">
              Para la sobremesa
            </h2>
            <ul className="-mx-6 mt-6 flex snap-x scroll-px-6 gap-4 overflow-x-auto px-6 scrollbar-hide md:mx-0 md:mt-10 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
              {tres.map((coctel) => (
                <li key={coctel.id} className="w-[64vw] max-w-[18rem] shrink-0 snap-start md:w-auto md:max-w-none">
                  <Link
                    to={`/carta#${slugCarta(coctel.name)}`}
                    className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                  >
                    <div className="fondo-foto aspect-[3/4] overflow-hidden rounded-2xl">
                      {/* Las tres a la vez (sin `lazy`): en el móvil la 2.ª y la
                          3.ª están fuera, a la derecha, y no llegaban hasta
                          deslizar. A su tamaño, pesan ~20 KB cada una. */}
                      <img
                        {...fotoResponsive(coctel.image, FOTO_SOBREMESA.anchos, FOTO_SOBREMESA.sizes)}
                        alt={coctel.name}
                        width={900}
                        height={1200}
                        decoding="async"
                        onError={(evento) => volverAFotoOriginal(evento.currentTarget, coctel.image)}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-3">
                      <h3 className="min-w-0 truncate font-serif text-lg leading-tight text-white transition-colors duration-500 group-hover:text-[#D8B47E] md:text-xl">
                        {coctel.name}
                      </h3>
                      <span className="shrink-0 font-serif text-lg text-primary [font-variant-numeric:lining-nums_tabular-nums] md:text-xl">
                        {coctel.price}
                      </span>
                    </div>
                    {coctel.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-white/70">{coctel.description}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Lleva su propio «Cómo llegar»: aquí se aparta la barra fija del móvil. */}
      <section data-oculta-barra-movil="" className="pb-20 md:pb-28">
        <div className={CONTENEDOR}>
          <div className="flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between md:pt-10">
            <p className="font-serif text-xl text-[#F3EEE4] md:text-2xl">Sin reservas: al acabar de cenar, ven directamente.</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/contacto"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#D8B47E] px-7 text-[15px] font-medium text-black transition-colors hover:bg-[#e6c796] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Cómo llegar
              </Link>
              <Link
                to="/carta"
                className="inline-flex min-h-12 items-center justify-center rounded-full px-7 text-[15px] text-white/85 ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Ver la carta de cócteles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DespuesDeCenar;

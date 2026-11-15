import { useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import { canonical } from "@/lib/site";
import { HORARIO_EN_FRASE, VIA, paginaSchema, sinDuplicados } from "@/lib/negocio";
import { slugCarta } from "@/lib/carta";
import { useCocteles, transformCoctelesToUI, type CoctelUI } from "@/hooks/useCocteles";

/**
 * /despues-de-cenar: la página que responde a «copas después de cenar en Casa
 * Tomás» (auditoría SEO/GEO del 15/11/2026, hallazgo 4). Breve y con hechos:
 * dónde está (la puerta de al lado), el horario y tres cócteles con foto
 * propia que enlazan a su ficha en /carta.
 */
const TITULO = "Copas después de cenar en Casa Tomás";
const DESCRIPCION =
  `Después de cenar en Casa Tomás, la copa en Touza: la puerta de al lado, en el n.º 4 de la ${VIA} (Crevillent). Cócteles de autor y clásicos, champagne y whisky. Sin reservas.`;

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
  const tres = useMemo(() => elegirTres(transformCoctelesToUI(sinDuplicados(data ?? []))), [data]);

  return (
    <Layout>
      <Seo
        title={`${TITULO} · Touza Crevillente`}
        description={DESCRIPCION}
        canonical={canonical("/despues-de-cenar")}
        keywords={["copas después de cenar", "casa tomás crevillente", "copas crevillente", "coctelería junto a casa tomás"]}
        schema={paginaSchema({ ruta: "/despues-de-cenar", nombre: TITULO, descripcion: DESCRIPCION })}
      />

      <section className="px-5 pt-32 pb-12 md:px-6 md:pt-44 md:pb-20">
        <div className="mx-auto max-w-6xl">
          <h1
            style={{ animationDelay: "0.1s" }}
            className="entrada-hero max-w-[13ch] font-serif text-5xl font-bold leading-[0.95] text-white md:text-7xl lg:text-8xl"
          >
            {TITULO}
          </h1>
          <p
            style={{ animationDelay: "0.25s" }}
            className="entrada-hero mt-6 max-w-xl text-base leading-relaxed text-white/80 md:mt-8 md:text-lg"
          >
            Cenas en Casa Tomás y la copa te la tomas en Touza, la coctelería de la casa.
          </p>

          <ul className="mt-12 max-w-3xl border-t border-white/10 md:mt-16">
            <li className="border-b border-white/10 py-5 font-serif text-xl leading-snug text-[#F3EEE4] md:py-6 md:text-2xl">
              Es la puerta de al lado: sales del restaurante y entras en el bar.
            </li>
            <li className="border-b border-white/10 py-5 md:py-6">
              <p className="font-serif text-xl leading-snug text-[#F3EEE4] md:text-2xl">
                Casa Tomás está en el n.º 2 de la {VIA}; Touza, en el n.º 4.
              </p>
              {/* Las dos puertas, una junto a la otra. */}
              <div aria-hidden="true" className="mt-4 grid max-w-md grid-cols-2 text-sm">
                <div className="rounded-l-md border border-white/15 px-4 py-3 text-white/70">
                  <span className="block font-serif text-lg text-white/80">Casa Tomás</span>
                  n.º 2
                </div>
                <div className="rounded-r-md border border-l-0 border-[#D8B47E]/70 bg-[#D8B47E]/10 px-4 py-3 text-[#D8B47E]">
                  <span className="block font-serif text-lg text-[#F3EEE4]">Touza</span>
                  n.º 4
                </div>
              </div>
            </li>
            <li className="border-b border-white/10 py-5 font-serif text-xl leading-snug text-[#F3EEE4] [font-variant-numeric:lining-nums] md:py-6 md:text-2xl">
              {HORARIO_EN_FRASE}
            </li>
          </ul>
        </div>
      </section>

      {tres.length > 0 && (
        <section aria-labelledby="sobremesa-titulo" className="px-5 pb-12 md:px-6 md:pb-20">
          <div className="mx-auto max-w-6xl">
            <h2 id="sobremesa-titulo" className="font-serif text-3xl text-[#F3EEE4] md:text-5xl">
              Para la sobremesa
            </h2>
            <ul className="-mx-5 mt-6 flex snap-x scroll-px-5 gap-4 overflow-x-auto px-5 scrollbar-hide md:mx-0 md:mt-10 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
              {tres.map((coctel) => (
                <li key={coctel.id} className="w-[64vw] max-w-[18rem] shrink-0 snap-start md:w-auto md:max-w-none">
                  <Link
                    to={`/carta#${slugCarta(coctel.name)}`}
                    className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-white/[0.04]">
                      <img
                        src={coctel.image}
                        alt={coctel.name}
                        width={900}
                        height={1200}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-3">
                      <h3 className="font-serif text-lg leading-tight text-white transition-colors duration-500 group-hover:text-[#D8B47E] md:text-xl">
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

      <section className="px-5 pb-20 md:px-6 md:pb-28">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between md:pt-10">
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
      </section>
    </Layout>
  );
};

export default DespuesDeCenar;

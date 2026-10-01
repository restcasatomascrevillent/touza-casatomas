import Reveal from "@/components/Reveal";

/**
 * "Lo que nos define" (antes FeaturesGrid en escritorio y FeaturesMobile en
 * móvil, con contenidos distintos).
 *
 * Solo datos verificables: cinco años de experiencia (confirmado por el
 * dueño), cócteles de autor (la carta) y el horario que publica la web
 * (`lib/negocio.ts`). Se retiraron "Est. 2023" y "200+ cócteles". El
 * Reservado no se repite aquí: tiene su vitrina justo encima.
 * Lista editorial con numeración, en vez de tres columnas iguales con icono.
 */
const claves = [
  {
    titulo: "Cinco años",
    texto: "de experiencia detrás de la barra, entre clásicos bien hechos y recetas propias.",
  },
  {
    titulo: "De autor",
    texto: "Cócteles con sello de la casa, ingredientes seleccionados y una presentación cuidada.",
  },
  {
    titulo: "Ambiente nocturno",
    texto: "De jueves a sábado hasta las 2:00 y los domingos desde las 18:00: el sitio para alargar la noche.",
  },
];

const Claves = () => {
  return (
    <section className="bg-black text-white px-5 pt-12 pb-4 md:px-6 md:pt-28 md:pb-8 lg:pt-32">
      <div className="max-w-6xl mx-auto grid gap-8 md:gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal as="span" className="block text-primary text-[11px] md:text-xs tracking-[0.3em] uppercase font-medium mb-3 md:mb-5">
            Touza
          </Reveal>
          <Reveal as="h2" delay={0.08} className="font-serif text-3xl md:text-5xl text-white leading-[1.05]">
            Lo que nos define
          </Reveal>
        </div>

        <ul className="lg:col-span-8 border-t border-white/10">
          {claves.map((clave, index) => (
            <Reveal
              as="li"
              key={clave.titulo}
              delay={index * 0.1}
              className="grid grid-cols-[2rem_1fr] gap-x-3 gap-y-1 py-5 border-b border-white/10 md:grid-cols-[3rem_minmax(0,15rem)_1fr] md:gap-x-8 md:items-baseline md:py-8"
            >
              <span aria-hidden="true" className="font-serif text-primary text-base md:text-lg tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-serif text-2xl md:text-4xl text-white leading-tight">{clave.titulo}</h3>
              <p className="col-start-2 md:col-start-3 text-white/65 text-sm md:text-base font-light leading-relaxed">
                {clave.texto}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Claves;

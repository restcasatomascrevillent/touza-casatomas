import { Navigation } from "lucide-react";
import Encabezado from "@/components/home/Encabezado";
import { filasHorario } from "@/components/home/hechos";
import { DIRECCION_MAPS, NEGOCIO, TELEFONO, URL_COMO_LLEGAR } from "@/lib/negocio";

/**
 * «Visítanos»: el único sitio de la portada con la dirección, el horario, el
 * teléfono y el correo (antes salían también en el pie, en «Lo que nos
 * define» y en el hero). El horario sale de `NEGOCIO`, como el del JSON-LD,
 * y debajo va «Sin reservas: ven directamente.».
 *
 * «Cómo llegar» (blanco, a la ruta de Google Maps) solo en escritorio: en el
 * móvil ya está siempre en la barra fija de abajo y serían dos botones iguales
 * a la vez. Fondo en el azul petróleo de las paredes del local.
 */
const enlace =
  "rounded underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const VisitUs = () => (
  <section id="visitanos" aria-labelledby="visitanos-titulo" className="bg-petroleo text-white">
    <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-12 lg:items-end lg:gap-x-12 lg:px-10 lg:py-32">
      <div className="lg:col-span-5">
        <Encabezado id="visitanos-titulo" lineas={["Visítanos"]} tituloClassName="text-[3.25rem] leading-none md:text-7xl lg:text-8xl" />
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DIRECCION_MAPS)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ver ${NEGOCIO.calle}, ${NEGOCIO.localidad}, en Google Maps`}
          className={`mt-6 inline-block text-lg leading-relaxed text-white/80 md:mt-8 md:text-xl ${enlace}`}
        >
          {NEGOCIO.calle}
          <br />
          {NEGOCIO.cp} {NEGOCIO.localidad}, {NEGOCIO.region}
        </a>
      </div>

      <div className="lg:col-span-4">
        <h3 className="antetitulo mb-4">Horario</h3>
        <dl className="divide-y divide-white/10 border-y border-white/10">
          {filasHorario().map((fila) => (
            <div key={fila.dias} className="flex items-baseline justify-between gap-6 py-3.5">
              <dt className="text-base text-white/80">{fila.dias}</dt>
              <dd className="font-serif text-2xl font-medium tabular-nums text-cream">{fila.horas}</dd>
            </div>
          ))}
        </dl>
        {/* Estaba en el hero, tras la frase del horario (17/11/2026). */}
        <p className="mt-4 text-[15px] leading-relaxed text-white/75">Sin reservas: ven directamente.</p>
      </div>

      <div className="flex flex-col items-start gap-6 lg:col-span-3 lg:items-end">
        <a
          href={URL_COMO_LLEGAR}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Cómo llegar a Touza (abre Google Maps)"
          className="boton boton-macizo hidden lg:inline-flex"
        >
          <Navigation className="h-4 w-4" aria-hidden="true" />
          Cómo llegar
        </a>
        <div className="flex flex-col gap-1 text-base text-white/80 lg:items-end">
          <a href={TELEFONO.href} aria-label={`Llamar al ${TELEFONO.texto}`} className={`inline-flex min-h-11 items-center ${enlace}`}>
            {TELEFONO.texto}
          </a>
          <a href={`mailto:${NEGOCIO.email}`} className={`inline-flex min-h-11 items-center break-all ${enlace}`}>
            {NEGOCIO.email}
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default VisitUs;

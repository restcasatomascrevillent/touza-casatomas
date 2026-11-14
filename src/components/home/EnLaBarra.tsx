import Reveal from "@/components/Reveal";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { IMAGENES } from "@/assets/imagenes";

/**
 * Cómo se hace una copa, en dos fotos reales de la barra: servir y la copa
 * terminada. Es una secuencia de verdad, por eso va numerada. (La foto de
 * «Se agita» la quitó el dueño el 14/11/2026.)
 *
 * Dos columnas en todos los tamaños; en escritorio la segunda baja un poco
 * para que se lea como un movimiento.
 */
const pasos: { titulo: string; texto: string; imagen: typeof IMAGENES.sirviendo; alt: string; encuadre?: string }[] = [
  { titulo: "Se sirve", texto: "Colado, directo a la copa.", imagen: IMAGENES.sirviendo, alt: "El bartender sirviendo un cóctel rojo en copa coupé" },
  { titulo: "Y a disfrutarla", texto: "Con su guarnición, lista para tomar sin prisas.", imagen: IMAGENES.copaRoja2, alt: "Cóctel rojo con espuma y arándanos sobre la barra de mármol" },
];

const EnLaBarra = () => (
  <section aria-labelledby="en-la-barra-titulo" className="bg-black px-5 py-12 md:px-6 md:py-28">
    <div className="max-w-6xl mx-auto">
      <div className="max-w-xl mb-8 md:mb-16">
        <Reveal as="span" className="block text-primary text-[11px] md:text-xs tracking-[0.3em] uppercase font-medium mb-3 md:mb-5">
          En la barra
        </Reveal>
        <Reveal as="h2" delay={0.08} className="font-serif text-3xl md:text-5xl text-white leading-[1.05]">
          <span id="en-la-barra-titulo">De la coctelera a la copa</span>
        </Reveal>
      </div>

      <ol className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-10 md:max-w-4xl">
        {pasos.map((paso, i) => (
          <Reveal
            as="li"
            key={paso.titulo}
            delay={i * 0.1}
            className={i === 1 ? "md:mt-24" : undefined}
          >
            <div className={`overflow-hidden rounded-2xl bg-white/5 aspect-[3/4]`}>
              <OptimizedImage
                imagen={paso.imagen}
                alt={paso.alt}
                sizes="(min-width: 768px) 430px, 50vw"
                className={`w-full h-full object-cover ${paso.encuadre ?? ""}`}
              />
            </div>
            <div className="mt-3 md:mt-5 flex gap-3 md:gap-4">
              <span aria-hidden="true" className="font-serif text-primary text-base md:text-lg tabular-nums leading-tight">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-serif text-xl md:text-3xl text-white leading-tight">{paso.titulo}</h3>
                <p className="text-white/60 text-sm md:text-base font-light leading-relaxed mt-1">{paso.texto}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  </section>
);

export default EnLaBarra;

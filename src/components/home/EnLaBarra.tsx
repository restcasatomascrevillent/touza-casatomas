import Reveal from "@/components/Reveal";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { IMAGENES } from "@/assets/imagenes";

/**
 * Cómo se hace una copa, en tres fotos reales de la barra: agitar, servir y
 * la copa terminada. Es una secuencia de verdad, por eso va numerada.
 *
 * Escritorio: tres columnas escalonadas (la del medio baja) para que se lea
 * como un movimiento. Móvil: la primera foto grande y las otras dos debajo,
 * en dos columnas, sin desplazamiento lateral (ya lo tiene la tira de cócteles).
 */
const pasos: { titulo: string; texto: string; imagen: typeof IMAGENES.agitando; alt: string; encuadre?: string }[] = [
  { titulo: "Se agita", texto: "Hielo, medida y coctelera: cada copa se prepara al momento.", imagen: IMAGENES.agitando, alt: "El bartender de Touza agitando la coctelera detrás de la barra" },
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

      <ol className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-8">
        {pasos.map((paso, i) => (
          <Reveal
            as="li"
            key={paso.titulo}
            delay={i * 0.1}
            className={i === 0 ? "col-span-2 md:col-span-1" : i === 1 ? "md:mt-24" : "md:mt-48"}
          >
            <div className={`overflow-hidden rounded-2xl bg-white/5 ${i === 0 ? "aspect-[4/5]" : "aspect-[3/4]"} md:aspect-[3/4]`}>
              <OptimizedImage
                imagen={paso.imagen}
                alt={paso.alt}
                sizes="(min-width: 768px) 33vw, (min-width: 0px) 50vw"
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

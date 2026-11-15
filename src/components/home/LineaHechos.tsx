import { cn } from "@/lib/utils";
import { LOCALIDAD, lineaDeHechos } from "./hechos";

/**
 * Línea de hechos del hero: qué es, dónde está, cuándo abre y que no se
 * reserva, en dos frases que se entienden solas (y que un buscador o un
 * asistente puede citar tal cual; auditoría SEO del 15/11/2026, hallazgo 3).
 * El horario sale de `NEGOCIO`, como el del JSON-LD.
 *
 * La primera frase es un <h2> con «Crevillent» (hallazgo 9), aunque se vea
 * como texto: en el hero solo manda la marca.
 */
const LineaHechos = ({ className }: { className?: string }) => (
  <div className={cn("max-w-xl", className)}>
    <h2 className="font-sans text-[15px] font-medium leading-snug tracking-normal text-cream md:text-base">
      Coctelería en {LOCALIDAD}, junto a Casa Tomás.
    </h2>
    {/* Sombra: va sobre la foto con la pared trenzada (auditoría visual v0.10, fallo 20). */}
    <p className="mt-1 text-[15px] leading-relaxed text-white/80 [text-shadow:0_1px_12px_rgb(0_0_0/0.6)] md:text-base">
      {lineaDeHechos()}
    </p>
  </div>
);

export default LineaHechos;

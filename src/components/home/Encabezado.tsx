import type { CSSProperties } from "react";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";

interface EncabezadoProps {
  /** Cada elemento es una línea del título; cada una entra tras su máscara. */
  lineas: string[];
  id?: string;
  /** Etiqueta pequeña sobre el título, con el filete dorado que se dibuja. */
  antetitulo?: string;
  nivel?: "h2" | "h3";
  className?: string;
  tituloClassName?: string;
}

/**
 * Título de sección de la portada: el gesto de los títulos (líneas que suben
 * tras una máscara, `efecto="lineas"` de <Reveal>). Las líneas las decide
 * quien lo usa, para que el corte sea siempre el bueno y no dependa del
 * ancho. Si una línea no cabe, se parte dentro de su propia máscara.
 *
 * Cada línea lleva su espacio final: el nombre accesible del título queda
 * «Cócteles de autor» y no «Cóctelesde autor».
 */
const Encabezado = ({ lineas, id, antetitulo, nivel = "h2", className, tituloClassName }: EncabezadoProps) => {
  const Titulo = nivel;
  return (
    <Reveal efecto="lineas" className={className}>
      {antetitulo && (
        <p className="antetitulo mb-4 flex items-center gap-3 md:mb-6">
          <span aria-hidden="true" className="trazo h-px w-8 bg-primary/50 md:w-12" />
          {antetitulo}
        </p>
      )}
      <Titulo id={id} className={cn("font-serif font-medium tracking-normal text-cream", tituloClassName)}>
        {lineas.map((linea, i) => (
          <span key={i} className="linea" style={{ "--l": i } as CSSProperties}>
            <span>
              {linea}
              {i < lineas.length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </Titulo>
    </Reveal>
  );
};

export default Encabezado;

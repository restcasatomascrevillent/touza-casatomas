/**
 * Una botella (o copa) de la carta de Touza: «la vitrina».
 *
 * La foto va en un nicho estrecho 3:5 con luz cálida desde abajo, como la
 * estantería retroiluminada de la barra; al lado, nombre y precio unidos por
 * una línea de puntos (el gesto de las cartas de bar) y debajo, si la hay, la
 * descripción corta. Sin foto, la misma fila sin nicho.
 *
 * La entrada (`.fila-botella` en index.css) es una animación CSS que se
 * dispara cada vez que la pestaña pasa de oculta a visible, escalonada con
 * `--i`. Sin JS el contenido está igual; con reduced-motion no se anima.
 */
interface Props {
  nombre: string;
  precio: string;
  descripcion?: string;
  tipo?: string;
  imagen?: string;
  indice: number;
}

const FilaBotella = ({ nombre, precio, descripcion, tipo, imagen, indice }: Props) => (
  <li
    className="fila-botella group flex gap-5 md:gap-6 py-5 md:py-6 border-t border-white/[0.07]"
    style={{ "--i": Math.min(indice, 10) } as React.CSSProperties}
  >
    {imagen && (
      <div className="nicho-botella relative shrink-0 w-[84px] md:w-[104px] aspect-[3/5] overflow-hidden rounded-[4px] ring-1 ring-inset ring-white/[0.08]">
        <img
          src={imagen}
          alt={nombre}
          width={900}
          height={1500}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.035]"
        />
        <span aria-hidden="true" className="luz-nicho pointer-events-none absolute inset-0" />
      </div>
    )}
    <div className="flex-1 min-w-0 self-center">
      <div className="flex items-baseline gap-3">
        <h3 className="font-serif text-[1.3rem] md:text-[1.45rem] leading-snug text-[#F3EEE4] transition-colors duration-500 group-hover:text-[#D8B47E]">
          {nombre}
        </h3>
        <span aria-hidden="true" className="flex-1 min-w-6 border-b border-dotted border-white/20 -translate-y-[0.3em]" />
        <span className="font-serif text-[1.3rem] md:text-[1.45rem] text-primary whitespace-nowrap [font-variant-numeric:lining-nums_tabular-nums]">
          {precio}
        </span>
      </div>
      {tipo && <p className="mt-0.5 text-[13px] font-light text-white/45">{tipo}</p>}
      {descripcion && (
        <p className="mt-2 max-w-[54ch] text-[14px] font-light leading-[1.7] text-white/60 line-clamp-3">{descripcion}</p>
      )}
    </div>
  </li>
);

export default FilaBotella;

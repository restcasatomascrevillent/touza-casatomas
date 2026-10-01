import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { RUTAS_LEGALES, ULTIMA_ACTUALIZACION } from "@/lib/legal";

const PAGINAS_LEGALES = [
  { to: RUTAS_LEGALES.avisoLegal, texto: "Aviso legal" },
  { to: RUTAS_LEGALES.privacidad, texto: "Privacidad" },
  { to: RUTAS_LEGALES.cookies, texto: "Cookies" },
];

interface LegalLayoutProps {
  titulo: string;
  entradilla: string;
  children: ReactNode;
}

/**
 * Carcasa común de /aviso-legal, /privacidad y /cookies: cabecera negra como
 * la de Contacto, texto a una columna de lectura (~68 caracteres) y un índice
 * para saltar entre las tres páginas. El contenido va en HTML plano (h2, p,
 * ul, table…) y se estiliza aquí, para que las páginas sean solo texto.
 */
const LegalLayout = ({ titulo, entradilla, children }: LegalLayoutProps) => {
  const { pathname } = useLocation();

  return (
    <Layout>
      <section className="bg-black pt-28 pb-10 px-5 md:px-6 md:pt-40 md:pb-16">
        <div className="max-w-3xl mx-auto">
          <span
            style={{ animationDelay: "0.1s" }}
            className="entrada-hero text-primary text-xs tracking-[0.3em] uppercase mb-4 block font-medium"
          >
            Información legal
          </span>
          <h1
            style={{ animationDelay: "0.2s" }}
            className="entrada-hero font-serif font-bold text-white text-4xl md:text-6xl text-balance"
          >
            {titulo}
          </h1>
          <p
            style={{ animationDelay: "0.3s" }}
            className="entrada-hero mt-5 text-white/70 font-light leading-relaxed max-w-2xl"
          >
            {entradilla}
          </p>
          <p className="mt-4 text-xs text-white/50 font-light">Última actualización: {ULTIMA_ACTUALIZACION}</p>

          <nav aria-label="Textos legales" className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {PAGINAS_LEGALES.map((p) => {
                const actual = pathname === p.to;
                return (
                  <li key={p.to}>
                    <Link
                      to={p.to}
                      aria-current={actual ? "page" : undefined}
                      className={`inline-flex min-h-[44px] items-center px-5 rounded-full border text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        actual
                          ? "border-primary/60 text-primary"
                          : "border-white/15 text-white/70 hover:text-white hover:border-white/40"
                      }`}
                    >
                      {p.texto}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </section>

      <section className="bg-background py-12 md:py-20 px-5 md:px-6">
        <article
          className={[
            "max-w-3xl mx-auto text-[0.95rem] md:text-base text-white/75 font-light leading-relaxed",
            "[&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-white [&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:mt-14 [&_h2]:mb-5 first:[&_h2]:mt-0 [&_h2]:scroll-mt-28",
            "[&_h3]:text-white [&_h3]:font-medium [&_h3]:text-base [&_h3]:mt-8 [&_h3]:mb-3",
            "[&_p]:mb-4 [&_ul]:mb-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:marker:text-primary/70",
            "[&_strong]:text-white [&_strong]:font-medium",
            "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-primary/40 hover:[&_a]:decoration-primary [&_a]:break-words",
            "[&_dl]:mb-6 [&_dt]:text-xs [&_dt]:uppercase [&_dt]:tracking-wider [&_dt]:text-white/50 [&_dd]:text-white [&_dd]:mb-4",
          ].join(" ")}
        >
          {children}
        </article>
      </section>
    </Layout>
  );
};

/** Marcador visible para un dato que falta: no se inventa, se señala. */
export const Pendiente = ({ children }: { children: ReactNode }) => (
  <mark className="bg-primary/15 text-primary px-1.5 py-0.5 rounded font-medium">{children}</mark>
);

/** Tabla con scroll horizontal propio: en móvil no ensancha la página. */
export const TablaLegal = ({ cabeceras, filas, titulo }: { cabeceras: string[]; filas: ReactNode[][]; titulo: string }) => (
  <div className="mb-6 overflow-x-auto rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" role="region" aria-label={titulo} tabIndex={0}>
    <table className="w-full min-w-[640px] border-collapse text-sm">
      <thead>
        <tr>
          {cabeceras.map((c) => (
            <th
              key={c}
              scope="col"
              className="text-left align-bottom text-xs uppercase tracking-wider text-white/50 font-medium border-b border-white/15 py-3 pr-4"
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila, i) => (
          <tr key={i} className="border-b border-white/5 align-top">
            {fila.map((celda, j) => (
              <td key={j} className={`py-3 pr-4 ${j === 0 ? "text-white font-normal" : ""}`}>
                {celda}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default LegalLayout;

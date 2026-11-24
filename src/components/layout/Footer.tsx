import { Link, useLocation } from "react-router-dom";
import { Instagram, Navigation } from "lucide-react";
import Reveal from "@/components/Reveal";
import { RUTAS_LEGALES } from "@/lib/legal";
import { INSTAGRAM_CASA_TOMAS, NEGOCIO, URL_COMO_LLEGAR } from "@/lib/negocio";

/**
 * Pie mínimo (auditoría del 15/11/2026): enlaces, redes y legales. La
 * dirección, el horario, el teléfono y el correo viven en «Visítanos» (la
 * portada) y en Contacto; antes el pie los repetía justo debajo. Fuera el lema
 * de «raíces gallegas», que nadie había confirmado.
 *
 * `/despues-de-cenar` es la página para quien busca «copas después de cenar
 * en Casa Tomás» (auditoría SEO, hallazgo 4); el texto del enlace es esa
 * búsqueda.
 */
const footerLinks = [
  { name: "Inicio", path: "/" },
  { name: "Carta", path: "/carta" },
  { name: "Contacto", path: "/contacto" },
  { name: "Copas después de cenar en Casa Tomás", path: "/despues-de-cenar" },
];

const legalLinks = [
  { name: "Aviso legal", path: RUTAS_LEGALES.avisoLegal },
  { name: "Privacidad", path: RUTAS_LEGALES.privacidad },
  { name: "Cookies", path: RUTAS_LEGALES.cookies },
];

// En el pie, solo el Instagram de Casa Tomás (pedido del dueño, 24/11/2026):
// fuera Facebook y el Instagram de Touza.
const redes = [
  { nombre: "Instagram", url: INSTAGRAM_CASA_TOMAS, Icono: Instagram, de: "Casa Tomás" },
];

const enlace =
  "rounded transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

/** Enlaces de texto del pie con zona táctil de 44 px de alto (auditoría visual v0.10, fallo 13). */
const enlaceTactil = `inline-flex min-h-11 items-center ${enlace}`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  // La portada (con «Visítanos») y Contacto (con el mapa) ya acaban con la
  // dirección justo encima: el CTA repetiría lo que acaba de leerse.
  const ruta = useLocation().pathname.replace(/\/+$/, "") || "/";
  const conCta = ruta !== "/" && ruta !== "/contacto";

  return (
    <>
      {/* Antes del pie, en el resto de páginas: dónde está y cómo llegar.
          Solo desde lg: por debajo está la barra fija con el mismo «Cómo
          llegar» siempre a mano. Solo el título aparece con <Reveal>. */}
      {conCta && (
        <section className="hidden bg-black px-6 py-24 text-center lg:block">
          <span aria-hidden="true" className="mx-auto mb-14 block h-px max-w-xl bg-primary/40" />
          <Reveal as="h3" className="mb-4 font-serif text-6xl font-medium tracking-normal text-cream">
            Te esperamos en Touza
          </Reveal>
          <p className="mb-9 text-lg text-white/75">
            {NEGOCIO.calle}, {NEGOCIO.localidad}
          </p>
          <a
            href={URL_COMO_LLEGAR}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Cómo llegar a Touza (abre Google Maps)"
            className="boton boton-macizo"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Cómo llegar
          </a>
        </section>
      )}

      <footer className="border-t border-white/10 bg-black">
        {/* `.pie-contenido`: si hay barra fija en el móvil, el pie deja al final
            su alto, en su mismo negro (index.css). Sin JS la barra no se
            aparta y taparía los legales. */}
        <div className="pie-contenido mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <Link to="/" className="inline-flex min-h-11 items-center self-start lg:self-auto" aria-label="Touza, ir al inicio">
              <span className="font-serif text-2xl font-bold tracking-wider text-primary">TOUZA</span>
            </Link>

            <nav aria-label="Pie de página">
              <ul className="-mx-1 flex flex-wrap gap-x-4 gap-y-1 text-[15px] text-white/75">
                {footerLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className={`${enlaceTactil} px-1`}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex gap-3">
              {redes.map(({ nombre, url, Icono, de }) =>
                url ? (
                  <a
                    key={nombre}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${nombre} de ${de} (se abre en otra pestaña)`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors duration-200 hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Icono className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                ) : null
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-1 border-t border-white/10 pt-5 text-sm text-white/70 md:flex-row md:items-center md:justify-between md:gap-6">
            <p className="py-2 md:py-0">© {currentYear} Touza Cocktail Bar</p>
            <nav aria-label="Información legal">
              <ul className="-mx-1 flex flex-wrap gap-x-4">
                {legalLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className={`${enlaceTactil} px-1`}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p>
              Parte de{" "}
              <a
                href="https://restaurantecasatomascrevillente.es/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${enlaceTactil} text-white/85 underline-offset-4 hover:underline`}
              >
                Restaurante Casa Tomás
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

import { Link, useLocation } from "react-router-dom";
import { Instagram, Facebook, Navigation } from "lucide-react";
import Reveal from "@/components/Reveal";
import { RUTAS_LEGALES } from "@/lib/legal";
import { NEGOCIO, URL_COMO_LLEGAR } from "@/lib/negocio";

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

const redes = [
  { nombre: "Instagram", url: NEGOCIO.redes.find((r) => r.includes("instagram")), Icono: Instagram },
  { nombre: "Facebook", url: NEGOCIO.redes.find((r) => r.includes("facebook")), Icono: Facebook },
];

const enlace =
  "rounded transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

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
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <Link to="/" className="inline-flex min-h-11 items-center self-start lg:self-auto" aria-label="Touza, ir al inicio">
              <span className="font-serif text-2xl font-bold tracking-wider text-primary">TOUZA</span>
            </Link>

            <nav aria-label="Pie de página">
              <ul className="flex flex-wrap gap-x-6 gap-y-1 text-[15px] text-white/75">
                {footerLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className={`inline-flex min-h-11 items-center ${enlace}`}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex gap-3">
              {redes.map(({ nombre, url, Icono }) =>
                url ? (
                  <a
                    key={nombre}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${nombre} de Touza (se abre en otra pestaña)`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors duration-200 hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Icono className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                ) : null
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-white/70 md:flex-row md:items-center md:justify-between md:gap-6">
            <p>© {currentYear} Touza Cocktail Bar</p>
            <nav aria-label="Información legal">
              <ul className="flex flex-wrap gap-x-5">
                {legalLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className={`inline-flex min-h-11 items-center md:min-h-0 md:py-1 ${enlace}`}>
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
                className={`text-white/85 underline-offset-4 hover:underline ${enlace}`}
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

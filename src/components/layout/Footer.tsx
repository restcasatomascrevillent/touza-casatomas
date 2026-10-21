import { Link, useLocation } from "react-router-dom";
import { Instagram, Facebook, Navigation } from "lucide-react";
import Reveal from "@/components/Reveal";
import { RUTAS_LEGALES } from "@/lib/legal";
import { NEGOCIO, TELEFONO, URL_COMO_LLEGAR } from "@/lib/negocio";

const footerLinks = [
  { name: "Carta", path: "/carta" },
  { name: "Galería", path: "/galeria" },
  { name: "Contacto", path: "/contacto" },
];

const legalLinks = [
  { name: "Aviso legal", path: RUTAS_LEGALES.avisoLegal },
  { name: "Privacidad", path: RUTAS_LEGALES.privacidad },
  { name: "Cookies", path: RUTAS_LEGALES.cookies },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  // La portada (con "Visítanos") y Contacto (con el mapa) ya acaban con la
  // dirección justo encima: el CTA repetiría lo que acaba de leerse.
  const ruta = useLocation().pathname.replace(/\/+$/, "") || "/";
  const conCta = ruta !== "/" && ruta !== "/contacto";

  return (
    <>
      {/* Pre-footer CTA. Hasta el 01/10/2026 era "Reserva tu experiencia" →
          El Reservado; Touza ya no acepta reservas por la web, así que invita
          a venir y lleva a la ruta en Google Maps. Solo desde lg: por debajo
          está la barra fija (lg:hidden) con el mismo "Cómo llegar" siempre a
          mano, y repetirlo encima del pie solo alargaba la página. */}
      {conCta && (
      <section className="hidden lg:block bg-black py-24 text-center px-6">
        {/* <Reveal> y no `whileInView`: este CTA va en el pie de TODAS las
            páginas y el `opacity:0` de framer salía en línea en el HTML del
            SSG, oculto hasta hidratar. La línea dorada crece desde el centro
            (scale 0 → 1; con 1 px de alto, en la práctica es un scaleX). */}
        <Reveal y={0} scale={0} aria-hidden="true" className="h-px bg-primary/40 max-w-xl mx-auto mb-6 md:mb-16" />
        <Reveal as="h3" y={20} delay={0.3} className="font-serif text-3xl md:text-6xl text-white mb-3 md:mb-5">
          Te esperamos en Touza
        </Reveal>
        <Reveal as="p" y={0} delay={0.4} className="text-white/65 text-[15px] md:text-lg font-light mb-6 md:mb-8">
          {NEGOCIO.calle} · {NEGOCIO.localidad}
        </Reveal>
        <Reveal y={0} delay={0.5}>
          <a
            href={URL_COMO_LLEGAR}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Cómo llegar a Touza (abre Google Maps)"
            className="inline-flex items-center gap-2 px-8 md:px-10 py-3.5 md:py-4 border border-white/25 rounded-full text-white/85 hover:text-white hover:border-white/50 active:scale-[0.97] transition-all duration-300 text-base md:text-lg font-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Navigation className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
            Cómo llegar
          </a>
        </Reveal>
      </section>
      )}

      <footer className="bg-black border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5 md:px-6 py-10 md:py-20">
          {/* En el móvil, Explora y Contacto van en dos columnas (antes, todo
              apilado: el pie medía casi dos pantallas). */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 md:gap-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-flex items-center min-h-11">
                <span className="font-serif text-2xl font-bold tracking-wider text-primary">
                  TOUZA
                </span>
              </Link>
              <p className="mt-3 md:mt-4 text-white/60 text-sm font-light leading-relaxed max-w-xs">
                Un rincón donde las raíces gallegas se funden con el encanto
                mediterráneo. Cócteles artesanales en un ambiente único.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white/60 text-xs tracking-[0.2em] uppercase mb-3 md:mb-6">
                Explora
              </h4>
              <ul className="md:space-y-4">
                {footerLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-white/70 text-[15px] md:text-sm font-light hover:text-white active:text-white transition-colors duration-200 inline-flex items-center min-h-11 md:min-h-0 md:py-1.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact + Social */}
            <div>
              <h4 className="text-white/60 text-xs tracking-[0.2em] uppercase mb-3 md:mb-6">
                Contacto
              </h4>
              <div className="space-y-1.5 md:space-y-3 text-white/70 text-[15px] md:text-sm font-light mb-5 md:mb-8">
                <p className="leading-snug pt-2.5 md:pt-0">{NEGOCIO.calle}<br />{NEGOCIO.cp} {NEGOCIO.localidad}, {NEGOCIO.region}</p>
                {/* Con prefijo internacional, como en el resto de la web: sin él
                    falla al llamar desde un móvil con SIM extranjera. */}
                <a href={TELEFONO.href} className="flex min-h-11 items-center md:inline-block md:min-h-0 md:py-1 hover:text-white active:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{TELEFONO.texto}</a>
                <a href="mailto:info@touzabar.es" className="flex min-h-11 items-center md:block md:min-h-0 md:py-1 break-all hover:text-white active:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">info@touzabar.es</a>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/touzabar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-white/65 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Instagram"
                >
                  <Instagram className="w-[18px] h-[18px]" aria-hidden="true" />
                </a>
                <a
                  href="https://www.facebook.com/touzabar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-white/65 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Facebook"
                >
                  <Facebook className="w-[18px] h-[18px]" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-16 pt-5 md:pt-8 border-t border-white/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-xs text-white/50 font-light">
              <p>© {currentYear} Touza Cocktail Bar</p>
              <nav aria-label="Información legal">
                <ul className="flex flex-wrap items-center justify-center gap-x-1">
                  {legalLinks.map((link, i) => (
                    <li key={link.path} className="flex items-center">
                      {i > 0 && <span aria-hidden="true" className="text-white/25 px-1">·</span>}
                      <Link
                        to={link.path}
                        className="inline-flex min-h-[44px] md:min-h-0 items-center px-1 md:py-1 text-white/65 hover:text-white transition-colors duration-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
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
                  className="text-white/65 hover:text-white transition-colors duration-200"
                >
                  Restaurante Casa Tomás
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import { motion } from "framer-motion";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const footerLinks = [
  { name: "Carta", path: "/carta" },
  { name: "Galería", path: "/galeria" },
  { name: "El Reservado", path: "/reservado" },
  { name: "Contacto", path: "/contacto" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Pre-footer CTA */}
      <section className="bg-black py-16 md:py-24 text-center px-5 md:px-6">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: appleEase }}
          className="h-px bg-primary/40 max-w-xl mx-auto mb-10 md:mb-16"
        />
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: appleEase }}
          className="font-serif text-3xl md:text-6xl text-white mb-5 md:mb-6"
        >
          Reserva tu experiencia
        </motion.h3>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5, ease: appleEase }}
        >
          <Link
            to="/reservado"
            className="inline-block px-8 md:px-10 py-3.5 md:py-4 border border-white/20 rounded-full text-white/70 hover:text-white hover:border-white/40 active:scale-[0.97] transition-all duration-300 text-base md:text-lg font-light"
          >
            El Reservado
          </Link>
        </motion.div>
      </section>

      <footer className="bg-black border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5 md:px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            {/* Brand */}
            <div>
              <Link to="/" className="inline-block">
                <span className="font-serif text-2xl font-bold tracking-wider text-primary">
                  TOUZA
                </span>
              </Link>
              <p className="mt-3 md:mt-4 text-white/40 text-sm font-light leading-relaxed max-w-xs">
                Un rincón donde las raíces gallegas se funden con el encanto
                mediterráneo. Cócteles artesanales en un ambiente único.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white/50 text-xs tracking-[0.2em] uppercase mb-4 md:mb-6">
                Explora
              </h4>
              <ul className="space-y-3 md:space-y-4">
                {footerLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-white/40 text-sm font-light hover:text-white/70 active:text-white/90 transition-colors duration-200 py-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact + Social */}
            <div>
              <h4 className="text-white/50 text-xs tracking-[0.2em] uppercase mb-4 md:mb-6">
                Contacto
              </h4>
              <div className="space-y-2 md:space-y-3 text-white/40 text-sm font-light mb-6 md:mb-8">
                <p>C/ San Vicente, 14</p>
                <p>03330 Crevillente, Alicante</p>
                <a href="tel:966782000" className="block active:text-white/70">966 782 000</a>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/touzabar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white/60 active:bg-white/15 transition-all duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-[18px] h-[18px]" />
                </a>
                <a
                  href="https://www.facebook.com/touzabar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white/60 active:bg-white/15 transition-all duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="w-[18px] h-[18px]" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-white/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-xs text-white/25 font-light">
              <p>© {currentYear} Touza Cocktail Bar</p>
              <p>
                Parte de{" "}
                <a
                  href="https://restaurantecasatomascrevillente.es/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/35 hover:text-white/50 transition-colors duration-200"
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

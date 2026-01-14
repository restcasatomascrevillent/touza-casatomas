import { Link } from "react-router-dom";
import { Phone, MapPin, Clock, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal border-t border-border/30">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-serif text-3xl font-bold tracking-wider text-primary">
                TOUZA
              </span>
              <span className="block text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                Cocktail Bar
              </span>
            </Link>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              Un rincón donde las raíces gallegas se funden con el encanto
              mediterráneo. Cócteles artesanales en un ambiente único.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
              Explora
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Nuestra Carta", path: "/carta" },
                { name: "Galería", path: "/galeria" },
                { name: "El Reservado", path: "/reservado" },
                { name: "Contacto", path: "/contacto" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  C/ San Vicente, 14
                  <br />
                  03330 Crevillente, Alicante
                </span>
              </li>
              <li>
                <a
                  href="tel:+34966782000"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>966 782 000</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  Jue - Sáb: 20:00 - 02:00
                  <br />
                  Dom: 18:00 - 00:00
                </span>
              </li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-foreground mb-4">
              Síguenos
            </h4>
            <p className="text-muted-foreground text-sm mb-4">
              Descubre nuestras últimas creaciones y eventos especiales.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="mt-12 pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Touza Cocktail Bar. Todos los derechos reservados.</p>
            <p className="text-xs">
              Parte de{" "}
              <a
                href="https://restaurantecasatomascrevillente.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-gold-light transition-colors"
              >
                Restaurante Casa Tomás
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

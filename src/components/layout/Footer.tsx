import { Link } from "react-router-dom";
import { Phone, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { cn } from "@/lib/utils";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: "Nuestra Carta", path: "/carta" },
    { name: "Galería", path: "/galeria" },
    { name: "El Reservado", path: "/reservado" },
    { name: "Contacto", path: "/contacto" },
  ];

  return (
    <footer className="bg-charcoal border-t border-border/30">
      <div className="container-custom py-10 md:py-12 lg:py-16 px-5 md:px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
          {/* Logo y descripción */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-xl md:text-2xl font-bold tracking-wider text-primary transition-colors duration-200 group-hover:text-gold-light">
                TOUZA
              </span>
              <span className="block text-[9px] tracking-[0.25em] text-muted-foreground uppercase transition-colors duration-200 group-hover:text-primary/60">
                Cocktail Bar
              </span>
            </Link>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed max-w-xs">
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
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground text-sm link-underline-elegant transition-colors duration-200 hover:text-foreground"
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
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
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
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-11 h-11 rounded-full bg-secondary flex items-center justify-center",
                  "text-foreground/80 transition-all duration-200",
                  "hover:bg-primary hover:text-primary-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-charcoal"
                )}
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-11 h-11 rounded-full bg-secondary flex items-center justify-center",
                  "text-foreground/80 transition-all duration-200",
                  "hover:bg-primary hover:text-primary-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-charcoal"
                )}
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Separator and copyright */}
        <div className="mt-12 pt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Touza Cocktail Bar. Todos los derechos reservados.</p>
            <p className="text-xs">
              Parte de{" "}
              <a
                href="https://restaurantecasatomascrevillente.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-gold-light transition-colors duration-200"
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

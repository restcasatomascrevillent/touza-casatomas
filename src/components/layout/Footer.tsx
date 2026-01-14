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
    <footer className="bg-charcoal border-t border-border/30 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 pointer-events-none" />
      
      <div className="container-custom py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-3xl font-bold tracking-wider text-primary transition-all duration-300 group-hover:text-gold-light">
                TOUZA
              </span>
              <span className="block text-[10px] tracking-[0.3em] text-muted-foreground uppercase transition-colors duration-300 group-hover:text-primary/60">
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
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground text-sm link-underline-elegant transition-colors duration-300 hover:text-primary"
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
              <li className="flex items-start gap-3 text-sm text-muted-foreground group">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <span className="transition-colors duration-300 group-hover:text-foreground">
                  C/ San Vicente, 14
                  <br />
                  03330 Crevillente, Alicante
                </span>
              </li>
              <li>
                <a
                  href="tel:+34966782000"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors duration-300 group"
                >
                  <Phone className="w-4 h-4 text-primary flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span>966 782 000</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground group">
                <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <span className="transition-colors duration-300 group-hover:text-foreground">
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
                className={cn(
                  "w-11 h-11 rounded-full bg-secondary flex items-center justify-center",
                  "text-foreground transition-all duration-300",
                  "hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:-rotate-6",
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
                  "text-foreground transition-all duration-300",
                  "hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:rotate-6",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-charcoal"
                )}
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Línea divisoria animada y copyright */}
        <div className="mt-12 pt-8 border-t border-border/30 relative">
          {/* Animated gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Touza Cocktail Bar. Todos los derechos reservados.</p>
            <p className="text-xs">
              Parte de{" "}
              <a
                href="https://restaurantecasatomascrevillente.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-gold-light transition-colors duration-300 link-underline-elegant"
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

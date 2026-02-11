import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Calendar, Wine, Image, Phone, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Inicio", path: "/", icon: Home },
  { name: "Nuestra Carta", path: "/carta", icon: Wine },
  { name: "Galería", path: "/galeria", icon: Image },
  { name: "El Reservado", path: "/reservado", icon: Calendar },
  { name: "Contacto", path: "/contacto", icon: Phone },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/40 py-2 md:py-3"
          : "bg-gradient-to-b from-background/60 to-transparent py-4 md:py-5"
      )}
    >
      <div className="container-custom">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="relative z-10 group">
            <span className="font-serif text-xl md:text-2xl lg:text-3xl font-bold tracking-wider text-primary transition-colors duration-200 group-hover:text-gold-light">
              TOUZA
            </span>
            <span className="hidden sm:block text-[9px] tracking-[0.25em] uppercase text-muted-foreground mt-[-2px] transition-colors duration-200 group-hover:text-primary/70">
              Cocktail Bar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  {link.name}
                  <span
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 bottom-0 h-px bg-primary transition-all duration-200",
                      isActive ? "w-6" : "w-0"
                    )}
                  />
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-3 rounded-full transition-all duration-200 hover:bg-muted active:scale-95 touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Abrir menú"
                >
                  <Menu className="w-6 h-6 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[85vw] max-w-[320px] bg-background/98 backdrop-blur-2xl border-l border-border/30 p-0"
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-5 border-b border-border/20">
                    <Link to="/" onClick={() => setIsOpen(false)}>
                      <span className="font-serif text-xl font-bold tracking-wider text-primary">
                        TOUZA
                      </span>
                    </Link>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <ul className="space-y-1">
                      {navLinks.map((link, index) => {
                        const isActive = location.pathname === link.path;
                        const Icon = link.icon;
                        return (
                          <li
                            key={link.path}
                            style={{ animationDelay: `${index * 50}ms` }}
                            className="opacity-0 animate-fade-up"
                          >
                            <Link
                              to={link.path}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-4 py-4 px-4 rounded-xl text-lg font-medium transition-all duration-200 touch-target-lg tap-highlight",
                                isActive
                                  ? "text-primary bg-primary/10"
                                  : "text-foreground/80 hover:text-foreground hover:bg-muted/50 active:bg-muted"
                              )}
                            >
                              <Icon className={cn(
                                "w-5 h-5 flex-shrink-0",
                                isActive ? "text-primary" : "text-muted-foreground"
                              )} />
                              <span className="font-serif">{link.name}</span>
                              {isActive && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* CTA - Prominent */}
                  <div className="p-4 border-t border-border/20 safe-bottom bg-charcoal/50">
                    <Button
                      asChild
                      size="lg"
                      className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base rounded-xl shadow-lg shadow-primary/20"
                    >
                      <Link to="/reservado" onClick={() => setIsOpen(false)}>
                        <Calendar className="w-5 h-5 mr-3" />
                        Reservar ahora
                      </Link>
                    </Button>
                    <p className="text-center text-xs text-muted-foreground mt-3">
                      Espacio privado para eventos
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

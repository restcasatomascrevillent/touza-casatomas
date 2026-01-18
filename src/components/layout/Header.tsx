import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Inicio", path: "/" },
  { name: "Nuestra Carta", path: "/carta" },
  { name: "Galería", path: "/galeria" },
  { name: "El Reservado", path: "/reservado" },
  { name: "Contacto", path: "/contacto" },
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
          ? "bg-background/95 backdrop-blur-xl border-b border-border/40 py-3"
          : "bg-gradient-to-b from-background/60 to-transparent py-5"
      )}
    >
      <div className="container-custom">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="relative z-10 group">
            <span className="font-serif text-2xl md:text-3xl font-bold tracking-wider text-primary transition-colors duration-200 group-hover:text-gold-light">
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
                  className="p-3 rounded-full transition-colors duration-200 hover:bg-muted touch-target"
                  aria-label="Abrir menú"
                >
                  <Menu className="w-6 h-6 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-full sm:w-[380px] bg-background border-l border-border/40 p-0"
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border/30">
                    <Link to="/" onClick={() => setIsOpen(false)}>
                      <span className="font-serif text-2xl font-bold tracking-wider text-primary">
                        TOUZA
                      </span>
                    </Link>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex-1 px-6 py-8">
                    <ul className="space-y-2">
                      {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                          <li key={link.path}>
                            <Link
                              to={link.path}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center py-4 text-xl font-serif font-medium transition-colors duration-200 touch-target",
                                isActive
                                  ? "text-primary"
                                  : "text-foreground/80 hover:text-primary"
                              )}
                            >
                              {link.name}
                              {isActive && (
                                <span className="ml-3 w-2 h-2 rounded-full bg-primary" />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* CTA */}
                  <div className="p-6 border-t border-border/30 safe-bottom">
                    <Button
                      asChild
                      size="lg"
                      className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
                    >
                      <Link to="/reservado" onClick={() => setIsOpen(false)}>
                        <Calendar className="w-5 h-5 mr-2" />
                        Reservar
                      </Link>
                    </Button>
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

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Inicio", path: "/" },
  { name: "Carta", path: "/carta" },
  { name: "Galería", path: "/galeria" },
  { name: "El Reservado", path: "/reservado" },
  { name: "Contacto", path: "/contacto" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      
      setIsScrolled(currentY > 50);
      
      if (currentY > 100) {
        setIsHidden(currentY > lastScrollY.current);
      } else {
        setIsHidden(false);
      }
      
      lastScrollY.current = currentY;
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-black/80 backdrop-blur-2xl border-b border-white/5 py-3"
          : "bg-transparent py-5",
        isHidden ? "-translate-y-full" : "translate-y-0"
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="relative z-10" aria-label="Touza, ir al inicio">
            <span className="font-serif text-xl lg:text-2xl font-bold tracking-wider text-primary">
              TOUZA
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
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative px-5 py-2 text-[13px] font-light tracking-[0.1em] uppercase transition-colors duration-300",
                    isActive
                      ? "text-white"
                      : "text-white/65 hover:text-white"
                  )}
                >
                  {link.name}
                  <span
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 bottom-0 h-px bg-primary transition-all duration-300",
                      isActive ? "w-5" : "w-0"
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
                  className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Abrir menú"
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full max-w-[320px] bg-black border-l border-white/5 p-0"
              >
                <SheetTitle className="sr-only">Menú</SheetTitle>
                <SheetDescription className="sr-only">Secciones de la web de Touza</SheetDescription>
                <div className="flex flex-col h-full">
                  <div className="flex items-center p-6 border-b border-white/5">
                    <Link to="/" onClick={() => setIsOpen(false)}>
                      <span className="font-serif text-xl font-bold tracking-wider text-primary">
                        TOUZA
                      </span>
                    </Link>
                  </div>

                  <nav className="flex-1 px-4 py-8">
                    <ul className="space-y-1">
                      {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                          <li key={link.path}>
                            <Link
                              to={link.path}
                              aria-current={isActive ? "page" : undefined}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center py-4 px-4 text-lg font-light tracking-wide transition-colors duration-200",
                                isActive
                                  ? "text-white"
                                  : "text-white/60 hover:text-white"
                              )}
                            >
                              <span className="font-serif">{link.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  <div className="p-6 border-t border-white/5 safe-bottom">
                    <Button
                      asChild
                      size="lg"
                      className="w-full h-14 bg-white text-black hover:bg-white/90 font-medium text-base rounded-2xl"
                    >
                      <Link to="/reservado" onClick={() => setIsOpen(false)}>
                        <Calendar className="w-5 h-5 mr-3" />
                        Reservar ahora
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

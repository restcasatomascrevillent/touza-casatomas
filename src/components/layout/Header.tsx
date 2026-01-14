import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Inicio", path: "/" },
  { name: "Nuestra Carta", path: "/carta" },
  { name: "Galería", path: "/galeria" },
  { name: "El Reservado", path: "/reservado" },
  { name: "Contacto", path: "/contacto" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
      // Calculate scroll progress for subtle parallax effects
      setScrollProgress(Math.min(scrollY / 200, 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out",
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-primary/10 py-3"
          : "bg-gradient-to-b from-background/80 to-transparent py-6"
      )}
      style={{
        backdropFilter: isScrolled ? `blur(${12 + scrollProgress * 8}px)` : undefined,
      }}
    >
      <div className="container-custom">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="relative z-10 group"
          >
            <span 
              className={cn(
                "font-serif text-3xl md:text-4xl font-bold tracking-wider transition-all duration-500",
                isScrolled ? "text-primary" : "text-primary",
                "group-hover:text-gold-light"
              )}
              style={{
                transform: `translateY(${scrollProgress * -2}px)`,
              }}
            >
              TOUZA
            </span>
            <span className={cn(
              "block text-[10px] md:text-xs tracking-[0.3em] uppercase mt-[-2px] transition-all duration-500",
              "text-muted-foreground group-hover:text-primary/80"
            )}>
              Cocktail Bar
            </span>
            {/* Subtle glow on hover */}
            <div className="absolute -inset-4 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 rounded-full",
                    "hover:bg-primary/10",
                    isActive
                      ? "text-primary"
                      : "text-foreground/80 hover:text-primary"
                  )}
                >
                  {link.name}
                  {/* Active indicator */}
                  <span
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 bg-primary rounded-full transition-all duration-300",
                      isActive ? "w-6 opacity-100" : "w-0 opacity-0"
                    )}
                  />
                  {/* Hover glow */}
                  <span
                    className={cn(
                      "absolute inset-0 rounded-full opacity-0 transition-opacity duration-300",
                      "bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0",
                      "hover:opacity-100"
                    )}
                  />
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "lg:hidden relative z-10 p-3 rounded-full transition-all duration-300",
              "hover:bg-primary/10",
              isMobileMenuOpen && "bg-primary/10"
            )}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <div className="relative w-6 h-6">
              <X
                className={cn(
                  "absolute inset-0 w-6 h-6 transition-all duration-300 text-foreground",
                  isMobileMenuOpen
                    ? "opacity-100 rotate-0"
                    : "opacity-0 rotate-90"
                )}
              />
              <Menu
                className={cn(
                  "absolute inset-0 w-6 h-6 transition-all duration-300 text-foreground",
                  isMobileMenuOpen
                    ? "opacity-0 -rotate-90"
                    : "opacity-100 rotate-0"
                )}
              />
            </div>
          </button>
        </nav>

        {/* Mobile Navigation - Curtain Effect */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 z-[-1] transition-all duration-700 ease-out",
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          )}
        >
          {/* Background with gradient */}
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-b from-background via-background to-charcoal transition-transform duration-700",
              isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
            )}
          />
          
          {/* Navigation Links */}
          <div className="relative h-full flex flex-col items-center justify-center pt-20">
            <div className="flex flex-col items-center space-y-6">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "relative font-serif text-4xl sm:text-5xl font-semibold tracking-wide transition-all duration-500",
                      "opacity-0",
                      isMobileMenuOpen && "animate-slide-up",
                      isActive
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    )}
                    style={{
                      animationDelay: isMobileMenuOpen ? `${150 + index * 75}ms` : "0ms",
                      animationFillMode: "forwards",
                    }}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Decorative elements */}
            <div 
              className={cn(
                "absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-0 transition-all duration-700",
                isMobileMenuOpen && "opacity-100"
              )}
              style={{ transitionDelay: "600ms" }}
            >
              <div className="w-px h-12 bg-gradient-to-b from-primary/50 to-transparent" />
              <span className="text-primary/50 text-xs tracking-[0.3em] mt-4">TOUZA</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MobileReserveCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const location = useLocation();

  // Don't show on reservado page (already has CTA)
  const hideOnPaths = ["/reservado", "/contacto"];
  const shouldHide = hideOnPaths.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show after scrolling past hero (300px)
      setIsVisible(scrollY > 300);
      
      // Hide when near footer (last 200px)
      setIsNearFooter(scrollY + windowHeight > documentHeight - 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (shouldHide) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "bg-background/95 backdrop-blur-xl border-t border-border/40",
        "transition-all duration-300 ease-out safe-bottom",
        isVisible && !isNearFooter
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="container-custom py-4">
        <Button
          asChild
          size="lg"
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
        >
          <Link to="/reservado">
            <Calendar className="w-5 h-5 mr-2" />
            Reservar El Reservado
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default MobileReserveCTA;

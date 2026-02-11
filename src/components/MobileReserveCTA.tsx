import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MobileReserveCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const location = useLocation();

  const hideOnPaths = ["/reservado", "/contacto"];
  const shouldHide = hideOnPaths.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      setIsVisible(scrollY > 250);
      setIsNearFooter(scrollY + windowHeight > documentHeight - 250);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (shouldHide) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "bg-black/90 backdrop-blur-2xl border-t border-white/5",
        "transition-all duration-300 safe-bottom",
        isVisible && !isNearFooter
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)" }}
    >
      <div className="px-4 py-3">
        <Button
          asChild
          size="lg"
          className="w-full h-14 bg-white text-black hover:bg-white/90 font-medium text-base rounded-2xl"
        >
          <Link to="/reservado" className="flex items-center justify-center gap-3">
            <Calendar className="w-5 h-5" />
            <span>Reservar El Reservado</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default MobileReserveCTA;

import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Seo from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Seo
        title="Página no encontrada"
        description="La página que buscas no existe."
        keywords={[]}
      />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md space-y-6">
          <span className="inline-block text-primary text-sm tracking-[0.3em] uppercase opacity-80">
            Error 404
          </span>
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-foreground">
            Touza
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto opacity-50" />
          <h2 className="text-2xl font-serif text-foreground/90">
            Página no encontrada
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <div className="pt-4">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;

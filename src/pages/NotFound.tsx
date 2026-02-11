import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center">
        <h1
          className="font-sans text-[8rem] md:text-[12rem] font-extralight text-white/10 leading-none mb-4"
        >
          404
        </h1>
        <h2 className="font-serif text-2xl md:text-3xl text-white/80 mb-4">
          Página no encontrada
        </h2>
        <p className="text-white/30 font-light max-w-sm mb-10 leading-relaxed">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Button
          asChild
          size="lg"
          className="h-14 px-10 bg-white text-black hover:bg-white/90 font-medium rounded-full"
        >
          <Link to="/">Volver al Inicio</Link>
        </Button>
      </div>
    </>
  );
};

export default NotFound;

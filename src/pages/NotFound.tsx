import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";

// Salidas útiles desde el 404: antes solo había "Volver al inicio" y ni
// siquiera cabecera, así que quien llegaba de un enlace roto a la carta o al
// horario tenía que empezar desde la portada.
const salidas = [
  { to: "/carta", texto: "Ver la carta" },
  { to: "/galeria", texto: "Galería" },
  { to: "/contacto", texto: "Contacto y horario" },
];

const NotFound = () => {
  // Sin console.error: en producción cada 404 (bots incluidos) ensuciaba la
  // consola como si fuera un fallo de la web. Vercel ya registra los 404.
  return (
    <Layout>
      <Seo
        title="Página no encontrada"
        description="La página que buscas no existe."
        keywords={[]}
        noindex={true}
      />
      <section className="flex min-h-[80vh] flex-col items-center justify-center bg-black px-6 pt-32 pb-20 text-center">
        {/* Entrada con la animación CSS de los heroes (.entrada-hero) y no con
            el `initial` de framer: este contenido va en 404.html y con
            opacity:0 en línea no se veía nada hasta que hidrataba React. */}
        <p
          style={{ animationDelay: "0s" }}
          className="entrada-hero font-serif text-[8rem] md:text-[12rem] font-light text-primary/25 leading-none mb-2 select-none"
          aria-hidden="true"
        >
          404
        </p>
        <h1
          style={{ animationDelay: "0.2s" }}
          className="entrada-hero font-serif text-3xl md:text-5xl text-white mb-4"
        >
          Página no encontrada
        </h1>
        <p
          style={{ animationDelay: "0.4s" }}
          className="entrada-hero text-white/65 font-light max-w-sm mb-10 leading-relaxed"
        >
          Lo sentimos, la página que buscas no existe o ha cambiado de sitio.
        </p>
        <div
          style={{ animationDelay: "0.6s" }}
          className="entrada-hero flex flex-col items-center gap-6"
        >
          <Button
            asChild
            size="lg"
            className="h-14 px-10 bg-white text-black hover:bg-white/90 font-medium rounded-full"
          >
            <Link to="/">Volver al inicio</Link>
          </Button>
          <nav aria-label="Otras secciones">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {salidas.map((s) => (
                <li key={s.to}>
                  <Link
                    to={s.to}
                    className="inline-flex min-h-11 items-center text-white/70 hover:text-primary underline-offset-4 hover:underline transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {s.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;

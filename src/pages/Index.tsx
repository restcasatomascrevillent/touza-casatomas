import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import VisitUs from "@/components/VisitUs";
import Hero from "@/components/home/Hero";
import Showcase from "@/components/home/Showcase";
import CoctelesDeLaCarta from "@/components/home/CoctelesDeLaCarta";
import ElLocal from "@/components/home/ElLocal";
import FranjaClips from "@/components/home/FranjaClips";
import { IMAGENES } from "@/assets/imagenes";
import { canonical } from "@/lib/site";
import { barSchema } from "@/lib/negocio";

/**
 * Portada en 5 bloques (rediseño del 15/11/2026, auditoría visual):
 *
 * 1. Hero a pantalla completa con el bucle de vídeo vertical, TOUZA enorme,
 *    la línea de hechos y «Cómo llegar».
 * 2. Cócteles: la vitrina de la «T» y el carrusel de la carta.
 * 3. El local: el salón a sangre, dos líneas y «Más sobre Touza» plegado.
 * 4. Franja de clips (solo si hay vídeos).
 * 5. Visítanos (horario y «Cómo llegar»), y el pie mínimo.
 *
 * Se quitaron «Filosofía», «De la coctelera a la copa» y «Lo que nos define»:
 * eslóganes, datos repetidos y numeraciones que no eran secuencias. Todo el
 * texto útil para buscadores sigue en el HTML (el de «coctelería y bar de
 * copas en Crevillente», dentro del desplegable de «El local»).
 *
 * Un solo árbol responsive: cada sección decide su composición con clases
 * `md:`/`lg:` desde el primer pintado. Lo que depende del JS (vídeo,
 * apariciones) es una mejora y nunca esconde contenido en el HTML del SSG.
 */
const Index = () => {
  return (
    <Layout>
      <Seo
        title="Coctelería y bar de copas en Crevillent · Touza"
        description="Coctelería y bar de copas en Crevillent, junto a Casa Tomás: cócteles de autor, champagne, cava y whisky. Sin reservas: ven directamente."
        canonical={canonical("/")}
        keywords={["coctelería crevillent", "bar de copas crevillent", "coctelería crevillente", "cócteles de autor", "copas después de cenar", "cocktail bar"]}
        schema={barSchema()}
      />

      <Hero />

      <Showcase
        id="cocteles-titulo"
        antetitulo="La carta"
        titulo={["Cócteles", "de autor"]}
        texto="Recetas de la casa y clásicos bien hechos, también sin alcohol. Para acompañar, champagne, cava y whisky."
        foto={{ imagen: IMAGENES.coctelLogo, alt: "Cóctel rojo en copa coupé con arándanos, delante de la T iluminada de Touza" }}
        detalle={{ imagen: IMAGENES.barra, alt: "Bartender de Touza colando un cóctel sobre hielo en vaso bajo" }}
        cta={{ texto: "Ver la carta", ruta: "/carta" }}
      >
        <CoctelesDeLaCarta />
      </Showcase>

      <ElLocal />
      <FranjaClips />
      <VisitUs />
    </Layout>
  );
};

export default Index;

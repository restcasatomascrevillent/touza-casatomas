import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import ScrollTextReveal from "@/components/ScrollTextReveal";
import VisitUs from "@/components/VisitUs";
import Hero from "@/components/home/Hero";
import Showcase from "@/components/home/Showcase";
import Claves from "@/components/home/Claves";
import { IMAGENES } from "@/assets/imagenes";
import { canonical } from "@/lib/site";
import { barSchema } from "@/lib/negocio";

/**
 * Portada en UN solo árbol responsive.
 *
 * Antes había dos composiciones (IndexDesktop / IndexMobile) y el HTML del SSG
 * llevaba las dos, una oculta con CSS: dos <h1>, el doble de HTML y contenido
 * que divergía entre versiones ("El Privado" en móvil, cifras distintas).
 * Ahora cada sección decide su composición con clases `md:`/`lg:` desde el
 * primer pintado, sin `useIsMobile` y sin salto al hidratar. Lo que depende
 * del JS (parallax, revelado del texto, apariciones) es solo una mejora y
 * nunca esconde contenido en el HTML.
 */
const Index = () => {
  return (
    <Layout>
      <Seo
        title="Touza - Cocktail Bar Premium en Crevillente"
        description="Touza es un cocktail bar premium en Crevillente. Disfruta de cócteles artesanales, ambiente único y nuestro espacio privado El Reservado."
        canonical={canonical("/")}
        keywords={["cocktail bar", "crevillente", "cócteles", "premium", "reservado", "eventos"]}
        schema={barSchema()}
      />

      <Hero />

      {/* Filosofía */}
      <section className="px-5 pt-14 pb-10 md:px-6 md:pt-32 md:pb-20 lg:pt-40 lg:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal
            as="span"
            className="block text-primary text-[11px] md:text-xs tracking-[0.3em] uppercase font-medium mb-4 md:mb-10"
          >
            Filosofía
          </Reveal>
          <ScrollTextReveal className="font-serif text-[1.45rem] min-[400px]:text-[1.6rem] leading-snug md:text-5xl lg:text-6xl md:leading-tight text-foreground justify-center">
            Touza no es solo un bar; es una declaración de intenciones. Un espacio donde el tiempo se detiene y los detalles cobran vida.
          </ScrollTextReveal>
        </div>
      </section>

      <Showcase
        indice="01"
        label="Descubre"
        title="Cócteles de autor"
        description="Cada copa que servimos cuenta una historia. Ingredientes seleccionados, técnicas de vanguardia y una presentación que desafía lo convencional."
        foto={{ imagen: IMAGENES.barra, alt: "Bartender de Touza colando un cóctel sobre hielo en vaso bajo" }}
        detalle={{ imagen: IMAGENES.reservado, alt: "Mojito recién servido en la barra, con pajita de Touza" }}
        ctaText="Ver la carta"
        ctaLink="/carta"
      />

      <Showcase
        indice="02"
        label="Espacio exclusivo"
        title="El Reservado"
        description="Un espacio exclusivo diseñado para la intimidad. Perfecto para celebraciones especiales o simplemente para desconectar del mundo exterior."
        foto={{ imagen: IMAGENES.mesaPrivada, alt: "Botellas de champagne y una copa servida sobre una mesa de mármol" }}
        detalle={{ imagen: IMAGENES.decoracion, alt: "Botellas de aperitivo y ron en la barra de Touza" }}
        ctaText="Solicitar El Reservado"
        ctaLink="/reservado"
        invertido
      />

      <Claves />

      <VisitUs />
    </Layout>
  );
};

export default Index;

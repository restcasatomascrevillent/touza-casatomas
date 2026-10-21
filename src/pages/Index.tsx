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
import { NEGOCIO, barSchema } from "@/lib/negocio";

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
        title="Touza Cocktail Bar · Copas y cócteles en Crevillente"
        description="Coctelería y bar de copas en Crevillent, junto a Casa Tomás: cócteles de autor, champagne, vinos y whisky. Sin reservas: ven directamente."
        canonical={canonical("/")}
        keywords={["cocktail bar", "coctelería crevillente", "bar de copas crevillente", "cócteles", "cócteles de autor", "copas"]}
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
        detalle={{ imagen: IMAGENES.mojito, alt: "Mojito recién servido en la barra, con pajita de Touza" }}
        ctaText="Ver la carta"
        ctaLink="/carta"
      />

      {/* Hasta el 01/10/2026 esta vitrina era "El Reservado". Touza ya no
          acepta reservas por la web y no hay fotos de esa sala: ahora habla
          del local con lo que enseñan las fotos (mármol, champagne, la barra)
          y lo que ya está en la carta, y lleva a la galería. */}
      <Showcase
        indice="02"
        label="El local"
        title="Un sitio para quedarse"
        description="Sofá corrido, mesas de mármol y la barra a la vista: un sitio para pedir otra ronda sin mirar el reloj. Y si hoy no te apetece un cóctel, en la carta también hay champagne, vino y whisky."
        foto={{ imagen: IMAGENES.champanMesa, alt: "Botellas de champagne y una copa servida sobre una mesa de mármol de Touza" }}
        detalle={{ imagen: IMAGENES.botellas, alt: "Botellas de aperitivo y ron en la barra de Touza" }}
        ctaText="Ver la galería"
        ctaLink="/galeria"
        invertido
      />

      {/* Texto con intención local (bar de copas, coctelería, Crevillente,
          junto a Casa Tomás, sin reservas). Sin horarios, precios ni eventos:
          solo lo que ya está confirmado en la web. */}
      <section aria-labelledby="bar-copas-titulo" className="px-5 pt-12 pb-10 md:px-6 md:pt-24 md:pb-16">
        <div className="max-w-3xl mx-auto">
          <Reveal as="span" className="block text-primary text-[11px] md:text-xs tracking-[0.3em] uppercase font-medium mb-3 md:mb-5">
            Crevillente
          </Reveal>
          <h2 id="bar-copas-titulo" className="font-serif text-3xl md:text-5xl text-foreground leading-[1.05] mb-6 md:mb-10">
            Coctelería y bar de copas en Crevillente
          </h2>
          <div className="space-y-5 text-white/70 text-base md:text-lg font-light leading-relaxed">
            <p>
              Touza es una coctelería y bar de copas en el centro de Crevillente (Crevillent), en la{" "}
              {NEGOCIO.calle}, justo al lado del Restaurante Casa Tomás, del que forma parte. Es el sitio para
              tomar algo antes o después de cenar, quedar con amigos o alargar la noche con una buena copa.
            </p>
            <p>
              La carta gira en torno a los cócteles: de autor, con recetas propias de la casa, y clásicos bien
              hechos. También hay cócteles sin alcohol, una selección amplia de champagne y vinos, cervezas y
              whiskies. Detrás de la barra hay cinco años de experiencia preparando copas, con ingredientes
              seleccionados y una presentación cuidada.
            </p>
            <p>
              En Touza no se reserva: ven directamente, con tu pareja, con amigos o después de cenar en Casa
              Tomás. Si es tu primera vez, déjate aconsejar y empieza por un cóctel de autor; si prefieres algo
              más clásico, en la carta encontrarás champagne, vino y whisky para acompañar la noche.
            </p>
          </div>
        </div>
      </section>

      <Claves />

      <VisitUs />
    </Layout>
  );
};

export default Index;

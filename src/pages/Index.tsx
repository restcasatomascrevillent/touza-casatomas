import { useMemo } from "react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import VisitUs from "@/components/VisitUs";
import Hero from "@/components/home/Hero";
import CoctelesDeLaCarta from "@/components/home/CoctelesDeLaCarta";
import ElLocal from "@/components/home/ElLocal";
import { canonical } from "@/lib/site";
import { barSchema, sinDuplicados } from "@/lib/negocio";
import { descripcionPortada } from "@/lib/carta";
import { useCocteles } from "@/hooks/useCocteles";

/**
 * Portada sencilla, con la carta primero (16/11/2026: al dueño no le gustó
 * la demo del rediseño y pidió el hero de antes y una web fácil de usar).
 *
 * 1. Hero: la foto del salón a pantalla completa, TOUZA y dos botones.
 * 2. La carta: ocho cócteles con foto, nombre y precio, y «Ver la carta
 *    completa».
 * 3. El local: tres fotos, un clip de la trasbarra y dos líneas, con «Más
 *    sobre Touza» plegado.
 * 4. Visítanos: horario, dirección y «Cómo llegar».
 *
 * Fuera el vídeo del hero, la vitrina con la foto del camarero y la franja de
 * clips «En la barra». En la web no sale gente.
 *
 * Todo el texto útil para buscadores sigue en el HTML (el de «coctelería y
 * bar de copas en Crevillente», dentro del desplegable de «El local»). Un
 * solo árbol responsive: cada sección decide su composición con clases
 * `md:`/`lg:` desde el primer pintado, y nada depende del JS para verse.
 */
const Index = () => {
  // El rango de precios de la descripción sale de la carta (misma consulta que
  // «La carta», con la instantánea del build: va en el HTML del SSG).
  const { data: cocteles } = useCocteles();
  const descripcion = useMemo(() => descripcionPortada(sinDuplicados(cocteles ?? [])), [cocteles]);

  return (
    <Layout>
      <Seo
        title="Coctelería y bar de copas en Crevillent · Touza"
        description={descripcion}
        canonical={canonical("/")}
        keywords={["coctelería crevillent", "bar de copas crevillent", "coctelería crevillente", "cócteles de autor", "copas después de cenar", "cocktail bar"]}
        schema={barSchema()}
      />

      <Hero />
      <CoctelesDeLaCarta />
      <ElLocal />
      <VisitUs />
    </Layout>
  );
};

export default Index;

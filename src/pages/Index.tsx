import { useMemo } from "react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import VisitUs from "@/components/VisitUs";
import Hero from "@/components/home/Hero";
import TresPuertas from "@/components/home/TresPuertas";
import DeLaCasa from "@/components/home/DeLaCasa";
import SobreTouza from "@/components/home/SobreTouza";
import { canonical } from "@/lib/site";
import { barSchema, sinDuplicados } from "@/lib/negocio";
import { descripcionPortada } from "@/lib/carta";
import { useCocteles } from "@/hooks/useCocteles";

/**
 * Portada «Tres puertas» (rediseño A, 21/11/2026). Lo importante es la carta:
 *
 * 1. Hero: la foto del salón a pantalla completa, TOUZA y dos botones (no se
 *    toca: regla del dueño, 16/11/2026).
 * 2. Tres puertas, montadas un poco sobre el hero: Cócteles, Champagne y
 *    Destilados, cada una a su pestaña de /carta con un dato de la carta.
 * 3. «De la casa»: tira de ocho cócteles con foto, nombre y precio.
 * 4. Visítanos: horario, dirección y «Cómo llegar».
 * 5. Sobre Touza: el texto para buscadores, discreto y plegado.
 *
 * Fuera «El local» (fotos del sitio y clip) y la rejilla de cócteles: las
 * puertas y la tira ya enseñan el local y la carta. En la web no sale gente.
 * Un solo árbol responsive; nada depende del JS para verse.
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
      <TresPuertas />
      <DeLaCasa />
      <VisitUs />
      <SobreTouza />
    </Layout>
  );
};

export default Index;

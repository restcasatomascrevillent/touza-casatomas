import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import IndexDesktop from "@/components/home/IndexDesktop";
import IndexMobile from "@/components/home/IndexMobile";
import Seo from "@/components/Seo";
import { canonical } from "@/lib/site";
import { barSchema } from "@/lib/negocio";

/**
 * La portada tiene dos composiciones (móvil y escritorio) y la elección
 * depende del ancho, que solo se conoce en el navegador. Antes el SSG
 * prerenderizaba SIEMPRE la de escritorio (`useIsMobile()` es `false` en Node)
 * y en un móvil se veía primero el hero de escritorio — "TOUZA" a 160 px,
 * cortado— hasta que React hidrataba y lo sustituía entero por el móvil: un
 * salto de maquetación completo en la primera pantalla de cada visita móvil.
 *
 * Ahora el HTML estático lleva las dos, y es el CSS (`md:`) quien enseña la
 * que toca desde el primer pintado, sin JS. Tras montar se desmonta la que no
 * se ve. La estructura de envoltorios no cambia entre un render y otro, así
 * que la composición visible no se vuelve a montar (ni repite animaciones).
 * Las imágenes de la composición oculta no se descargan: o son `lazy` dentro
 * de un `display:none`, o (el hero) usan exactamente el mismo srcset.
 */
const Index = () => {
  const isMobile = useIsMobile();
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  return (
    <>
      {/* Un solo <Seo>: con uno en cada composición el JSON-LD salía dos veces. */}
      <Seo
        title="Touza - Cocktail Bar Premium en Crevillente"
        description="Touza es un cocktail bar premium en Crevillente. Disfruta de cócteles artesanales, ambiente único y nuestro espacio privado El Reservado."
        canonical={canonical("/")}
        keywords={["cocktail bar", "crevillente", "cócteles", "premium", "reservado", "eventos"]}
        schema={barSchema()}
      />
      <div className={montado ? undefined : "md:hidden"}>
        {(!montado || isMobile) && <IndexMobile />}
      </div>
      <div className={montado ? undefined : "hidden md:block"}>
        {(!montado || !isMobile) && <IndexDesktop />}
      </div>
    </>
  );
};

export default Index;

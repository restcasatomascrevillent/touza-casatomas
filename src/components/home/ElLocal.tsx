import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { IMAGENES, type ImagenResponsive } from "@/assets/imagenes";
import { NEGOCIO } from "@/lib/negocio";
import FotoPortada from "./FotoPortada";
import { LOCALIDAD } from "./hechos";
import VideoAmbiente from "./VideoAmbiente";
import { CLIP_EL_LOCAL, MEDIA_CLIP_HORIZONTAL, POSTER_HORIZONTAL, POSTER_VERTICAL, hayVideo } from "./medios";

/**
 * «El local»: tres fotos nítidas del local, sin gente ni teles, y dos líneas.
 * Son las que pasó el dueño (móvil, 15/11/2026), en color natural: solo
 * recorte y reducción (ver `IMAGENES` y scripts/generar-imagenes.mjs).
 *
 * - Móvil: el salón a lo ancho (4:3) y debajo el botellero y la «T», en dos
 *   columnas (3:4).
 * - Desde md: las tres en una fila de la misma altura. Los anchos de columna
 *   (16 : 9 : 9) son las proporciones de las fotos (4:3 y 3:4), así que no se
 *   recorta nada.
 *
 * Debajo, UN clip: la trasbarra, de los originales en 4K (ver `medios.ts`).
 * El vertical en el móvil (marco 4:5) y el horizontal desde md (16:9, junto al
 * texto, a 7 de 12 columnas para que sus 1920 px den 2 px por píxel CSS). En
 * el HTML solo va el póster, diferido; el vídeo se crea al acercarse, se para
 * al salir de pantalla y tiene botón de pausa (`VideoAmbiente`). Los clips de
 * antes (406×720) se veían mal y se quitaron el 16/11/2026. Sin el fichero,
 * el texto ocupa todo el ancho.
 *
 * El texto largo de «coctelería y bar de copas en Crevillente», que es lo que
 * lee Google, sigue en el HTML dentro de un <details> nativo cerrado («Más
 * sobre Touza»): se indexa igual y no es un muro de texto en el móvil.
 */
const fotos: { imagen: ImagenResponsive; alt: string; sizes: string; className: string }[] = [
  {
    imagen: IMAGENES.salonNoche,
    alt: "El salón de Touza de noche: banco corrido color mostaza, sillones azules, mesas de mármol y aros de luz en el techo",
    sizes: "(min-width: 768px) 47vw, 100vw",
    className: "col-span-2 aspect-[4/3] md:col-span-1",
  },
  {
    imagen: IMAGENES.botellero,
    alt: "El botellero de Touza iluminado en dorado, con whiskies, tequilas y copas",
    sizes: "(min-width: 768px) 27vw, 50vw",
    className: "aspect-[3/4]",
  },
  {
    imagen: IMAGENES.letrero,
    alt: "La T de Touza retroiluminada sobre la pared trenzada del local",
    sizes: "(min-width: 768px) 27vw, 50vw",
    className: "aspect-[3/4]",
  },
];

const conClip = hayVideo(CLIP_EL_LOCAL.vertical);

const ElLocal = () => (
  <section aria-labelledby="el-local-titulo" className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28 lg:px-10">
    <div className="max-w-4xl">
      <h2 id="el-local-titulo" className="antetitulo mb-5 md:mb-8">
        El local
      </h2>
      <p className="text-balance font-serif text-[2rem] font-medium leading-[1.12] text-cream md:text-5xl md:leading-[1.08]">
        Sofá corrido, mármol y la barra a la vista, en la puerta de al lado de Casa Tomás.
      </p>
      {/* Estaba en el hero, bajo TOUZA (17/11/2026: el hero, sin texto). */}
      <p className="mt-4 text-base leading-relaxed text-white/70 md:mt-6 md:text-[17px]">
        Coctelería y bar de copas en {LOCALIDAD}, junto a Casa Tomás.
      </p>
    </div>

    <ul className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-[16fr_9fr_9fr] md:gap-5">
      {fotos.map((foto) => (
        <li key={foto.alt} className={`fondo-foto overflow-hidden rounded-2xl ${foto.className}`}>
          <FotoPortada imagen={foto.imagen} alt={foto.alt} sizes={foto.sizes} />
        </li>
      ))}
    </ul>

    <div className={conClip ? "mt-3 md:mt-5 md:grid md:grid-cols-12 md:items-start md:gap-x-5 lg:gap-x-12" : undefined}>
      {conClip && (
        <div className="fondo-foto relative aspect-[4/5] overflow-hidden rounded-2xl md:col-span-7 md:aspect-video">
          <VideoAmbiente
            clip={CLIP_EL_LOCAL.vertical}
            medidas={POSTER_VERTICAL}
            alternativo={
              hayVideo(CLIP_EL_LOCAL.horizontal)
                ? { clip: CLIP_EL_LOCAL.horizontal, media: MEDIA_CLIP_HORIZONTAL, medidas: POSTER_HORIZONTAL }
                : undefined
            }
            alt="La trasbarra de Touza: ginebras y licores en la estantería dorada, bajo la tira de luz"
            etiquetaPausa="Pausar el vídeo de la trasbarra"
            botonClassName="bottom-3 right-3 md:bottom-4 md:right-4"
          />
        </div>
      )}

      <div className={conClip ? "md:col-span-5" : undefined}>
        <p className="mt-8 text-base leading-relaxed text-white/75 md:mt-2 md:text-[17px]">
          ¿Cenas en Casa Tomás? La copa, aquí al lado:{" "}
          <Link
            to="/despues-de-cenar"
            className="rounded-sm text-white underline decoration-primary/60 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            copas después de cenar
          </Link>
          .
        </p>

        <details className="desplegable group mt-8 max-w-3xl border-t border-white/15">
          <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-6 py-4 text-base font-medium text-white/85 transition-colors hover:text-white md:text-lg">
            Más sobre Touza
            <Plus className="icono-mas h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          </summary>
          <div className="space-y-5 pb-4 pt-2 text-base leading-relaxed text-white/75 md:text-[17px]">
            <h3 className="font-serif text-2xl font-medium tracking-normal text-cream md:text-3xl">
              Coctelería y bar de copas en Crevillente
            </h3>
            <p>
              Touza es una coctelería y bar de copas en el centro de Crevillente (Crevillent), en la {NEGOCIO.calle},
              justo al lado del Restaurante Casa Tomás, del que forma parte. Es el sitio para tomar algo antes o
              después de cenar, quedar con amigos o alargar la noche con una buena copa.
            </p>
            <p>
              La carta gira en torno a los cócteles: de autor, con recetas propias de la casa, y clásicos bien hechos.
              También hay cócteles sin alcohol, una selección amplia de champagne y cava, cervezas y whiskies. Detrás
              de la barra hay cinco años de experiencia preparando copas, con ingredientes seleccionados y una
              presentación cuidada.
            </p>
            <p>
              En Touza no se reserva: ven directamente, con tu pareja, con amigos o después de cenar en Casa Tomás. Si
              es tu primera vez, déjate aconsejar y empieza por un cóctel de autor; si prefieres algo más clásico, en
              la carta encontrarás champagne, cava y whisky para acompañar la noche.
            </p>
          </div>
        </details>
      </div>
    </div>
  </section>
);

export default ElLocal;

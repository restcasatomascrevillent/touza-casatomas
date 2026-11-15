import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, MapPin, Clock, Mail, Instagram, Facebook, ExternalLink, Navigation } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import { canonical } from "@/lib/site";
import { guardarConsentimiento, useConsentimiento } from "@/lib/consentimiento";
import Reveal from "@/components/Reveal";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { IMAGENES } from "@/assets/imagenes";
import { DIRECCION_MAPS, HORARIO, NEGOCIO, TELEFONO, URL_COMO_LLEGAR, barSchema } from "@/lib/negocio";

const URL_MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DIRECCION_MAPS)}`;
// Embed clásico por dirección.
const URL_MAPA_EMBEBIDO = `https://maps.google.com/maps?q=${encodeURIComponent(DIRECCION_MAPS)}&z=17&hl=es&output=embed`;
const MAILTO = `mailto:${NEGOCIO.email}`;

const contactInfo = [
  { icon: MapPin, title: "Dirección", content: `${NEGOCIO.calle}\n${NEGOCIO.cp} ${NEGOCIO.localidad}, ${NEGOCIO.region}`, link: URL_MAPS },
  { icon: Phone, title: "Teléfono", content: TELEFONO.texto, link: TELEFONO.href },
  { icon: Clock, title: "Horario", content: HORARIO.map((h) => `${h.dias}: ${h.horas}`).join("\n"), link: null },
  { icon: Mail, title: "Email", content: NEGOCIO.email, link: MAILTO },
];

/**
 * Mapa de /contacto.
 *
 * Por defecto, una imagen estática alojada en la web (`public/mapa-touza.webp`):
 * sin cookies, sin peticiones a Google y visible desde el HTML del SSG. Es un
 * recorte del centro de Crevillent (teselas de OpenStreetMap, zoom 17,
 * descargadas una vez el 15/11/2026 y pasadas a tonos oscuros) de 800×600,
 * centrado en las coordenadas de `NEGOCIO`: el pin dorado va en el centro y
 * la foto se pinta a tamaño real (`object-none`), así que nunca se mueve.
 * La atribución «© OpenStreetMap» tiene que verse siempre (licencia ODbL).
 *
 * El mapa interactivo de Google pone cookies de terceros. Ya no hay aviso de
 * cookies en la web: el permiso se pide aquí, en el propio hueco del mapa, solo
 * cuando el visitante pulsa «Ver mapa interactivo de Google» (si ya lo había
 * aceptado, se carga directamente). La elección se puede cambiar en /cookies.
 */
const BOTON_MAPA =
  "inline-flex min-h-11 items-center gap-2 rounded-full bg-black/80 px-4 text-sm text-white/90 ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const MapaTouza = () => {
  const consentimiento = useConsentimiento();
  const [pedido, setPedido] = useState(false);
  const permitir = useRef<HTMLButtonElement>(null);
  const preguntando = pedido && consentimiento !== "accepted";

  // Al abrirse la pregunta, el foco pasa a ella (el botón pulsado desaparece).
  useEffect(() => {
    if (preguntando) permitir.current?.focus();
  }, [preguntando]);

  if (pedido && consentimiento === "accepted") {
    return (
      <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
        <iframe
          src={URL_MAPA_EMBEBIDO}
          width="100%"
          height="350"
          className="block h-[22rem] lg:h-[32.5rem]"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación Touza"
          // allow-popups: sin él, "Ampliar el mapa" de Google no abría nada.
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    );
  }

  return (
    <figure className="relative h-[22rem] overflow-hidden rounded-2xl bg-[#121110] ring-1 ring-white/10 lg:h-[32.5rem]">
      <img
        src="/mapa-touza.webp"
        alt={`Mapa del centro de Crevillent con Touza marcada en la ${NEGOCIO.calle}`}
        width={800}
        height={600}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-none object-center"
      />
      {/* Viñeteado: lleva la vista al pin y apaga los bordes. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,10,10,0.75)_100%)]"
      />
      {/* Pin dorado: la punta cae justo en el centro de la imagen. */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <svg width="34" height="44" viewBox="0 0 34 44" className="drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)]">
          <path
            d="M17 43C17 43 32 27.5 32 16.5C32 8 25.3 1.5 17 1.5C8.7 1.5 2 8 2 16.5C2 27.5 17 43 17 43Z"
            fill="#D8B47E"
            stroke="#0A0A0A"
            strokeWidth="1.5"
          />
          <circle cx="17" cy="16.5" r="5.5" fill="#0A0A0A" />
        </svg>
      </div>
      {/* Rótulo encima del pin (el pin mide 44 px). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(100%+3.5rem)] whitespace-nowrap rounded-md bg-black/80 px-3 py-1.5 text-center ring-1 ring-[#D8B47E]/40"
      >
        <p className="font-serif text-lg leading-none text-[#F3EEE4]">Touza</p>
        <p className="mt-1 text-[11px] leading-none text-white/75">n.º 4, junto a Casa Tomás</p>
      </div>
      <figcaption>
        <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-2">
          <a href={URL_MAPS} target="_blank" rel="noopener noreferrer" className={BOTON_MAPA}>
            Abrir en Google Maps
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <button type="button" onClick={() => setPedido(true)} className={BOTON_MAPA}>
            Ver mapa interactivo de Google
          </button>
        </div>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          © OpenStreetMap
        </a>
      </figcaption>

      {/* El permiso, en el propio hueco del mapa y solo cuando se pide. */}
      {preguntando && (
        <div
          role="group"
          aria-labelledby="mapa-google-titulo"
          aria-describedby="mapa-google-texto"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-black/85 px-6 text-center backdrop-blur-sm"
        >
          <p id="mapa-google-titulo" className="font-serif text-2xl text-[#F3EEE4]">
            Mapa interactivo de Google
          </p>
          <p id="mapa-google-texto" className="max-w-sm text-sm leading-relaxed text-white/80">
            Lo sirve Google y pone sus propias cookies. Si prefieres no aceptarlas, con el mapa de esta página y «Abrir
            en Google Maps» llegas igual.{" "}
            <Link
              to="/cookies"
              className="whitespace-nowrap text-[#D8B47E] underline underline-offset-4 decoration-[#D8B47E]/40 hover:decoration-[#D8B47E] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Más información
            </Link>
          </p>
          <div className="grid w-full max-w-xs grid-cols-2 gap-3">
            <button
              ref={permitir}
              type="button"
              onClick={() => guardarConsentimiento("accepted")}
              className="min-h-11 rounded-full border border-white/30 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Aceptar
            </button>
            <button
              type="button"
              onClick={() => {
                guardarConsentimiento("rejected");
                setPedido(false);
              }}
              className="min-h-11 rounded-full border border-white/30 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Rechazar
            </button>
          </div>
        </div>
      )}
    </figure>
  );
};

const Contacto = () => {
  return (
    <Layout>
      <Seo
        title="Cómo llegar · Touza, bar de copas en Crevillente"
        description="Cómo llegar a Touza, bar de copas y coctelería en Crevillent: C/ Santa María de la Cabeza, 4, la puerta de al lado de Casa Tomás. Horario, teléfono y mapa. Sin reservas."
        canonical={canonical("/contacto")}
        keywords={['cómo llegar touza', 'touza crevillente dirección', 'bar de copas crevillente', 'copas junto a casa tomás']}
        schema={barSchema()}
      />

      {/* Cabecera con foto de la estantería. Foto con priority y sin fundido:
          es el LCP. */}
      <section className="escena-scroll relative overflow-hidden h-[44vh] min-h-[19rem] md:h-[58vh]">
        <div className="escena-foto absolute inset-0">
          <OptimizedImage
            imagen={IMAGENES.estanteria}
            alt=""
            className="w-full h-full object-cover"
            sizes="100vw"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-background" />
        </div>
        <div className="escena-texto absolute inset-0 z-10 flex items-end px-6 pb-10 md:pb-16">
          <div className="max-w-4xl mx-auto w-full text-center text-shadow">
            <h1
              style={{ animationDelay: "0.15s" }}
              className="entrada-hero font-serif font-bold text-white leading-[0.9] text-5xl mb-4 md:text-7xl md:mb-6 lg:text-8xl"
            >
              Cómo llegar
            </h1>
            <p
              style={{ animationDelay: "0.3s" }}
              className="entrada-hero text-white/85 text-base md:text-lg max-w-xl mx-auto"
            >
              {NEGOCIO.calle}, Crevillent. La puerta de al lado de Casa Tomás. Sin reservas: ven directamente.
            </p>
          </div>
        </div>
      </section>

      {/* Datos a la izquierda y mapa a la derecha en escritorio; en el móvil,
          los botones arriba, luego los datos y el mapa. */}
      <section className="py-10 md:py-20 lg:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-5 md:px-6 grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-start">
          <div className="lg:col-span-5">
            {/* Lo que más se busca en esta página, a un toque y en todos los
                tamaños: la ruta en Google Maps y escribir. Sin "Llamar" desde
                el 02/10/2026 (decisión del dueño); el teléfono sigue abajo. */}
            <nav aria-label="Acciones rápidas" className="mb-10 flex flex-wrap gap-3">
              <a
                href={URL_COMO_LLEGAR}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#D8B47E] px-5 text-[15px] font-medium text-black transition-colors hover:bg-[#e6c796] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-none"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Cómo llegar
              </a>
              <a
                href={MAILTO}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-[15px] text-white/85 ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-none"
              >
                <Mail className="h-4 w-4 text-[#D8B47E]" aria-hidden="true" />
                Escribir
              </a>
            </nav>

            <h2 className="font-serif font-bold text-foreground mb-6 md:mb-8 text-3xl md:text-5xl">
              Encuéntranos
            </h2>

            {/* Cada fila con enlace es entera pulsable. */}
            <div className="space-y-2 md:space-y-3 mb-10 -mx-3">
              {contactInfo.map((item, index) => {
                const contenido = (
                  <>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="pt-1 min-w-0">
                      <h3 className="text-sm text-foreground font-medium mb-1">{item.title}</h3>
                      <p className="text-white/80 group-hover:text-primary whitespace-pre-line text-base transition-colors duration-300 [font-variant-numeric:lining-nums]">
                        {item.content}
                      </p>
                    </div>
                  </>
                );
                const fila = "flex items-start gap-5 rounded-2xl px-3 py-3";
                return (
                  <Reveal delay={index * 0.06} key={item.title}>
                    {item.link ? (
                      <a
                        href={item.link}
                        target={item.link.startsWith("http") ? "_blank" : undefined}
                        rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                        className={`group ${fila} hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                      >
                        {contenido}
                      </a>
                    ) : (
                      <div className={fila}>{contenido}</div>
                    )}
                  </Reveal>
                );
              })}
            </div>

            <div className="flex gap-3">
              <a href={NEGOCIO.redes[0]} target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-300"
                aria-label="Instagram de Touza (se abre en otra pestaña)">
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </a>
              <a href={NEGOCIO.redes[1]} target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-300"
                aria-label="Facebook de Touza (se abre en otra pestaña)">
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <MapaTouza />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contacto;

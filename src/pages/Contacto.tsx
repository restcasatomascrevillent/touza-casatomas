import { useState } from "react";
import { Phone, MapPin, Clock, Mail, Instagram, Facebook, ExternalLink } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import { canonical } from "@/lib/site";
import { useConsentimiento } from "@/lib/consentimiento";
import Reveal from "@/components/Reveal";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { IMAGENES } from "@/assets/imagenes";

const DIRECCION_MAPS = "C/ San Vicente, 14, 03330 Crevillente, Alicante";
const URL_MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DIRECCION_MAPS)}`;
// Embed clásico por dirección. El anterior llevaba un `pb=` con un place id
// inventado ("0x4a1234567890abcd") y una marca de tiempo de ejemplo.
const URL_MAPA_EMBEBIDO = `https://maps.google.com/maps?q=${encodeURIComponent(DIRECCION_MAPS)}&z=17&hl=es&output=embed`;

const contactInfo = [
  { icon: MapPin, title: "Dirección", content: "C/ San Vicente, 14\n03330 Crevillente, Alicante", link: URL_MAPS },
  { icon: Phone, title: "Teléfono", content: "966 782 000", link: "tel:+34966782000" },
  { icon: Clock, title: "Horario", content: "Jue - Sáb: 20:00 - 02:00\nDom: 18:00 - 00:00", link: null },
  { icon: Mail, title: "Email", content: "info@touzabar.es", link: "mailto:info@touzabar.es" },
];

const Contacto = () => {
  const consentimiento = useConsentimiento();
  const [mapaPedido, setMapaPedido] = useState(false);
  const mostrarMapa = consentimiento === "accepted" || mapaPedido;

  return (
    <Layout>
      <Seo
        title="Contacto y Ubicación"
        description="Contacta con Touza Cocktail Bar en Crevillente. Horarios, ubicación y reservas."
        canonical={canonical("/contacto")}
        keywords={['contacto touza', 'ubicación touza', 'reserva mesa', 'horario cocktail bar']}
      />

      {/* Cabecera con foto, como Carta y El Reservado (antes, un bloque negro
          con el titular). Foto con priority y sin fundido: es el LCP. */}
      <section className="relative overflow-hidden h-[44vh] min-h-[19rem] md:h-[62vh]">
        <div className="absolute inset-0">
          <OptimizedImage
            imagen={IMAGENES.interior}
            alt=""
            className="w-full h-full object-cover"
            sizes="100vw"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>
        <div className="absolute inset-0 z-10 flex items-end px-6 pb-10 md:pb-16">
          <div className="max-w-4xl mx-auto w-full text-center">
            <span
              style={{ animationDelay: "0.1s" }}
              className="entrada-hero text-primary text-xs tracking-[0.3em] uppercase mb-3 md:mb-4 block font-medium"
            >
              Hablemos
            </span>
            <h1
              style={{ animationDelay: "0.2s" }}
              className="entrada-hero font-serif font-bold text-white leading-[0.9] text-5xl mb-3 md:text-7xl md:mb-6 lg:text-8xl"
            >
              Contacto
            </h1>
            <p
              style={{ animationDelay: "0.35s" }}
              className="entrada-hero text-white/70 text-base md:text-lg font-light max-w-xl mx-auto"
            >
              Te esperamos en el corazón de Crevillente.
            </p>
          </div>
        </div>
      </section>

      {/* En escritorio, datos a la izquierda y mapa a la derecha (antes una
          sola columna estrecha con el mapa debajo). En móvil, igual que antes. */}
      <section className="py-10 md:py-24 lg:py-32 bg-background">
        <div className="max-w-6xl mx-auto px-6 grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-start">
          <div className="lg:col-span-5">
            <h2 className="font-serif font-bold text-foreground mb-6 md:mb-10 text-3xl md:text-5xl">
              Encuéntranos
            </h2>

            <div className="space-y-6 md:space-y-8 mb-10 md:mb-12">
              {contactInfo.map((item, index) => (
                <Reveal
                  delay={index * 0.08}
                  key={item.title}
                  className="flex items-start gap-5"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-sm text-foreground font-medium mb-1">{item.title}</h3>
                    {item.link ? (
                      <a
                        href={item.link}
                        target={item.link.startsWith("http") ? "_blank" : undefined}
                        rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="inline-block py-1 text-white/75 hover:text-primary underline-offset-4 hover:underline transition-colors duration-300 whitespace-pre-line text-base font-light rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-white/75 whitespace-pre-line text-base font-light">{item.content}</p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Social */}
            <Reveal delay={0.3} className="flex gap-3">
              <a href="https://www.instagram.com/touzabar/" target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-300"
                aria-label="Instagram de Touza (se abre en otra pestaña)">
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </a>
              <a href="https://www.facebook.com/touzabar/" target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-300"
                aria-label="Facebook de Touza (se abre en otra pestaña)">
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </a>
            </Reveal>
          </div>

          {/* Mapa: el iframe de Google pone cookies de terceros, así que solo se
              carga con el consentimiento aceptado o si el visitante lo pide aquí.
              Antes cargaba siempre, aunque se hubiera pulsado "Rechazar". */}
          <Reveal
            scale={0.98}
            className="lg:col-span-7 rounded-2xl overflow-hidden border border-border/30 bg-card"
          >
            {mostrarMapa ? (
              <iframe
                src={URL_MAPA_EMBEBIDO}
                width="100%" height="350" className="block h-[350px] lg:h-[520px]" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Ubicación Touza"
                // allow-popups: sin él, "Ampliar el mapa" de Google no abría nada.
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
            ) : (
              <div className="h-[350px] lg:h-[520px] flex flex-col items-center justify-center gap-5 px-6 text-center">
                <MapPin className="w-8 h-8 text-primary" aria-hidden="true" />
                <p className="text-white/70 text-sm font-light max-w-sm leading-relaxed">
                  El mapa lo sirve Google y usa cookies de terceros. Cárgalo aquí o ábrelo directamente en Google Maps.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setMapaPedido(true)}
                    className="min-h-[44px] px-6 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Cargar mapa
                  </button>
                  <a
                    href={URL_MAPS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/25 text-sm text-white/85 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Abrir en Google Maps
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default Contacto;

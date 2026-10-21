import { MapPin, Clock, Phone, Mail, Instagram } from "lucide-react";
import Reveal from "@/components/Reveal";
import { DIRECCION_MAPS, NEGOCIO } from "@/lib/negocio";

// Cada dato con su enlace: antes eran <p> sueltos y en el móvil no se podía
// pulsar el teléfono ni abrir la dirección en el mapa desde la portada.
const contactItems: { icon: typeof MapPin; title: string; lines: { text: string; href?: string; label?: string }[] }[] = [
  {
    icon: MapPin,
    title: "Ubicación",
    lines: [
      {
        text: `${NEGOCIO.calle}\n${NEGOCIO.cp} ${NEGOCIO.localidad}, ${NEGOCIO.region}`,
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DIRECCION_MAPS)}`,
        label: `Ver ${NEGOCIO.calle}, ${NEGOCIO.localidad}, en Google Maps`,
      },
    ],
  },
  {
    icon: Clock,
    title: "Horario",
    lines: [{ text: "Jue - Sáb: 20:00 - 02:00" }, { text: "Dom: 18:00 - 00:00" }],
  },
  {
    icon: Phone,
    title: "Contacto",
    lines: [
      { text: "966 782 000", href: "tel:+34966782000", label: "Llamar al 966 782 000" },
      { text: "info@touzabar.es", href: "mailto:info@touzabar.es" },
    ],
  },
];

const VisitUs = () => {
  return (
    <section className="py-12 md:py-32 bg-black text-white">
      <div className="max-w-5xl mx-auto px-5 md:px-6">
        <div className="text-center mb-8 md:mb-20">
          <Reveal
            as="span"
            className="text-primary text-xs tracking-[0.3em] uppercase mb-3 md:mb-4 block font-medium"
          >
            Contacto
          </Reveal>
          <Reveal
            as="h2"
            delay={0.08}
            className="font-serif text-3xl md:text-6xl text-white mb-3 md:mb-6"
          >
            Visítanos
          </Reveal>
          <Reveal
            as="p"
            delay={0.16}
            className="text-white/65 text-base md:text-lg max-w-xl mx-auto font-light"
          >
            Te esperamos en el corazón de Crevillente.
          </Reveal>
        </div>

        {/* En el móvil, lista compacta (icono a la izquierda, texto
            alineado): antes eran tres bloques centrados y apilados, con mucho
            aire y los enlaces de 31 px de alto. Desde md, tres columnas. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-16 relative max-w-sm mx-auto md:max-w-none">
          {/* Vertical separators desktop */}
          <div className="hidden md:block absolute top-8 bottom-8 left-1/3 w-px bg-white/5" />
          <div className="hidden md:block absolute top-8 bottom-8 right-1/3 w-px bg-white/5" />

          {contactItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.08} className="flex items-start gap-4 text-left md:block md:text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 md:mx-auto md:mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0 pt-0.5 md:pt-0">
              <h3 className="font-serif text-lg md:text-xl text-white md:mb-3">{item.title}</h3>
              {item.lines.map((line) =>
                line.href ? (
                  <a
                    key={line.text}
                    href={line.href}
                    aria-label={line.label}
                    target={line.href.startsWith("http") ? "_blank" : undefined}
                    rel={line.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex min-h-11 items-center md:block md:min-h-0 py-1 whitespace-pre-line text-white/75 hover:text-primary text-[15px] md:text-base font-light leading-relaxed underline-offset-4 hover:underline transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {line.text}
                  </a>
                ) : (
                  <p key={line.text} className="text-white/75 text-[15px] md:text-base font-light leading-relaxed">{line.text}</p>
                )
              )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={0.2}
          className="flex justify-center gap-3 md:gap-4 mt-8 md:mt-16"
        >
          <a
            href="mailto:info@touzabar.es"
            className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Escribir un email a info@touzabar.es"
          >
            <Mail className="w-[18px] h-[18px] md:w-5 md:h-5 text-white/70" aria-hidden="true" />
          </a>
          <a
            href="https://www.instagram.com/touzabar/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Instagram de Touza (se abre en otra pestaña)"
          >
            <Instagram className="w-[18px] h-[18px] md:w-5 md:h-5 text-white/70" aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
};

export default VisitUs;

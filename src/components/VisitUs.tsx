import { MapPin, Clock, Phone, Mail, Instagram } from "lucide-react";
import { motion } from "framer-motion";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

// Cada dato con su enlace: antes eran <p> sueltos y en el móvil no se podía
// pulsar el teléfono ni abrir la dirección en el mapa desde la portada.
const contactItems: { icon: typeof MapPin; title: string; lines: { text: string; href?: string; label?: string }[] }[] = [
  {
    icon: MapPin,
    title: "Ubicación",
    lines: [
      {
        text: "C/ San Vicente, 14\n03330 Crevillente, Alicante",
        href: "https://www.google.com/maps/search/?api=1&query=C%2F%20San%20Vicente%2C%2014%2C%2003330%20Crevillente%2C%20Alicante",
        label: "Ver C/ San Vicente 14, Crevillente, en Google Maps",
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
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: appleEase }}
            className="text-primary text-[11px] md:text-xs tracking-[0.3em] uppercase mb-3 md:mb-4 block font-medium"
          >
            Contacto
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: appleEase }}
            className="font-serif text-3xl md:text-6xl text-white mb-3 md:mb-6"
          >
            Visítanos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: appleEase }}
            className="text-white/65 text-base md:text-lg max-w-xl mx-auto font-light"
          >
            Te esperamos en el corazón de Crevillente.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-16 relative">
          {/* Vertical separators desktop */}
          <div className="hidden md:block absolute top-8 bottom-8 left-1/3 w-px bg-white/5" />
          <div className="hidden md:block absolute top-8 bottom-8 right-1/3 w-px bg-white/5" />

          {contactItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: appleEase }}
              className="text-center"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 md:mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-lg md:text-xl text-white mb-1 md:mb-3">{item.title}</h3>
              {item.lines.map((line) =>
                line.href ? (
                  <a
                    key={line.text}
                    href={line.href}
                    aria-label={line.label}
                    target={line.href.startsWith("http") ? "_blank" : undefined}
                    rel={line.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="block py-1 whitespace-pre-line text-white/70 hover:text-primary text-sm md:text-base font-light leading-relaxed underline-offset-4 hover:underline transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {line.text}
                  </a>
                ) : (
                  <p key={line.text} className="text-white/70 text-sm md:text-base font-light leading-relaxed">{line.text}</p>
                )
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: appleEase }}
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
        </motion.div>
      </div>
    </section>
  );
};

export default VisitUs;

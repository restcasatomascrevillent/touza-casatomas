import { MapPin, Clock, Phone, Mail, Instagram } from "lucide-react";
import { motion } from "framer-motion";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const contactItems = [
  {
    icon: MapPin,
    title: "Ubicación",
    lines: ["C/ San Vicente, 14", "03330 Crevillente, Alicante"],
  },
  {
    icon: Clock,
    title: "Horario",
    lines: ["Jue - Sáb: 20:00 - 02:00", "Dom: 18:00 - 00:00"],
  },
  {
    icon: Phone,
    title: "Contacto",
    lines: ["966 782 000", "info@touzabar.es"],
  },
];

const VisitUs = () => {
  return (
    <section className="py-16 md:py-32 bg-black text-white">
      <div className="max-w-5xl mx-auto px-5 md:px-6">
        <div className="text-center mb-12 md:mb-20">
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
            className="font-serif text-3xl md:text-6xl text-white mb-4 md:mb-6"
          >
            Visítanos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: appleEase }}
            className="text-white/50 text-base md:text-lg max-w-xl mx-auto font-light"
          >
            Te esperamos en el corazón de Crevillente.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 relative">
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
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-4 md:mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <item.icon className="w-5 h-5 md:w-6 md:h-6 text-white/50" />
              </div>
              <h4 className="font-serif text-lg md:text-xl text-white mb-2 md:mb-3">{item.title}</h4>
              {item.lines.map((line, i) => (
                <p key={i} className="text-white/45 text-sm md:text-base font-light leading-relaxed">{line}</p>
              ))}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: appleEase }}
          className="flex justify-center gap-3 md:gap-4 mt-12 md:mt-16"
        >
          <a
            href="mailto:info@touzabar.es"
            className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors duration-200"
            aria-label="Email"
          >
            <Mail className="w-[18px] h-[18px] md:w-5 md:h-5 text-white/50" />
          </a>
          <a
            href="https://www.instagram.com/touzabar/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors duration-200"
            aria-label="Instagram"
          >
            <Instagram className="w-[18px] h-[18px] md:w-5 md:h-5 text-white/50" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default VisitUs;

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
    <section className="py-24 md:py-32 bg-black text-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: appleEase }}
            className="text-primary text-xs tracking-[0.3em] uppercase mb-4 block font-medium"
          >
            Contacto
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: appleEase }}
            className="font-serif text-4xl md:text-6xl text-white mb-6"
          >
            Visítanos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: appleEase }}
            className="text-white/40 text-lg max-w-xl mx-auto font-light"
          >
            Te esperamos en el corazón de Crevillente.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-16 relative">
          {/* Vertical separators desktop */}
          <div className="hidden md:block absolute top-8 bottom-8 left-1/3 w-px bg-white/5" />
          <div className="hidden md:block absolute top-8 bottom-8 right-1/3 w-px bg-white/5" />

          {contactItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: appleEase }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-white/50" />
              </div>
              <h4 className="font-serif text-xl text-white mb-3">{item.title}</h4>
              {item.lines.map((line, i) => (
                <p key={i} className="text-white/40 font-light leading-relaxed">{line}</p>
              ))}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: appleEase }}
          className="flex justify-center gap-4 mt-16"
        >
          <a
            href="mailto:info@touzabar.es"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-300"
            aria-label="Email"
          >
            <Mail className="w-5 h-5 text-white/50" />
          </a>
          <a
            href="https://www.instagram.com/touzabar/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-300"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5 text-white/50" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default VisitUs;

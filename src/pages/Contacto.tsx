import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Mail, Instagram, Facebook } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const contactInfo = [
  { icon: MapPin, title: "Dirección", content: "C/ San Vicente, 14\n03330 Crevillente, Alicante", link: "https://maps.google.com/?q=C/+San+Vicente,+14,+03330+Crevillente,+Alicante" },
  { icon: Phone, title: "Teléfono", content: "966 782 000", link: "tel:+34966782000" },
  { icon: Clock, title: "Horario", content: "Jue - Sáb: 20:00 - 02:00\nDom: 18:00 - 00:00", link: null },
  { icon: Mail, title: "Email", content: "info@touzabar.es", link: "mailto:info@touzabar.es" },
];

const Contacto = () => {
  const isMobile = useIsMobile();

  return (
    <Layout>
      <Seo
        title="Contacto y Ubicación"
        description="Contacta con Touza Cocktail Bar en Crevillente. Horarios, ubicación y reservas."
        canonical="https://touzabar.es/contacto"
        keywords={['contacto touza', 'ubicación touza', 'reserva mesa', 'horario cocktail bar']}
      />

      {/* Hero - Minimal black */}
      <section className={cn(
        "bg-black overflow-hidden",
        isMobile ? "pt-28 pb-12 px-6" : "pt-40 pb-24"
      )}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: appleEase }}
            className="text-primary text-xs tracking-[0.3em] uppercase mb-4 block font-medium"
          >
            Hablemos
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: appleEase }}
            className={cn(
              "font-serif font-bold text-white",
              isMobile ? "text-4xl" : "text-7xl lg:text-8xl"
            )}
          >
            Contacto
          </motion.h1>
        </div>
      </section>

      {/* Contact info */}
      <section className="py-16 md:py-32 bg-background">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className={cn(
            "font-serif font-bold text-foreground mb-10",
            isMobile ? "text-2xl" : "text-4xl"
          )}>
            Encuéntranos
          </h2>

          <div className="space-y-8 mb-12">
            {contactInfo.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: appleEase }}
                key={index}
                className="flex items-start gap-5"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="pt-1">
                  <h3 className="text-sm text-foreground font-medium mb-1">{item.title}</h3>
                  {item.link ? (
                    <a
                      href={item.link}
                      target={item.link.startsWith("http") ? "_blank" : undefined}
                      rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-300 whitespace-pre-line text-sm font-light"
                    >
                      {item.content}
                    </a>
                  ) : (
                    <p className="text-muted-foreground whitespace-pre-line text-sm font-light">{item.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3, ease: appleEase }}
            className="flex gap-3 mb-10"
          >
            <a href="https://www.instagram.com/touzabar/" target="_blank" rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-300"
              aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.facebook.com/touzabar/" target="_blank" rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-300"
              aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: appleEase }}
            className="rounded-2xl overflow-hidden border border-border/30"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3127.8967799847837!2d-0.8111399!3d38.2493699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd63b5c3d9d4e0cf%3A0x4a1234567890abcd!2sC.%20San%20Vicente%2C%2014%2C%2003330%20Crevillent%2C%20Alicante!5e0!3m2!1ses!2ses!4v1234567890123"
              width="100%" height="350" style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title="Ubicación Touza"
              sandbox="allow-scripts allow-same-origin"
            />
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contacto;

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Mail, Send, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({ nombre: "", email: "", asunto: "", mensaje: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({ title: "¡Mensaje enviado!", description: "Te responderemos lo antes posible." });
    setFormData({ nombre: "", email: "", asunto: "", mensaje: "" });
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <Seo
        title="Contacto y Ubicación"
        description="Contacta con Touza Cocktail Bar en Crevillente. Horarios, ubicación y reservas."
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

      {/* Contact + Form */}
      <section className="py-16 md:py-32 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Info */}
            <div>
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
              <div className="flex gap-3 mb-10">
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
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-border/30">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3127.8967799847837!2d-0.8111399!3d38.2493699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd63b5c3d9d4e0cf%3A0x4a1234567890abcd!2sC.%20San%20Vicente%2C%2014%2C%2003330%20Crevillent%2C%20Alicante!5e0!3m2!1ses!2ses!4v1234567890123"
                  width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" title="Ubicación Touza"
                />
              </div>
            </div>

            {/* Form */}
            <div className="bg-card border border-border/20 rounded-2xl p-6 md:p-10">
              <h2 className={cn(
                "font-serif font-bold text-foreground mb-8",
                isMobile ? "text-2xl" : "text-3xl"
              )}>
                Envía un mensaje
              </h2>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: appleEase }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="nombre" className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Nombre *</label>
                  <Input id="nombre" name="nombre" type="text" required autoComplete="name" value={formData.nombre} onChange={handleChange}
                    className="h-14 bg-secondary/50 border-border/30 focus:border-primary/50 rounded-xl text-base" placeholder="Tu nombre" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Email *</label>
                  <Input id="email" name="email" type="email" required autoComplete="email" inputMode="email" value={formData.email} onChange={handleChange}
                    className="h-14 bg-secondary/50 border-border/30 focus:border-primary/50 rounded-xl text-base" placeholder="tu@email.com" />
                </div>
                <div>
                  <label htmlFor="asunto" className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Asunto</label>
                  <Input id="asunto" name="asunto" type="text" value={formData.asunto} onChange={handleChange}
                    className="h-14 bg-secondary/50 border-border/30 focus:border-primary/50 rounded-xl text-base" placeholder="¿En qué podemos ayudarte?" />
                </div>
                <div>
                  <label htmlFor="mensaje" className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Mensaje *</label>
                  <Textarea id="mensaje" name="mensaje" rows={5} required value={formData.mensaje} onChange={handleChange}
                    className="bg-secondary/50 border-border/30 focus:border-primary/50 rounded-xl text-base resize-none min-h-[120px]" placeholder="Escribe tu mensaje aquí..." />
                </div>
                <Button type="submit" size="lg" disabled={isSubmitting}
                  className="w-full h-14 bg-white text-black hover:bg-white/90 font-medium rounded-2xl text-base">
                  {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                </Button>
              </motion.form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contacto;

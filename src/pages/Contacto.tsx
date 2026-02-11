import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Mail, Send, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import { cn } from "@/lib/utils";
import ScrollTextReveal from "@/components/ScrollTextReveal";

const contactInfo = [
  {
    icon: MapPin,
    title: "Dirección",
    content: "C/ San Vicente, 14\n03330 Crevillente, Alicante",
    link: "https://maps.google.com/?q=C/+San+Vicente,+14,+03330+Crevillente,+Alicante",
  },
  {
    icon: Phone,
    title: "Teléfono",
    content: "966 782 000",
    link: "tel:+34966782000",
  },
  {
    icon: Clock,
    title: "Horario",
    content: "Jue - Sáb: 20:00 - 02:00\nDom: 18:00 - 00:00",
    link: null,
  },
  {
    icon: Mail,
    title: "Email",
    content: "info@touzabar.es",
    link: "mailto:info@touzabar.es",
  },
];

const Contacto = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "¡Mensaje enviado!",
      description: "Te responderemos lo antes posible.",
    });

    setFormData({
      nombre: "",
      email: "",
      asunto: "",
      mensaje: "",
    });
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <Seo
        title="Contacto y Ubicación"
        description="Contacta con Touza Cocktail Bar en Crevillente. Horarios, ubicación y reservas. Estamos en C/ San Vicente 14."
        keywords={['contacto touza', 'ubicación touza', 'reserva mesa', 'horario cocktail bar', 'teléfono touza']}
      />
      {/* Hero */}
      <section className="relative pt-28 md:pt-32 pb-16 md:pb-20 overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <OptimizedImage
            src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920&h=600&fit=crop"
            alt="Contacto"
            className="w-full h-full object-cover opacity-25"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </motion.div>

        <div className="relative z-10 container-custom text-center">
          <span
            className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block"
          >
            Hablemos
          </span>
          <h1
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6"
          >
            Contacto
          </h1>
          <div className="flex justify-center">
            <ScrollTextReveal className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto justify-center">
              ¿Tienes alguna pregunta? Estamos aquí para ayudarte.
            </ScrollTextReveal>
          </div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div>
              <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
                Información
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-8">
                Encuéntranos
              </h2>

              <div className="space-y-5 md:space-y-6 mb-10">
                {contactInfo.map((item, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    key={index}
                    className="flex items-start gap-4"
                  >
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                      {item.link ? (
                        <a
                          href={item.link}
                          target={item.link.startsWith("http") ? "_blank" : undefined}
                          rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="text-muted-foreground hover:text-primary transition-colors duration-200 whitespace-pre-line text-sm md:text-base"
                        >
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-muted-foreground whitespace-pre-line text-sm md:text-base">{item.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mb-10">
                <h3 className="font-medium text-foreground mb-4">Síguenos</h3>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "w-11 h-11 md:w-12 md:h-12 rounded-full bg-secondary flex items-center justify-center",
                      "text-foreground/80 transition-all duration-200",
                      "hover:bg-primary hover:text-primary-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                      "touch-target"
                    )}
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "w-11 h-11 md:w-12 md:h-12 rounded-full bg-secondary flex items-center justify-center",
                      "text-foreground/80 transition-all duration-200",
                      "hover:bg-primary hover:text-primary-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                      "touch-target"
                    )}
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Map */}
              <div
                className="rounded-lg overflow-hidden border border-border/30"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3127.8967799847837!2d-0.8111399!3d38.2493699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd63b5c3d9d4e0cf%3A0x4a1234567890abcd!2sC.%20San%20Vicente%2C%2014%2C%2003330%20Crevillent%2C%20Alicante!5e0!3m2!1ses!2ses!4v1234567890123"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Touza"
                  className="grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div
              className="bg-card border border-border/30 rounded-lg p-6 md:p-8 lg:p-10"
            >
              <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
                Escríbenos
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6 md:mb-8">
                Envía un mensaje
              </h2>

              <motion.form
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                onSubmit={handleSubmit}
                className="space-y-4 md:space-y-6"
              >
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-2">
                    Nombre *
                  </label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="h-14 bg-secondary/50 border-border/60 focus-glow rounded-xl text-base"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-14 bg-secondary/50 border-border/60 focus-glow rounded-xl text-base"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="asunto" className="block text-sm font-medium text-foreground mb-2">
                    Asunto
                  </label>
                  <Input
                    id="asunto"
                    name="asunto"
                    type="text"
                    value={formData.asunto}
                    onChange={handleChange}
                    className="h-14 bg-secondary/50 border-border/60 focus-glow rounded-xl text-base"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-foreground mb-2">
                    Mensaje *
                  </label>
                  <Textarea
                    id="mensaje"
                    name="mensaje"
                    rows={5}
                    required
                    value={formData.mensaje}
                    onChange={handleChange}
                    className="bg-secondary/50 border-border/60 resize-none focus-glow rounded-xl text-base min-h-[120px]"
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl text-base tap-highlight"
                >
                  {isSubmitting ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      Enviar mensaje
                      <Send className="ml-2 w-5 h-5" />
                    </>
                  )}
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

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Wine, Music, Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import ScrollTextReveal from "@/components/ScrollTextReveal";

const features = [
  {
    icon: Users,
    title: "Capacidad",
    description: "Hasta 20 personas en un ambiente íntimo",
  },
  {
    icon: Wine,
    title: "Servicio Premium",
    description: "Carta personalizada y atención dedicada",
  },
  {
    icon: Music,
    title: "Ambiente Privado",
    description: "Tu música y decoración a medida",
  },
  {
    icon: Star,
    title: "Eventos Especiales",
    description: "Cumpleaños, cenas y reuniones",
  },
];

const galleryImages = [
  "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-7-scaled.webp",
  "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-8-1-scaled.webp",
  "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-5-scaled.webp",
];

const Reservado = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    fecha: "",
    personas: "",
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
      title: "¡Solicitud enviada!",
      description: "Nos pondremos en contacto contigo pronto para confirmar tu reserva.",
    });

    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      fecha: "",
      personas: "",
      mensaje: "",
    });
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <Seo
        title="El Reservado - Eventos Privados"
        description="Celebra tus eventos más especiales en El Reservado de Touza. Un espacio exclusivo para reuniones privadas, cumpleaños y celebraciones en Crevillente."
        keywords={['reservado crevillente', 'eventos privados', 'fiestas privadas', 'sala vip', 'celebraciones']}
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
            src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-8-scaled-e1699522690950.webp"
            alt="El Reservado"
            className="w-full h-full object-cover opacity-35"
            priority={true}
          />
          <div className="absolute inset-0 bg-background/50" />
        </motion.div>

        <div className="relative z-10 container-custom text-center">
          <span
            className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block"
          >
            Espacio exclusivo
          </span>
          <h1
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6"
          >
            El Reservado
          </h1>
          <div className="flex justify-center">
            <ScrollTextReveal className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto justify-center">
              Un rincón privado donde crear momentos únicos. Perfecto para celebraciones íntimas y eventos especiales.
            </ScrollTextReveal>
          </div>
        </div>
      </section>
      <section className="section-padding bg-charcoal">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                key={index}
                className="text-center p-5 md:p-6 rounded-lg bg-card border border-border/30 hover:border-primary/30 transition-colors duration-200"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-1 md:mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-10 md:mb-12">
            <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
              Descubre el espacio
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Un ambiente único
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {galleryImages.map((image, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                key={index}
                className="group relative overflow-hidden rounded-lg aspect-[3/2]"
              >
                <img
                  src={image}
                  alt={`El Reservado ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              asChild
              variant="outline"
              className="h-12 px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Link to="/galeria">Ver galería completa</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section-padding bg-charcoal">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10 md:mb-12">
              <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
                Reserva tu espacio
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Solicita información
              </h2>
              <div className="mb-6 md:mb-8">
                <ScrollTextReveal className="text-muted-foreground text-base md:text-lg justify-center">
                  Cuéntanos sobre tu evento y diseñaremos una experiencia a medida.
                </ScrollTextReveal>
              </div>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onSubmit={handleSubmit}
              className="space-y-4 md:space-y-6"
            >
              {/* Name & Email - Stack on mobile */}
              <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-2">
                    Nombre completo *
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
              </div>

              {/* Phone, Date, People - Stack on small mobile, 3 cols on larger */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-foreground mb-2">
                    Teléfono *
                  </label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="h-14 bg-secondary/50 border-border/60 focus-glow rounded-xl text-base"
                    placeholder="600 000 000"
                  />
                </div>
                <div>
                  <label htmlFor="fecha" className="block text-sm font-medium text-foreground mb-2">
                    Fecha
                  </label>
                  <Input
                    id="fecha"
                    name="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={handleChange}
                    className="h-14 bg-secondary/50 border-border/60 focus-glow rounded-xl text-base"
                  />
                </div>
                <div>
                  <label htmlFor="personas" className="block text-sm font-medium text-foreground mb-2">
                    Personas
                  </label>
                  <Input
                    id="personas"
                    name="personas"
                    type="number"
                    min="1"
                    max="20"
                    inputMode="numeric"
                    value={formData.personas}
                    onChange={handleChange}
                    className="h-14 bg-secondary/50 border-border/60 focus-glow rounded-xl text-base"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-foreground mb-2">
                  Cuéntanos sobre tu evento
                </label>
                <Textarea
                  id="mensaje"
                  name="mensaje"
                  rows={4}
                  value={formData.mensaje}
                  onChange={handleChange}
                  className="bg-secondary/50 border-border/60 resize-none focus-glow"
                  placeholder="Tipo de evento, preferencias especiales, horario..."
                />
              </div>

              <div className="pt-2">
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
                      Enviar solicitud
                      <Send className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          </div>
        </div>
      </section>
    </Layout >
  );
};

export default Reservado;

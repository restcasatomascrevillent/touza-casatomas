import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Wine, Music, Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";

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
      {/* Hero */}
      <section className="relative pt-28 md:pt-32 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-8-scaled-e1699522690950.webp"
            alt="El Reservado"
            className="w-full h-full object-cover opacity-35"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        <div className="relative z-10 container-custom text-center">
          <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block opacity-0 animate-fade-up">
            Espacio exclusivo
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 opacity-0 animate-fade-up animation-delay-100">
            El Reservado
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto opacity-0 animate-fade-up animation-delay-200">
            Un rincón privado donde crear momentos únicos. 
            Perfecto para celebraciones íntimas y eventos especiales.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-charcoal">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div
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
              </div>
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
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg aspect-[3/2]"
              >
                <img
                  src={image}
                  alt={`El Reservado ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </div>
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
              <p className="text-muted-foreground text-base md:text-lg">
                Cuéntanos sobre tu evento y diseñaremos una experiencia a medida.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-2">
                    Nombre completo *
                  </label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className="h-12 md:h-14 bg-secondary/50 border-border/60 focus-glow"
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
                    value={formData.email}
                    onChange={handleChange}
                    className="h-12 md:h-14 bg-secondary/50 border-border/60 focus-glow"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-6">
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-foreground mb-2">
                    Teléfono *
                  </label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    value={formData.telefono}
                    onChange={handleChange}
                    className="h-12 md:h-14 bg-secondary/50 border-border/60 focus-glow"
                    placeholder="600..."
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
                    className="h-12 md:h-14 bg-secondary/50 border-border/60 focus-glow"
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
                    value={formData.personas}
                    onChange={handleChange}
                    className="h-12 md:h-14 bg-secondary/50 border-border/60 focus-glow"
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

              <div className="text-center pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  {isSubmitting ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      Enviar solicitud
                      <Send className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Reservado;

import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Wine, Music, Star, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";

const features = [
  {
    icon: Users,
    title: "Capacidad",
    description: "Hasta 20 personas en un ambiente íntimo y exclusivo",
  },
  {
    icon: Wine,
    title: "Servicio Premium",
    description: "Carta de cócteles personalizada y atención dedicada",
  },
  {
    icon: Music,
    title: "Ambiente Privado",
    description: "Tu propia música y decoración según la ocasión",
  },
  {
    icon: Star,
    title: "Eventos Especiales",
    description: "Cumpleaños, cenas íntimas, reuniones de empresa",
  },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=400&fit=crop",
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
    
    // Simular envío
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
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=1920&h=800&fit=crop"
            alt="El Reservado"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>
        <div className="relative z-10 container-custom text-center">
          <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
            Espacio exclusivo
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            El Reservado
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Un rincón privado donde crear momentos únicos. 
            Perfecto para celebraciones íntimas y eventos especiales.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-charcoal">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-card border border-border/30 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
              Descubre el espacio
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              Un ambiente único
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg aspect-[3/2]"
              >
                <img
                  src={image}
                  alt={`El Reservado ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/galeria">Ver galería completa</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section-padding bg-charcoal">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-primary text-sm tracking-[0.2em] uppercase mb-4 block">
                Reserva tu espacio
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Solicita información
              </h2>
              <p className="text-muted-foreground text-lg">
                Cuéntanos sobre tu evento y nos pondremos en contacto para 
                diseñar una experiencia a medida.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
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
                    className="bg-secondary border-border"
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
                    className="bg-secondary border-border"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
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
                    className="bg-secondary border-border"
                    placeholder="600 000 000"
                  />
                </div>
                <div>
                  <label htmlFor="fecha" className="block text-sm font-medium text-foreground mb-2">
                    Fecha deseada
                  </label>
                  <Input
                    id="fecha"
                    name="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={handleChange}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label htmlFor="personas" className="block text-sm font-medium text-foreground mb-2">
                    Nº de personas
                  </label>
                  <Input
                    id="personas"
                    name="personas"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.personas}
                    onChange={handleChange}
                    className="bg-secondary border-border"
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
                  className="bg-secondary border-border resize-none"
                  placeholder="Tipo de evento, preferencias especiales, horario..."
                />
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="btn-elegant bg-primary hover:bg-primary/90 text-primary-foreground px-10"
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

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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const features = [
  { icon: Users, title: "Capacidad", description: "Hasta 20 personas en un ambiente íntimo" },
  { icon: Wine, title: "Servicio Premium", description: "Carta personalizada y atención dedicada" },
  { icon: Music, title: "Ambiente Privado", description: "Tu música y decoración a medida" },
  { icon: Star, title: "Eventos Especiales", description: "Cumpleaños, cenas y reuniones" },
];

const galleryImages = [
  "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-7-scaled.webp",
  "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-8-1-scaled.webp",
  "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-5-scaled.webp",
];

const Reservado = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    nombre: "", email: "", telefono: "", fecha: "", personas: "", mensaje: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const notas = [
        "Solicitud desde El Reservado (espacio privado)",
        formData.mensaje ? `Mensaje: ${formData.mensaje}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const { error } = await supabase.from("reservas").insert({
        nombre: formData.nombre,
        email: formData.email || null,
        telefono: formData.telefono,
        fecha: formData.fecha || new Date().toISOString().split("T")[0],
        hora: "00:00",
        numero_comensales: formData.personas ? parseInt(formData.personas, 10) : 1,
        notas_cliente: notas,
        canal: "web",
        estado: "pendiente",
      });

      if (error) throw error;

      toast({
        title: "¡Solicitud enviada!",
        description: "Nos pondremos en contacto contigo pronto para confirmar tu reserva.",
      });
      setFormData({ nombre: "", email: "", telefono: "", fecha: "", personas: "", mensaje: "" });
    } catch (err) {
      console.error("Error al enviar la solicitud:", err);
      toast({
        title: "Error al enviar la solicitud",
        description: "Ha ocurrido un problema. Por favor, inténtalo de nuevo o llámanos directamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Seo
        title="El Reservado - Eventos Privados"
        description="Celebra tus eventos más especiales en El Reservado de Touza. Un espacio exclusivo para reuniones privadas, cumpleaños y celebraciones en Crevillente."
        keywords={['reservado crevillente', 'eventos privados', 'fiestas privadas', 'sala vip', 'celebraciones']}
      />

      {/* Hero - Immersive */}
      <section className={cn(
        "relative overflow-hidden",
        isMobile ? "h-[60vh]" : "h-[80vh]"
      )}>
        <motion.div
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: appleEase }}
          className="absolute inset-0"
        >
          <OptimizedImage
            src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-8-scaled-e1699522690950.webp"
            alt="El Reservado"
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        </motion.div>

        <div className="absolute inset-0 z-10 flex items-end pb-12 md:pb-20 px-6">
          <div className="max-w-6xl mx-auto w-full">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: appleEase }}
              className="text-primary text-xs tracking-[0.3em] uppercase mb-4 block font-medium"
            >
              Espacio exclusivo
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: appleEase }}
              className={cn(
                "font-serif font-bold text-white leading-[0.9]",
                isMobile ? "text-4xl" : "text-7xl lg:text-8xl"
              )}
            >
              El Reservado
            </motion.h1>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-32 bg-black">
        <div className="max-w-5xl mx-auto px-6">
          <div className={cn(
            "grid gap-8 md:gap-16",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            {features.map((feature, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: appleEase }}
                key={index}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-white/5 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-white/50" />
                </div>
                <h3 className="font-serif text-lg text-white mb-2">{feature.title}</h3>
                <p className="text-white/30 text-sm font-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 md:py-32 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: appleEase }}
              className="text-primary text-xs tracking-[0.3em] uppercase mb-4 block font-medium"
            >
              Descubre el espacio
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: appleEase }}
              className={cn(
                "font-serif font-bold text-foreground",
                isMobile ? "text-3xl" : "text-5xl lg:text-6xl"
              )}
            >
              Un ambiente único
            </motion.h2>
          </div>

          {isMobile ? (
            <div className="flex overflow-x-auto gap-3 pb-4 snap-x scrollbar-hide -mx-6 px-6">
              {galleryImages.map((image, index) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: appleEase }}
                  key={index}
                  className="min-w-[75vw] snap-center aspect-[3/4] rounded-2xl overflow-hidden"
                >
                  <img src={image} alt={`El Reservado ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {galleryImages.map((image, index) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.8, ease: appleEase }}
                  key={index}
                  className="aspect-[3/4] rounded-2xl overflow-hidden"
                >
                  <img src={image} alt={`El Reservado ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Button
              asChild
              variant="outline"
              className="h-12 px-8 border-foreground/20 text-foreground hover:bg-foreground hover:text-background rounded-full font-light"
            >
              <Link to="/galeria">Ver galería completa</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 md:py-32 bg-black">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: appleEase }}
              className="text-primary text-xs tracking-[0.3em] uppercase mb-4 block font-medium"
            >
              Reserva tu espacio
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: appleEase }}
              className={cn(
                "font-serif font-bold text-white mb-4",
                isMobile ? "text-3xl" : "text-5xl"
              )}
            >
              Solicita información
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: appleEase }}
              className="text-white/30 font-light"
            >
              Cuéntanos sobre tu evento y diseñaremos una experiencia a medida.
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: appleEase }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="block text-xs text-white/40 uppercase tracking-wider mb-2">Nombre *</label>
                <Input id="nombre" name="nombre" type="text" required autoComplete="name" value={formData.nombre} onChange={handleChange}
                  className="h-14 bg-white/5 border-white/10 focus:border-white/30 rounded-xl text-white placeholder:text-white/20" placeholder="Tu nombre" />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs text-white/40 uppercase tracking-wider mb-2">Email *</label>
                <Input id="email" name="email" type="email" required autoComplete="email" inputMode="email" value={formData.email} onChange={handleChange}
                  className="h-14 bg-white/5 border-white/10 focus:border-white/30 rounded-xl text-white placeholder:text-white/20" placeholder="tu@email.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label htmlFor="telefono" className="block text-xs text-white/40 uppercase tracking-wider mb-2">Teléfono *</label>
                <Input id="telefono" name="telefono" type="tel" required autoComplete="tel" inputMode="tel" value={formData.telefono} onChange={handleChange}
                  className="h-14 bg-white/5 border-white/10 focus:border-white/30 rounded-xl text-white placeholder:text-white/20" placeholder="600 000 000" />
              </div>
              <div>
                <label htmlFor="fecha" className="block text-xs text-white/40 uppercase tracking-wider mb-2">Fecha</label>
                <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange}
                  className="h-14 bg-white/5 border-white/10 focus:border-white/30 rounded-xl text-white" />
              </div>
              <div>
                <label htmlFor="personas" className="block text-xs text-white/40 uppercase tracking-wider mb-2">Personas</label>
                <Input id="personas" name="personas" type="number" min="1" max="20" inputMode="numeric" value={formData.personas} onChange={handleChange}
                  className="h-14 bg-white/5 border-white/10 focus:border-white/30 rounded-xl text-white placeholder:text-white/20" placeholder="10" />
              </div>
            </div>

            <div>
              <label htmlFor="mensaje" className="block text-xs text-white/40 uppercase tracking-wider mb-2">Mensaje</label>
              <Textarea id="mensaje" name="mensaje" rows={4} value={formData.mensaje} onChange={handleChange}
                className="bg-white/5 border-white/10 focus:border-white/30 rounded-xl text-white placeholder:text-white/20 resize-none"
                placeholder="Tipo de evento, preferencias especiales..." />
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting}
              className="w-full h-14 bg-white text-black hover:bg-white/90 font-medium rounded-2xl text-base">
              {isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </motion.form>
        </div>
      </section>
    </Layout>
  );
};

export default Reservado;

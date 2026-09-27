import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Wine, Music, Star, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { IMAGENES } from "@/assets/imagenes";
import { canonical } from "@/lib/site";
import { RESERVAS_WEB_CREAR_URL, functionHeaders, leerCuerpo } from "@/lib/supabase-functions";
import { interpretarRechazoReserva, type RechazoReserva, type TextosRechazo } from "@/lib/reservas-web";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const features = [
  { icon: Users, title: "Capacidad", description: "Hasta 20 personas en un ambiente íntimo" },
  { icon: Wine, title: "Servicio Premium", description: "Carta personalizada y atención dedicada" },
  { icon: Music, title: "Ambiente Privado", description: "Tu música y decoración a medida" },
  { icon: Star, title: "Eventos Especiales", description: "Cumpleaños, cenas y reuniones" },
];

const galleryImages = [IMAGENES.reservado, IMAGENES.mesaPrivada, IMAGENES.barra];

// ---------------------------------------------------------------------------
// El Reservado entra por el mismo circuito de solicitud que usa el
// restaurante (Edge Function `reservas-web`, acción `/crear`), no por un
// insert directo. Es un espacio privado de hasta 20 personas: casi toda
// solicitud real dispara el motivo `grupo_grande` de la función (el máximo
// automático de una reserva normal es 12, ver configuracion_reservas), que
// NO es un fallo aquí — es el camino esperado: queda registrada como
// solicitud pendiente, visible y notificada al panel, para que el
// restaurante la revise y contraoferte por correo (hora y/o espacio) en
// vez de confirmarse sola. Ver el informe de la tarea para el detalle.
// ---------------------------------------------------------------------------

const TELEFONO_TEXTO = "966 782 000";
const TELEFONO_HREF = "tel:+34966782000";

// Exportado a propósito: así los tests guardan ESTE copy, el que ve el
// cliente, y no una copia suya que puede envejecer por su cuenta (la regresión
// de "comprueba tu conexión" es justo la que hay que vigilar aquí).
export const TEXTOS_RECHAZO: TextosRechazo = {
  title: "No hemos podido enviar tu solicitud",
  offlineTitle: "Parece que te has quedado sin conexión",
  close: "Cerrar",
  invalidMessage: "Falta algún dato o tiene un formato incorrecto. Revisa el formulario e inténtalo de nuevo.",
  // El fallo de hoy: esto decía "Comprueba tu conexión", que es mentira
  // cuando lo que se ha caído es la función, y encima le echaba la culpa al
  // cliente. El `errorMessage` solo se usa ya cuando el fallo es NUESTRO.
  errorMessage: "El fallo es nuestro, no tuyo: tu solicitud no ha llegado a registrarse.",
  offlineMessage: "Tu solicitud no ha salido porque se ha perdido la conexión.",
  fallbackMessage: "No ha sido posible procesar tu solicitud en este momento.",
  exits: {
    call: `Llámanos al ${TELEFONO_TEXTO} y te ayudamos directamente.`,
    otherTime: "Prueba a solicitar otra hora para la misma fecha.",
    otherTimeOrCall: `Prueba con otra hora o llámanos al ${TELEFONO_TEXTO}.`,
    otherDate: "Prueba con otra fecha.",
    guests: "Ajusta el número de personas e inténtalo de nuevo.",
    checkForm: "Revisa los datos del formulario e inténtalo de nuevo.",
    offline: `Vuelve a enviarla cuando la recuperes. Si te corre prisa, llámanos al ${TELEFONO_TEXTO}.`,
    retryOrCall: `Inténtalo de nuevo en unos minutos o llámanos al ${TELEFONO_TEXTO}.`,
  },
};

/** YYYY-MM-DD de mañana, solo como pista para el selector de fecha (atributo
 * `min`). El servidor es quien de verdad decide qué fecha vale (motivos
 * `reserva_hoy` / `fecha_pasada` / `corte_horario`, con hora de Madrid). */
function manana(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function formatearFechaLarga(fechaISO: string): string {
  const [y, m, d] = fechaISO.split("-").map(Number);
  if (!y || !m || !d) return fechaISO;
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

type DetalleSolicitud = {
  fecha: string;
  hora: string;
  personas: number;
  /** true si el motivo del rechazo fue `grupo_grande` (>12 personas: el caso
   * habitual en El Reservado). En ambos casos el cliente ve el mismo tipo de
   * confirmación: ninguna reserva de El Reservado se confirma sola. */
  grupoGrande: boolean;
};

const Reservado = () => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    nombre: "", email: "", telefono: "", fecha: "", hora: "", personas: "", mensaje: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecibidaDialog, setShowRecibidaDialog] = useState(false);
  const [detalleSolicitud, setDetalleSolicitud] = useState<DetalleSolicitud | null>(null);
  const [rechazo, setRechazo] = useState<RechazoReserva | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const personas = parseInt(formData.personas, 10);
      const notas = [
        "Solicitud de El Reservado (espacio privado, hasta 20 personas).",
        formData.mensaje.trim() ? `Mensaje del cliente: ${formData.mensaje.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      const response = await fetch(RESERVAS_WEB_CREAR_URL, {
        method: "POST",
        headers: functionHeaders(),
        body: JSON.stringify({
          // Marca explícita (prioridad 1 de `resolverMarca` en
          // reservas-web/plantillas.ts): antes de esto, la función solo
          // sabía que esta solicitud era de Touza por un sniff de la
          // primera línea de `notas_cliente` (prioridad 3, ver más abajo) —
          // frágil, porque un cambio futuro en ese texto la haría caer en
          // Casa Tomás sin ningún error. `notas_cliente` se mantiene igual
          // (sigue siendo información útil y ahora además queda como
          // respaldo), pero la detección real pasa a depender de este campo.
          marca: "touza",
          nombre: formData.nombre.trim(),
          telefono: formData.telefono.trim(),
          email: formData.email.trim(),
          fecha: formData.fecha,
          hora: formData.hora,
          numero_comensales: personas,
          notas_cliente: notas,
          estado: "pendiente",
        }),
      });

      // El cuerpo se lee SIEMPRE, también en 4xx/409: ahí viaja el `motivo`
      // y el `mensaje` que explican por qué, o si en realidad no es un
      // fallo (ver `grupo_grande` justo abajo).
      const cuerpo = await leerCuerpo(response);
      const objeto =
        cuerpo && typeof cuerpo === "object" && !Array.isArray(cuerpo) ? (cuerpo as Record<string, unknown>) : null;
      const motivo = typeof objeto?.motivo === "string" ? objeto.motivo : null;

      // 201: reserva creada (pendiente de verificar, como cualquier otra).
      // 422 + motivo "grupo_grande": el camino ESPERADO para casi todas las
      // solicitudes de El Reservado (>12 personas) — no se crea la reserva
      // todavía, pero SÍ queda registrada como solicitud pendiente, visible
      // y notificada al panel. Desde el punto de vista del cliente ambos
      // casos son la misma promesa: "lo hemos recibido, lo revisamos".
      if (response.status === 201 || motivo === "grupo_grande") {
        setDetalleSolicitud({
          fecha: formData.fecha,
          hora: formData.hora,
          personas,
          grupoGrande: motivo === "grupo_grande",
        });
        setShowRecibidaDialog(true);
        setFormData({ nombre: "", email: "", telefono: "", fecha: "", hora: "", personas: "", mensaje: "" });
        return;
      }

      setRechazo(interpretarRechazoReserva(response.status, cuerpo, TEXTOS_RECHAZO));
    } catch (err) {
      // Ni siquiera hubo respuesta (red caída, DNS, CORS — esto último es lo
      // que ve el navegador cuando la Edge Function muere al arrancar y no
      // contesta ni al OPTIONS de preflight). Se representa con status 0, el
      // único caso ambiguo: aquí es donde `navigator.onLine` (4º parámetro,
      // que se calcula solo) decide si el mensaje culpa a la red del cliente
      // o asume que el fallo es nuestro. Por defecto, nuestro.
      console.error("Error al enviar la solicitud de El Reservado:", err);
      setRechazo(interpretarRechazoReserva(0, null, TEXTOS_RECHAZO));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Solicitud recibida — ninguna reserva de El Reservado se confirma
          sola, así que el mensaje es el mismo tanto si el servidor la creó
          en estado "pendiente" (201) como si la registró para revisión
          manual por ser un grupo grande (motivo "grupo_grande"). */}
      <Dialog open={showRecibidaDialog} onOpenChange={setShowRecibidaDialog}>
        <DialogContent className="bg-black border-white/10 text-white sm:max-w-md text-center">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-serif">Solicitud recibida</DialogTitle>
            <DialogDescription asChild>
              <div className="text-base space-y-3 text-white/60">
                {detalleSolicitud && (
                  <>
                    <p className="text-white/80">
                      {detalleSolicitud.personas} personas · {formatearFechaLarga(detalleSolicitud.fecha)} · {detalleSolicitud.hora} h
                    </p>
                    <p>
                      {detalleSolicitud.grupoGrande
                        ? "Al ser un grupo grande, nuestro equipo revisa El Reservado personalmente: disponibilidad, hora y distribución del espacio."
                        : "Nuestro equipo revisará la disponibilidad de El Reservado para la fecha y hora indicadas."}
                      {" "}Si hiciera falta, te propondremos una hora alternativa antes de confirmar nada.
                    </p>
                    <p>Te hemos enviado un correo confirmando que la hemos recibido, y te escribiremos en breve para cerrar los detalles.</p>
                    <p className="text-sm text-white/40">
                      ¿Prefieres hablarlo directamente? Llámanos al{" "}
                      <a href={TELEFONO_HREF} className="text-primary underline underline-offset-2">{TELEFONO_TEXTO}</a>.
                    </p>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowRecibidaDialog(false)}
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
          >
            Entendido
          </Button>
        </DialogContent>
      </Dialog>

      {/* Rechazo real (blacklist, fecha inválida, sin hueco, límite ya
          alcanzado, fallo de red…). Nunca genérico: siempre con el motivo y,
          cuando lo hay, el mensaje que manda el propio servidor. */}
      <Dialog open={rechazo !== null} onOpenChange={(abierto) => !abierto && setRechazo(null)}>
        <DialogContent className="bg-black border-white/10 text-white sm:max-w-md text-center">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-9 h-9 text-amber-400" />
            </div>
            <DialogTitle className="text-2xl font-serif">{rechazo?.titulo ?? TEXTOS_RECHAZO.title}</DialogTitle>
            <DialogDescription asChild>
              <div className="text-base space-y-3 text-white/60">
                {rechazo && (
                  <>
                    <p className="text-white/80">{rechazo.mensaje}</p>
                    <p>{rechazo.salida}</p>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setRechazo(null)}
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
          >
            {TEXTOS_RECHAZO.close}
          </Button>
        </DialogContent>
      </Dialog>

      <Layout>
        <Seo
          title="El Reservado - Eventos Privados"
          description="Celebra tus eventos más especiales en El Reservado de Touza. Un espacio exclusivo para reuniones privadas, cumpleaños y celebraciones en Crevillente."
          canonical={canonical("/reservado")}
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
              imagen={IMAGENES.local}
              alt="El Reservado"
              className="w-full h-full object-cover"
              sizes="100vw"
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
                className="text-primary text-xs tracking-[0.3em] uppercase mb-3 md:mb-4 block font-medium"
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
        <section className="py-12 md:py-32 bg-black">
          <div className="max-w-5xl mx-auto px-6">
            <div className={cn(
              "grid gap-x-5 gap-y-8 md:gap-16",
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
                  <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 md:mb-5 rounded-full bg-white/5 flex items-center justify-center">
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
        <section className="py-12 md:py-32 bg-background">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-8 md:mb-16">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: appleEase }}
                className="text-primary text-xs tracking-[0.3em] uppercase mb-3 md:mb-4 block font-medium"
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
                    {/* <picture> con `contents`: el <img> sigue siendo hijo
                        directo del contenedor, misma maquetación que antes. */}
                    <picture className="contents">
                      <source type="image/avif" srcSet={image.avif} sizes="75vw" />
                      <source type="image/webp" srcSet={image.webp} sizes="75vw" />
                      <img
                        src={image.src}
                        width={image.width}
                        height={image.height}
                        alt={`Espacio privado El Reservado de Touza en Crevillente - vista ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
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
                    {/* <picture> con `contents`: el <img> sigue siendo hijo
                        directo del contenedor, misma maquetación que antes. */}
                    <picture className="contents">
                      <source type="image/avif" srcSet={image.avif} sizes="(min-width: 768px) 33vw, calc(100vw - 3rem)" />
                      <source type="image/webp" srcSet={image.webp} sizes="(min-width: 768px) 33vw, calc(100vw - 3rem)" />
                      <img
                        src={image.src}
                        width={image.width}
                        height={image.height}
                        alt={`Espacio privado El Reservado de Touza en Crevillente - vista ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-8 md:mt-10">
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
        <section className="py-12 md:py-32 bg-black">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-8 md:mb-12">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: appleEase }}
                className="text-primary text-xs tracking-[0.3em] uppercase mb-3 md:mb-4 block font-medium"
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
              className="space-y-4 md:space-y-5"
            >
              <div className="grid gap-4 md:gap-5 md:grid-cols-2">
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
                <div>
                  <label htmlFor="telefono" className="block text-xs text-white/40 uppercase tracking-wider mb-2">Teléfono *</label>
                  <Input id="telefono" name="telefono" type="tel" required autoComplete="tel" inputMode="tel" value={formData.telefono} onChange={handleChange}
                    className="h-14 bg-white/5 border-white/10 focus:border-white/30 rounded-xl text-white placeholder:text-white/20" placeholder="600 000 000" />
                </div>
                <div>
                  <label htmlFor="fecha" className="block text-xs text-white/40 uppercase tracking-wider mb-2">Fecha *</label>
                  <Input id="fecha" name="fecha" type="date" required min={manana()} value={formData.fecha} onChange={handleChange}
                    className="h-14 bg-white/5 border-white/10 focus:border-white/30 rounded-xl text-white [color-scheme:dark]" />
                </div>
                <div>
                  <label htmlFor="hora" className="block text-xs text-white/40 uppercase tracking-wider mb-2">Hora *</label>
                  <Input id="hora" name="hora" type="time" required value={formData.hora} onChange={handleChange}
                    className="h-14 bg-white/5 border-white/10 focus:border-white/30 rounded-xl text-white [color-scheme:dark]" />
                </div>
                <div>
                  <label htmlFor="personas" className="block text-xs text-white/40 uppercase tracking-wider mb-2">Personas *</label>
                  <Input id="personas" name="personas" type="number" required min="1" max="20" inputMode="numeric" value={formData.personas} onChange={handleChange}
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar solicitud"
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Solicitud sin compromiso: te confirmaremos la disponibilidad de El Reservado antes de nada.
              </p>
            </motion.form>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Reservado;

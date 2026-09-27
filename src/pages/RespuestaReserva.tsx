import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, Info, Loader2, MapPin, Phone, Users, XCircle } from "lucide-react";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import {
  ErrorConexion,
  formatearFecha,
  leerToken,
  llamarEnlace,
  textosEstado,
  textosSinConexion,
  type RespuestaEnlace,
  type Tono,
} from "@/lib/respuesta-reserva";
import { type TipoFallo } from "@/lib/supabase-functions";

/**
 * /reserva/respuesta?token=... — página de los botones "Aceptar" / "Rechazar"
 * de los correos de reserva de El Reservado (ver `src/lib/respuesta-reserva.ts`,
 * mismo fichero que en casa-tomas-story).
 *
 * El SSG prerenderiza solo el cascarón ("Cargando…"): el token se lee en el
 * navegador (useEffect), nunca en el build, y la página es `noindex`.
 * Dos pasos: al abrirla solo se CONSULTA; la acción la lanza el botón (POST).
 */
type Fase =
  | { tipo: "cargando" }
  | { tipo: "sin_token" }
  | { tipo: "lista"; respuesta: RespuestaEnlace; enviando: boolean }
  // `fallo` decide de quién es la culpa en el mensaje: solo si el dispositivo
  // no tiene red se le pide al visitante que la compruebe. En cualquier otro
  // caso (5xx, CORS, la función caída) el fallo es NUESTRO y se dice así.
  | { tipo: "sin_conexion"; reintentar: "consultar" | "ejecutar"; fallo: TipoFallo };

const PHONE_HREF = "tel:+34966782000";
const PHONE_DISPLAY = "966 782 000";

const ICONO: Record<Tono, typeof Info> = {
  exito: CheckCircle2,
  aviso: AlertTriangle,
  peligro: XCircle,
  neutro: Info,
};

const COLOR_ICONO: Record<Tono, string> = {
  exito: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30",
  aviso: "text-amber-300 bg-amber-500/10 border-amber-400/30",
  peligro: "text-red-300 bg-red-500/10 border-red-400/30",
  neutro: "text-primary bg-primary/10 border-primary/30",
};

const RespuestaReserva = () => {
  const [fase, setFase] = useState<Fase>({ tipo: "cargando" });
  const tokenRef = useRef<string | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  const consultar = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return setFase({ tipo: "sin_token" });
    setFase({ tipo: "cargando" });
    try {
      setFase({ tipo: "lista", respuesta: await llamarEnlace("consultar", token), enviando: false });
    } catch (e) {
      if (!(e instanceof ErrorConexion)) console.error("[respuesta-reserva]", e);
      const fallo = e instanceof ErrorConexion ? e.tipo : "servidor";
      setFase({ tipo: "sin_conexion", reintentar: "consultar", fallo });
    }
  }, []);

  const ejecutar = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;
    setFase((f) => (f.tipo === "lista" ? { ...f, enviando: true } : f));
    try {
      setFase({ tipo: "lista", respuesta: await llamarEnlace("ejecutar", token), enviando: false });
    } catch (e) {
      if (!(e instanceof ErrorConexion)) console.error("[respuesta-reserva]", e);
      const fallo = e instanceof ErrorConexion ? e.tipo : "servidor";
      setFase({ tipo: "sin_conexion", reintentar: "ejecutar", fallo });
    }
  }, []);

  useEffect(() => {
    tokenRef.current = leerToken(window.location.search);
    void consultar();
  }, [consultar]);

  // Al cambiar de estado, el foco va al título: el lector de pantalla anuncia el resultado.
  const clave = fase.tipo === "lista" ? `${fase.respuesta.estado}-${fase.enviando}` : fase.tipo;
  useEffect(() => {
    if (fase.tipo !== "cargando") tituloRef.current?.focus();
  }, [clave, fase.tipo]);

  const negocio = fase.tipo === "lista" ? fase.respuesta.negocio : null;
  const telHref = negocio?.telefonoDigits ? `tel:+34${negocio.telefonoDigits}` : PHONE_HREF;
  const telTexto = negocio?.telefonoTexto || PHONE_DISPLAY;
  const nombreNegocio = negocio?.nombre || "Touza";

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col">
      <Seo title="Tu reserva" description="Responde a la propuesta de reserva de Touza." noindex />

      <header className="px-4 py-6 flex justify-center">
        <Link
          to="/"
          className="font-serif text-2xl font-bold tracking-[0.3em] text-primary rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Touza, ir al inicio"
        >
          TOUZA
        </Link>
      </header>

      <main className="flex-1 flex items-start sm:items-center justify-center px-4 pb-10 pt-2 sm:py-12">
        <section
          className="w-full max-w-md rounded-3xl border border-white/10 bg-card/80 p-6 sm:p-8 shadow-2xl"
          aria-busy={fase.tipo === "cargando" || (fase.tipo === "lista" && fase.enviando)}
        >
          <div aria-live="polite">
            {fase.tipo === "cargando" ? (
              <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground" role="status">
                <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
                <p>Cargando tu reserva…</p>
              </div>
            ) : fase.tipo === "sin_token" ? (
              <Estado
                tituloRef={tituloRef}
                tono="neutro"
                titulo="Falta el enlace de tu correo"
                parrafos={["Abre esta página desde el botón del correo que te enviamos."]}
              />
            ) : fase.tipo === "sin_conexion" ? (
              <>
                {/* Título y párrafos salen de `textosSinConexion`: solo se le
                    pide comprobar la conexión cuando de verdad no tiene red;
                    si el fallo es nuestro se dice y se le da el teléfono. */}
                <Estado
                  tituloRef={tituloRef}
                  tono="aviso"
                  {...textosSinConexion(fase.fallo, fase.reintentar, telTexto)}
                />
                <Button
                  className="mt-6 w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 text-base font-medium"
                  onClick={() => void (fase.reintentar === "ejecutar" ? ejecutar() : consultar())}
                >
                  Reintentar
                </Button>
              </>
            ) : (
              <Contenido fase={fase} tituloRef={tituloRef} nombreNegocio={nombreNegocio} onConfirmar={ejecutar} />
            )}
          </div>

          <p className="mt-8 pt-5 border-t border-white/10 text-center text-sm text-muted-foreground">
            ¿Dudas? Llámanos al{" "}
            <a href={telHref} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {telTexto}
            </a>
          </p>
        </section>
      </main>
    </div>
  );
};

function Estado({
  tituloRef,
  tono,
  titulo,
  parrafos,
}: {
  tituloRef: React.RefObject<HTMLHeadingElement>;
  tono: Tono;
  titulo: string;
  parrafos: string[];
}) {
  const Icono = ICONO[tono];
  return (
    <div className="text-center">
      <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border ${COLOR_ICONO[tono]}`}>
        <Icono className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 ref={tituloRef} tabIndex={-1} className="font-serif text-2xl sm:text-3xl text-white outline-none">
        {titulo}
      </h1>
      {parrafos.map((p) => (
        <p key={p} className="mt-3 text-base leading-relaxed text-white/60">
          {p}
        </p>
      ))}
    </div>
  );
}

function Contenido({
  fase,
  tituloRef,
  nombreNegocio,
  onConfirmar,
}: {
  fase: Extract<Fase, { tipo: "lista" }>;
  tituloRef: React.RefObject<HTMLHeadingElement>;
  nombreNegocio: string;
  onConfirmar: () => void;
}) {
  const { respuesta, enviando } = fase;
  const textos = textosEstado(respuesta, nombreNegocio);
  const d = respuesta.detalles;
  const rechazar = respuesta.accion === "rechazar";

  return (
    <>
      <Estado tituloRef={tituloRef} tono={textos.tono} titulo={textos.titulo} parrafos={textos.parrafos} />

      {textos.conDetalles && d ? (
        <dl className="mt-6 space-y-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm">
          <Dato icono={CalendarDays} etiqueta="Fecha" valor={formatearFecha(d.fecha)} />
          <Dato icono={Clock} etiqueta="Hora" valor={d.hora} />
          <Dato icono={Users} etiqueta="Personas" valor={String(d.comensales)} />
          {d.espacio ? <Dato icono={MapPin} etiqueta="Espacio" valor={d.espacio} /> : null}
        </dl>
      ) : null}

      {respuesta.estado === "pendiente" && textos.boton ? (
        <div className="mt-6 flex flex-col gap-3">
          <Button
            size="lg"
            className={
              rechazar
                ? "w-full h-14 rounded-2xl bg-red-600 text-white hover:bg-red-600/90 text-base font-medium"
                : "w-full h-14 rounded-2xl bg-white text-black hover:bg-white/90 text-base font-medium"
            }
            disabled={enviando}
            onClick={onConfirmar}
          >
            {enviando ? <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> : null}
            {enviando ? "Enviando…" : textos.boton}
          </Button>
          {rechazar ? (
            <Button asChild variant="ghost" className="w-full h-14 rounded-2xl text-white/70 hover:bg-white/10 hover:text-white text-base">
              <Link to="/">No, volver a la web</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <Button
          asChild
          variant="outline"
          className="mt-6 w-full h-14 rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white text-base"
        >
          <Link to="/">Ir a la web de Touza</Link>
        </Button>
      )}
    </>
  );
}

function Dato({ icono: Icono, etiqueta, valor }: { icono: typeof Info; etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icono className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <dt className="text-white/50">{etiqueta}</dt>
      <dd className="ml-auto text-right font-medium text-white first-letter:uppercase">{valor}</dd>
    </div>
  );
}

export default RespuestaReserva;

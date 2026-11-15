/**
 * Frases de hechos de la portada, generadas desde `NEGOCIO` (src/lib/negocio.ts)
 * para que el horario de la web sea siempre el mismo que el del JSON-LD. Antes
 * estaba escrito a mano en cuatro sitios (hero, «Lo que nos define»,
 * «Visítanos» y el menú del móvil).
 */
import { NEGOCIO } from "@/lib/negocio";

/**
 * Nombre de la localidad para el texto visible. `NEGOCIO.localidad` es
 * «Crevillente» porque es la dirección postal; la gente busca «copas en
 * Crevillent» (auditoría SEO del 15/11/2026, hallazgo 9).
 */
export const LOCALIDAD = "Crevillent";

const SEMANA = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const DIA: Record<string, string> = {
  Monday: "lunes",
  Tuesday: "martes",
  Wednesday: "miércoles",
  Thursday: "jueves",
  Friday: "viernes",
  Saturday: "sábado",
  Sunday: "domingo",
};

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

/** Días seguidos de la semana (jueves, viernes, sábado). */
function sonSeguidos(dias: readonly string[]): boolean {
  const posiciones = dias.map((d) => SEMANA.indexOf(d as (typeof SEMANA)[number]));
  return posiciones.every((p, i) => p >= 0 && (i === 0 || p === posiciones[i - 1] + 1));
}

/** ["Thursday","Friday","Saturday"] → "jueves a sábado"; ["Sunday"] → "domingo". */
export function nombreDias(dias: readonly string[]): string {
  const nombres = dias.map((d) => DIA[d] ?? d);
  if (nombres.length === 1) return nombres[0];
  if (nombres.length >= 3 && sonSeguidos(dias)) return `${nombres[0]} a ${nombres[nombres.length - 1]}`;
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

/** "02:00" → "hasta las 2:00"; "01:30" → "hasta la 1:30"; "00:00" → "hasta medianoche". */
export function hastaLaHora(hora: string): string {
  if (hora === "00:00" || hora === "24:00") return "hasta medianoche";
  const [h, m] = hora.split(":");
  const horaSinCero = String(Number(h));
  return `hasta ${horaSinCero === "1" ? "la" : "las"} ${horaSinCero}:${m}`;
}

/**
 * "Abrimos de jueves a sábado hasta las 2:00 y el domingo hasta medianoche."
 * Solo días y cierre: es lo que decide si aún da tiempo a ir.
 */
export function fraseHorario(horarios = NEGOCIO.horarios): string {
  const tramos = horarios.map((h) => {
    const dias = nombreDias(h.dias);
    const prefijo = h.dias.length > 1 && dias.includes(" a ") ? "de" : "el";
    return `${prefijo} ${dias} ${hastaLaHora(h.cierra)}`;
  });
  const lista = tramos.length > 1 ? `${tramos.slice(0, -1).join(", ")} y ${tramos[tramos.length - 1]}` : tramos[0];
  return `Abrimos ${lista}.`;
}

/** Línea de hechos bajo el hero: horario y que no se reserva. */
export function lineaDeHechos(horarios = NEGOCIO.horarios): string {
  return `${fraseHorario(horarios)} Sin reservas: ven directamente.`;
}

/** Filas para una tabla de horario: [{ dias: "Jueves a sábado", horas: "20:00 – 02:00" }, …]. */
export function filasHorario(horarios = NEGOCIO.horarios): { dias: string; horas: string }[] {
  return horarios.map((h) => ({ dias: mayuscula(nombreDias(h.dias)), horas: `${h.abre} – ${h.cierra}` }));
}

/**
 * Contrato de `POST /crear` de la Edge Function `reservas-web`
 * (adminpanelct/supabase/functions/reservas-web/index.ts) y traducción de
 * sus rechazos a algo que el visitante pueda entender y resolver.
 *
 * Adaptado de casa-tomas-story/src/lib/reservas-web.ts. Solo se porta el
 * contrato de `/crear`: El Reservado no usa `POST /disponibilidad` — a
 * diferencia de una mesa normal, el espacio privado no se reserva contra
 * huecos ya calculados por el motor de disponibilidad, se SOLICITA (el
 * cliente propone fecha/hora/espacio y el restaurante contraoferta si hace
 * falta), así que no hay nada que "consultar" antes de enviar la solicitud.
 *
 * Regla de la función (ver handleCrear en el fichero citado arriba): TODO
 * rechazo trae `motivo` + `mensaje` legible en el cuerpo, y el único 2xx de
 * éxito es 201. `if (!response.ok) throw` se comería ese cuerpo — hay que
 * leerlo siempre, también en 4xx/409/403.
 */

/** Nombre de la salida que se le ofrece al visitante tras un rechazo. */
export type SalidaRechazo =
  | "call"
  | "otherTime"
  | "otherTimeOrCall"
  | "otherDate"
  | "guests"
  | "checkForm"
  | "retryOrCall";

export type TextosRechazo = {
  title: string;
  close: string;
  /** 400: entrada malformada, la función NO manda `mensaje`. */
  invalidMessage: string;
  /** 5xx o fallo de red. */
  errorMessage: string;
  /** Rechazo sin `mensaje` legible por cualquier otro motivo. */
  fallbackMessage: string;
  exits: Record<SalidaRechazo, string>;
};

export type RechazoReserva = {
  /** `motivo` tal cual viene de la función, o `null` si no venía. */
  motivo: string | null;
  /** Lo que se le enseña al visitante. Se prioriza el `mensaje` del servidor. */
  mensaje: string;
  /** Qué puede hacer a continuación. */
  salida: string;
};

/**
 * Salida por `motivo`. Los motivos son los del contrato cerrado de la
 * función; ninguna regla de negocio se reimplementa aquí.
 *
 * `grupo_grande` está mapeado por completitud/red de seguridad, pero en la
 * práctica Reservado.tsx lo intercepta ANTES de llegar aquí: para El
 * Reservado ese motivo no es un fallo, es el camino esperado ("solicitud a
 * revisar" en vez de "reserva automática" — ver informe de la tarea).
 */
const SALIDA_POR_MOTIVO: Record<string, SalidaRechazo> = {
  // 403 — blacklist. El servidor manda un mensaje NEUTRO a propósito, que no
  // revela que existe una lista. No se enriquece ni se matiza.
  no_disponible: "call",
  grupo_grande: "guests",
  numero_comensales_fuera_de_rango: "guests",
  reserva_hoy: "call",
  corte_horario: "otherTimeOrCall",
  fecha_pasada: "otherDate",
  fecha_demasiado_lejana: "otherDate",
  // 409 — conflicto con el estado actual, no lo arregla reenviando igual.
  max_reservas_telefono: "call",
  max_reservas_email: "call",
  sin_disponibilidad: "otherTime",
};

/** Salida de reserva cuando no hay `motivo` reconocible. */
function salidaPorEstado(status: number): SalidaRechazo {
  if (status === 400 || status === 422) return "checkForm";
  if (status === 403 || status === 409) return "call";
  return "retryOrCall";
}

/**
 * Traduce una respuesta no-201 de `/crear` a título + mensaje + salida.
 *
 * `status` 0 representa "ni siquiera hubo respuesta" (fallo de red o de CORS).
 */
export function interpretarRechazoReserva(
  status: number,
  cuerpo: unknown,
  textos: TextosRechazo,
): RechazoReserva {
  const objeto =
    cuerpo && typeof cuerpo === "object" && !Array.isArray(cuerpo)
      ? (cuerpo as Record<string, unknown>)
      : null;

  const motivo = typeof objeto?.motivo === "string" && objeto.motivo ? objeto.motivo : null;
  const mensajeServidor =
    typeof objeto?.mensaje === "string" && objeto.mensaje.trim() ? objeto.mensaje.trim() : null;

  const salida = (motivo && SALIDA_POR_MOTIVO[motivo]) || salidaPorEstado(status);

  let mensaje: string;
  if (mensajeServidor) {
    mensaje = mensajeServidor;
  } else if (status === 400) {
    // Los 400 son los únicos rechazos SIN `mensaje`: el cuerpo trae `error`
    // (`nombre_requerido`, `fecha_invalida`…), que es un código para el log,
    // no un texto para enseñar.
    mensaje = textos.invalidMessage;
  } else if (status === 0 || status >= 500) {
    mensaje = textos.errorMessage;
  } else {
    mensaje = textos.fallbackMessage;
  }

  return { motivo, mensaje, salida: textos.exits[salida] };
}

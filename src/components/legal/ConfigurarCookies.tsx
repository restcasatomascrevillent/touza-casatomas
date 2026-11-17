import { guardarConsentimiento, useConsentimiento } from "@/lib/consentimiento";

const ESTADO: Record<"accepted" | "rejected" | "none", string> = {
  accepted: "Has aceptado las cookies del mapa de Google.",
  rejected: "Has rechazado las cookies del mapa de Google.",
  none: "Todavía no has elegido: el mapa de Google no se carga.",
};

const BOTON =
  "min-h-[44px] px-5 rounded-full border border-white/25 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-pressed:bg-white aria-pressed:text-black aria-pressed:border-white";

/**
 * Estado actual del consentimiento y los dos botones para cambiarlo. Ya no
 * hay aviso de cookies en toda la web (solo el mapa de /contacto las usa, y
 * se pide allí mismo): esta es la forma de cambiar de opinión, en cualquier
 * momento y tan fácil como darlo (art. 7.3 RGPD). «Permitir» y «No permitir»
 * pesan lo mismo; el elegido queda marcado. En el HTML del SSG sale
 * «Todavía no has elegido» (no hay localStorage en Node); al hidratar se pone
 * el valor real.
 */
const ConfigurarCookies = () => {
  const consentimiento = useConsentimiento();

  return (
    <div className="my-8 rounded-2xl border border-white/10 bg-card p-5 md:p-6 flex flex-col gap-4 sm:flex-row sm:items-center">
      <p className="flex-1 text-sm text-white/75 !mb-0" aria-live="polite">
        {ESTADO[consentimiento ?? "none"]}
      </p>
      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Cookies del mapa de Google">
        <button
          type="button"
          onClick={() => guardarConsentimiento("accepted")}
          aria-pressed={consentimiento === "accepted"}
          className={BOTON}
        >
          Permitir
        </button>
        <button
          type="button"
          onClick={() => guardarConsentimiento("rejected")}
          aria-pressed={consentimiento === "rejected"}
          className={BOTON}
        >
          No permitir
        </button>
      </div>
    </div>
  );
};

export default ConfigurarCookies;

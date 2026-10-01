import { reiniciarConsentimiento, useConsentimiento } from "@/lib/consentimiento";

const ESTADO: Record<"accepted" | "rejected" | "none", string> = {
  accepted: "Has aceptado las cookies del mapa de Google.",
  rejected: "Has rechazado las cookies del mapa de Google.",
  none: "Todavía no has elegido: el mapa de Google no se carga.",
};

/**
 * Estado actual del consentimiento + botón que lo borra y vuelve a abrir el
 * aviso de cookies. En el HTML del SSG sale "Todavía no has elegido" (no hay
 * localStorage en Node); al hidratar se pone el valor real.
 */
const ConfigurarCookies = () => {
  const consentimiento = useConsentimiento();

  return (
    <div className="my-8 rounded-2xl border border-white/10 bg-card p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <p className="flex-1 text-sm text-white/75 !mb-0" aria-live="polite">
        {ESTADO[consentimiento ?? "none"]}
      </p>
      <button
        type="button"
        onClick={reiniciarConsentimiento}
        className="min-h-[44px] px-6 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Configurar cookies
      </button>
    </div>
  );
};

export default ConfigurarCookies;

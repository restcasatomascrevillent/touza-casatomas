import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useCocteles, transformCoctelesToUI, type Coctel } from "../useCocteles";

// ---------------------------------------------------------------------------
// Mock del cliente Supabase
// ---------------------------------------------------------------------------
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // sin reintentos para que los tests fallen rápido
        gcTime: 0,
      },
    },
  });
}

function wrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

// Cóctel de muestra
const mockCoctelA: Coctel = {
  id: "c-1",
  nombre: "Negroni Touza",
  descripcion: "Nuestra versión del clásico italiano",
  precio_eur: 9.5,
  imagen_url: "https://example.com/negroni.jpg",
  categoria: "clasicos",
  base: "gin",
  ingredientes: "Ginebra, Campari, Vermut rojo",
  orden: 1,
  // "leche" es sinónimo de "lacteos" en @/lib/alergenos — comprueba que la
  // normalización de vocabulario funciona igual que en casa-tomas-story.
  alergenos_oficiales: ["sulfitos", "leche"],
  alergenos_notas: "Contiene trazas de frutos secos",
};

const mockCoctelB: Coctel = {
  id: "c-2",
  nombre: "Mocktail Touza",
  descripcion: null,
  precio_eur: 6,
  imagen_url: null,
  categoria: "sin-alcohol",
  base: "sin-alcohol",
  ingredientes: null,
  orden: 2,
  alergenos_oficiales: null,
  alergenos_notas: null,
};

// ---------------------------------------------------------------------------
// Utilidad para construir el mock de la cadena de Supabase
//   supabase.from(...).select(...).eq(...).order(...)[.eq(...)]
//
// `useCocteles` llama opcionalmente a un segundo `.eq('touza', true)` sobre
// el resultado de `.order(...)`, y luego hace `await` de lo que quede. Igual
// que el query builder real de supabase-js, el mock tiene que ser a la vez
// ENCADENABLE (select/eq/order devuelven el propio chain) y AWAITABLE en
// cualquier punto de la cadena (es una Promise de verdad con esos métodos
// añadidos encima).
// ---------------------------------------------------------------------------
function mockSupabaseChain(result: { data: unknown; error: unknown }) {
  const chain: any = Object.assign(Promise.resolve(result), {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
  });
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  vi.mocked(supabase.from).mockReturnValue(chain as any);
  return chain;
}

// ---------------------------------------------------------------------------
// Tests del hook useCocteles
// ---------------------------------------------------------------------------

describe("useCocteles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna cócteles cuando Supabase responde con datos", async () => {
    mockSupabaseChain({ data: [mockCoctelA, mockCoctelB], error: null });

    const qc = buildQueryClient();
    const { result } = renderHook(() => useCocteles(), {
      wrapper: wrapper(qc),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].nombre).toBe("Negroni Touza");
    expect(result.current.isError).toBe(false);
  });

  it("pone isError=true cuando Supabase devuelve error", async () => {
    mockSupabaseChain({
      data: null,
      error: { message: "connection refused", code: "PGRST000" },
    });

    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });

    const { result } = renderHook(() => useCocteles(), {
      wrapper: wrapper(qc),
    });

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 }
    );

    expect((result.current.error as Error).message).toContain(
      "No se pudieron cargar los cócteles"
    );
  });

  it("consulta la tabla 'Cocteles' pidiendo select('*') y filtrando activado=true y touza=true por defecto", async () => {
    const chain = mockSupabaseChain({ data: [], error: null });

    const qc = buildQueryClient();
    const { result } = renderHook(() => useCocteles(), {
      wrapper: wrapper(qc),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(supabase.from).toHaveBeenCalledWith("Cocteles");
    // select('*') ya trae alergenos_oficiales/alergenos_notas: no hace falta
    // listar columnas a mano aquí (a diferencia del SELECT explícito de
    // Platos en usePlatos.ts, que sí tuvo que ampliarse).
    expect(chain.select).toHaveBeenCalledWith("*");
    expect(chain.eq).toHaveBeenCalledWith("activado", true);
    expect(chain.eq).toHaveBeenCalledWith("touza", true);
    expect(chain.order).toHaveBeenCalledWith("orden", { ascending: true });
  });
});

// ---------------------------------------------------------------------------
// Tests de transformCoctelesToUI (función pura — no necesita QueryClient)
//
// Cubren el hallazgo de la auditoría §3 T1 para cócteles: igual que en
// Platos, `alergenos_oficiales`/`alergenos_notas` llegaban de Supabase pero
// no se mapeaban al UI.
// ---------------------------------------------------------------------------

describe("transformCoctelesToUI", () => {
  it("transforma correctamente los campos básicos de un cóctel", () => {
    const result = transformCoctelesToUI([mockCoctelA]);
    expect(result).toHaveLength(1);
    const ui = result[0];
    expect(ui.id).toBe("c-1");
    expect(ui.name).toBe("Negroni Touza");
    expect(ui.price).toBe("9,50€");
    expect(ui.ingredients).toEqual(["Ginebra", "Campari", "Vermut rojo"]);
  });

  it("mapea alergenos_oficiales a etiquetas legibles, normalizando sinónimos", () => {
    const result = transformCoctelesToUI([mockCoctelA]);
    // "sulfitos" -> "Sulfitos", "leche" -> se normaliza a "lacteos" -> "Lácteos"
    expect(result[0].alergenos).toEqual(["Sulfitos", "Lácteos"]);
  });

  it("mapea alergenos_notas cuando trae texto", () => {
    const result = transformCoctelesToUI([mockCoctelA]);
    expect(result[0].alergenosNota).toBe("Contiene trazas de frutos secos");
  });

  // Criterio legal explícito: sin `alergenos_oficiales` no es "sin
  // alérgenos", es que NO CONSTA. `alergenos: []` es la señal que usa
  // Carta.tsx para pintar el aviso en vez de inventar un dato.
  it("devuelve alergenos: [] y alergenosNota: null cuando no constan (no 'sin alérgenos')", () => {
    const result = transformCoctelesToUI([mockCoctelB]);
    expect(result[0].alergenos).toEqual([]);
    expect(result[0].alergenosNota).toBeNull();
  });

  it("retorna [] cuando se pasa undefined", () => {
    expect(transformCoctelesToUI(undefined)).toEqual([]);
  });
});

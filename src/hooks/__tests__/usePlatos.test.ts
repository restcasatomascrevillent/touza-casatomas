import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { usePlatosTouza, transformPlatosToUI, type PlatoTouza } from "../usePlatos";

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
        retry: false,       // sin reintentos para que los tests fallen rápido
        gcTime: 0,
      },
    },
  });
}

function wrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

// Plato de muestra
const mockPlatoA: PlatoTouza = {
  id: "abc-1",
  nombre: "Croquetas de jamón",
  descripcion: "Suaves croquetas caseras",
  precio_eur: 7.5,
  imagen_url: "https://example.com/croquetas.jpg",
  categoria: "tapas",
  alergenos_oficiales: ["gluten", "leche"],
};

const mockPlatoB: PlatoTouza = {
  id: "abc-2",
  nombre: "Patatas bravas",
  descripcion: null,
  precio_eur: 5,
  imagen_url: null,       // sin imagen → debe usar placeholder
  categoria: "tapas",
  alergenos_oficiales: null,
};

// ---------------------------------------------------------------------------
// Utilidad para construir el mock de la cadena de Supabase
//   supabase.from(...).select(...).eq(...).eq(...).order(...)
// ---------------------------------------------------------------------------
function mockSupabaseChain(result: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(result),
  };
  vi.mocked(supabase.from).mockReturnValue(chain as any);
  return chain;
}

// ---------------------------------------------------------------------------
// Tests del hook usePlatosTouza
// ---------------------------------------------------------------------------

describe("usePlatosTouza", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna platos cuando Supabase responde con datos", async () => {
    mockSupabaseChain({ data: [mockPlatoA, mockPlatoB], error: null });

    const qc = buildQueryClient();
    const { result } = renderHook(() => usePlatosTouza(), {
      wrapper: wrapper(qc),
    });

    // Mientras carga, isLoading debe ser true
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].nombre).toBe("Croquetas de jamón");
    expect(result.current.data?.[1].imagen_url).toBeNull();
    expect(result.current.isError).toBe(false);
  });

  it("retorna array vacío cuando Supabase devuelve [] (sin platos con touza=true)", async () => {
    mockSupabaseChain({ data: [], error: null });

    const qc = buildQueryClient();
    const { result } = renderHook(() => usePlatosTouza(), {
      wrapper: wrapper(qc),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  it("pone isError=true cuando Supabase devuelve error", async () => {
    mockSupabaseChain({
      data: null,
      error: { message: "connection refused", code: "PGRST000" },
    });

    // QueryClient sin reintentos Y también sobreescribimos el hook a nivel de queryClient
    const qc = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,   // sobreescribe el retry:2 del hook
          gcTime: 0,
        },
      },
    });

    const { result } = renderHook(() => usePlatosTouza(), {
      wrapper: wrapper(qc),
    });

    // waitFor con timeout generoso para esperar que el query falle
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 }
    );

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toContain(
      "No se pudieron cargar las tapas"
    );
  });

  it("isLoading=true mientras carga, false al terminar con éxito", async () => {
    mockSupabaseChain({ data: [mockPlatoA], error: null });

    const qc = buildQueryClient();
    const { result } = renderHook(() => usePlatosTouza(), {
      wrapper: wrapper(qc),
    });

    // Estado inicial: cargando
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeDefined();
  });

  it("consulta la tabla 'Platos' filtrando por activado=true y touza=true", async () => {
    const chain = mockSupabaseChain({ data: [], error: null });

    const qc = buildQueryClient();
    const { result } = renderHook(() => usePlatosTouza(), {
      wrapper: wrapper(qc),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(supabase.from).toHaveBeenCalledWith("Platos");
    expect(chain.eq).toHaveBeenCalledWith("activado", true);
    expect(chain.eq).toHaveBeenCalledWith("touza", true);
    expect(chain.order).toHaveBeenCalledWith("orden", { ascending: true });
  });
});

// ---------------------------------------------------------------------------
// Tests de transformPlatosToUI (función pura — no necesita QueryClient)
// ---------------------------------------------------------------------------

describe("transformPlatosToUI", () => {
  it("transforma correctamente un plato con todos los campos", () => {
    const result = transformPlatosToUI([mockPlatoA]);
    expect(result).toHaveLength(1);
    const ui = result[0];
    expect(ui.id).toBe("abc-1");
    expect(ui.name).toBe("Croquetas de jamón");
    expect(ui.description).toBe("Suaves croquetas caseras");
    expect(ui.price).toBe("7,50€");
    expect(ui.image).toBe("https://example.com/croquetas.jpg");
    expect(ui.categoria).toBe("tapas");
  });

  it("usa /placeholder.svg cuando imagen_url es null", () => {
    const result = transformPlatosToUI([mockPlatoB]);
    expect(result[0].image).toBe("/placeholder.svg");
  });

  it("usa string vacío para nombre y descripción null", () => {
    const platoSinDatos: PlatoTouza = {
      ...mockPlatoB,
      nombre: null,
      descripcion: null,
    };
    const result = transformPlatosToUI([platoSinDatos]);
    expect(result[0].name).toBe("");
    expect(result[0].description).toBe("");
  });

  it("usa string vacío para precio cuando precio_eur es null", () => {
    const platoSinPrecio: PlatoTouza = { ...mockPlatoA, precio_eur: null };
    const result = transformPlatosToUI([platoSinPrecio]);
    expect(result[0].price).toBe("");
  });

  it("retorna [] cuando se pasa undefined", () => {
    expect(transformPlatosToUI(undefined)).toEqual([]);
  });

  it("retorna [] cuando se pasa array vacío", () => {
    expect(transformPlatosToUI([])).toEqual([]);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "layout" }, children),
}));

vi.mock("@/components/Seo", () => ({
  default: () => null,
}));

// framer-motion — sin animaciones
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_: object, tag: string) =>
        React.forwardRef(({ children, ...props }: any, ref: any) =>
          React.createElement(tag, { ...props, ref }, children)
        ),
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// useIsMobile — devuelve false (desktop) por defecto
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

// OptimizedImage — imagen simple para no necesitar carga de red
vi.mock("@/components/ui/optimized-image", () => ({
  OptimizedImage: ({ src, alt }: { src: string; alt: string }) =>
    React.createElement("img", { src, alt }),
}));

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Import bajo test
// ---------------------------------------------------------------------------
import Reservado from "../Reservado";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderReservado() {
  return render(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(Reservado)
    )
  );
}

/** Rellena los campos obligatorios del formulario con valores válidos. */
function rellenarCamposObligatorios(overrides: Partial<Record<string, string>> = {}) {
  const valores = {
    nombre: "María García",
    email: "maria@example.com",
    telefono: "600123456",
    fecha: "2030-01-15",
    hora: "21:00",
    personas: "16",
    ...overrides,
  };
  fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: valores.nombre } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: valores.email } });
  fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: valores.telefono } });
  fireEvent.change(screen.getByLabelText(/^fecha/i), { target: { value: valores.fecha } });
  fireEvent.change(screen.getByLabelText(/^hora/i), { target: { value: valores.hora } });
  fireEvent.change(screen.getByLabelText(/personas/i), { target: { value: valores.personas } });
}

function jsonResponse(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => JSON.stringify(body),
  } as Response;
}

const TEXTO_RECHAZO_TITULO = "No hemos podido enviar tu solicitud";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Reservado — renderizado del formulario", () => {
  it("renderiza el formulario con todos los campos esperados", () => {
    renderReservado();

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^fecha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^hora/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/personas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
  });

  it("muestra el botón de submit con texto 'Enviar solicitud'", () => {
    renderReservado();
    expect(
      screen.getByRole("button", { name: /enviar solicitud/i })
    ).toBeInTheDocument();
  });

  it("muestra el título 'El Reservado' en el héroe", () => {
    renderReservado();
    expect(screen.getByText("El Reservado")).toBeInTheDocument();
  });

  it("muestra el subtítulo 'Solicita información'", () => {
    renderReservado();
    expect(screen.getByText("Solicita información")).toBeInTheDocument();
  });
});

describe("Reservado — validación de campos requeridos", () => {
  it("el campo nombre tiene atributo required", () => {
    renderReservado();
    const input = screen.getByLabelText(/nombre/i) as HTMLInputElement;
    expect(input.required).toBe(true);
  });

  it("el campo email tiene atributo required y type=email", () => {
    renderReservado();
    const input = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.type).toBe("email");
  });

  it("el campo teléfono tiene atributo required y type=tel", () => {
    renderReservado();
    const input = screen.getByLabelText(/teléfono/i) as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.type).toBe("tel");
  });

  it("el campo fecha tiene atributo required y type=date", () => {
    renderReservado();
    const input = screen.getByLabelText(/^fecha/i) as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.type).toBe("date");
  });

  it("el campo hora tiene atributo required y type=time — el cliente elige la hora, no viene fija", () => {
    renderReservado();
    const input = screen.getByLabelText(/^hora/i) as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.type).toBe("time");
  });

  it("el campo personas es requerido y acepta solo valores entre 1 y 20", () => {
    renderReservado();
    const input = screen.getByLabelText(/personas/i) as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.min).toBe("1");
    expect(input.max).toBe("20");
    expect(input.type).toBe("number");
  });
});

describe("Reservado — interacción del formulario", () => {
  it("actualiza el valor del campo nombre al escribir", () => {
    renderReservado();
    const input = screen.getByLabelText(/nombre/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "María García" } });
    expect(input.value).toBe("María García");
  });

  it("actualiza el valor del campo hora al escribir", () => {
    renderReservado();
    const input = screen.getByLabelText(/^hora/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "21:30" } });
    expect(input.value).toBe("21:30");
  });

  it("el estado del formulario se actualiza correctamente con cada cambio de campo", () => {
    renderReservado();

    const campos = [
      { label: /nombre/i, value: "Juan Pérez" },
      { label: /email/i, value: "juan@example.com" },
      { label: /teléfono/i, value: "600 111 222" },
      { label: /personas/i, value: "8" },
      { label: /mensaje/i, value: "Cumpleaños para 8 personas" },
    ];

    campos.forEach(({ label, value }) => {
      const input = screen.getByLabelText(label) as HTMLInputElement | HTMLTextAreaElement;
      fireEvent.change(input, { target: { value } });
      expect(input.value).toBe(value);
    });
  });

  it("el botón queda deshabilitado y muestra 'Enviando...' mientras se envía", async () => {
    let resolverFetch!: (r: Response) => void;
    vi.mocked(fetch).mockReturnValue(new Promise((resolve) => (resolverFetch = resolve)));

    renderReservado();
    rellenarCamposObligatorios();
    fireEvent.submit(screen.getByLabelText(/nombre/i).closest("form")!);

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /enviando/i });
      expect(btn).toBeDisabled();
    });

    // Liberar la promesa pendiente y esperar a que el estado se asiente del
    // todo, para no dejar una actualización colgando tras acabar el test.
    resolverFetch(jsonResponse(201, { ok: true, reserva_id: "abc", estado: "pendiente" }));
    await waitFor(() => {
      expect(screen.getByText("Solicitud recibida")).toBeInTheDocument();
    });
  });
});

describe("Reservado — envío al circuito de solicitud (reservas-web)", () => {
  it("una solicitud normal (201) muestra el diálogo 'Solicitud recibida', no un alert ni un toast silencioso", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(201, { ok: true, reserva_id: "11111111-1111-1111-1111-111111111111", estado: "pendiente" })
    );

    renderReservado();
    rellenarCamposObligatorios({ personas: "8" });
    fireEvent.submit(screen.getByLabelText(/nombre/i).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Solicitud recibida")).toBeInTheDocument();
    });
    // Explica qué pasa a continuación, no un mensaje genérico.
    expect(screen.getByText(/revisará la disponibilidad de El Reservado/i)).toBeInTheDocument();

    // El formulario se limpia tras una solicitud aceptada.
    expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe("");
  });

  it("manda 'marca: touza' explícita en el cuerpo de /crear, y conserva la línea de notas_cliente de El Reservado", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(201, { ok: true, reserva_id: "33333333-3333-3333-3333-333333333333", estado: "pendiente" })
    );

    renderReservado();
    rellenarCamposObligatorios();
    fireEvent.submit(screen.getByLabelText(/nombre/i).closest("form")!);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const cuerpo = JSON.parse((init as RequestInit).body as string);

    // Prioridad 1 de `resolverMarca` (reservas-web/plantillas.ts): con esto
    // la función ya no depende de adivinar la marca por el texto de
    // notas_cliente (prioridad 3, frágil ante un cambio de copy futuro).
    expect(cuerpo.marca).toBe("touza");

    // notas_cliente NO se quita: sigue siendo información útil para el
    // restaurante y además queda como respaldo (prioridad 3) si `marca`
    // no llegara a viajar por algún motivo.
    expect(cuerpo.notas_cliente).toContain(
      "Solicitud de El Reservado (espacio privado, hasta 20 personas)."
    );
  });

  it("motivo 'grupo_grande' (habitual en El Reservado, >12 personas) también se trata como solicitud recibida, no como error", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(422, {
        ok: false,
        motivo: "grupo_grande",
        mensaje: "Para más de 12 personas contacta directamente con el restaurante.",
      })
    );

    renderReservado();
    rellenarCamposObligatorios({ personas: "20" });
    fireEvent.submit(screen.getByLabelText(/nombre/i).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Solicitud recibida")).toBeInTheDocument();
    });
    // Copy específico de grupo grande, no el genérico de rechazo del servidor.
    expect(screen.getByText(/al ser un grupo grande/i)).toBeInTheDocument();
    expect(screen.queryByText(TEXTO_RECHAZO_TITULO)).not.toBeInTheDocument();
  });

  it("un rechazo real (p.ej. blacklist) muestra el diálogo de aviso con el mensaje del servidor, nunca un error genérico silencioso", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(403, { ok: false, motivo: "no_disponible", mensaje: "No ha sido posible formalizar la solicitud." })
    );

    renderReservado();
    rellenarCamposObligatorios();
    fireEvent.submit(screen.getByLabelText(/nombre/i).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(TEXTO_RECHAZO_TITULO)).toBeInTheDocument();
    });
    expect(screen.getByText("No ha sido posible formalizar la solicitud.")).toBeInTheDocument();
    // El formulario NO se limpia en un rechazo: el cliente no tiene que reescribirlo todo.
    expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe("María García");
  });

  it("un fallo de red (sin respuesta) muestra el diálogo de aviso, no una pantalla en blanco", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

    renderReservado();
    rellenarCamposObligatorios();
    fireEvent.submit(screen.getByLabelText(/nombre/i).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(TEXTO_RECHAZO_TITULO)).toBeInTheDocument();
    });
    expect(
      screen.getByText(/no hemos podido conectar con el sistema de reservas/i)
    ).toBeInTheDocument();
  });
});

describe("Reservado — características del espacio", () => {
  it("muestra las 4 características del espacio privado", () => {
    renderReservado();
    expect(screen.getByText("Capacidad")).toBeInTheDocument();
    expect(screen.getByText("Servicio Premium")).toBeInTheDocument();
    expect(screen.getByText("Ambiente Privado")).toBeInTheDocument();
    expect(screen.getByText("Eventos Especiales")).toBeInTheDocument();
  });

  it("contiene un enlace a la galería", () => {
    renderReservado();
    const link = screen.getByRole("link", { name: /galería completa/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/galeria");
  });
});

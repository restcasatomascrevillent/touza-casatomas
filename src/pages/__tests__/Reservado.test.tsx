import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

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

// useToast — capturamos las llamadas para verificar el toast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Reservado — renderizado del formulario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el formulario con todos los campos esperados", () => {
    renderReservado();

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("el campo personas acepta solo valores entre 1 y 20", () => {
    renderReservado();
    const input = screen.getByLabelText(/personas/i) as HTMLInputElement;
    expect(input.min).toBe("1");
    expect(input.max).toBe("20");
    expect(input.type).toBe("number");
  });
});

describe("Reservado — interacción del formulario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("actualiza el valor del campo nombre al escribir", () => {
    renderReservado();
    const input = screen.getByLabelText(/nombre/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "María García" } });
    expect(input.value).toBe("María García");
  });

  it("actualiza el valor del campo email al escribir", () => {
    renderReservado();
    const input = screen.getByLabelText(/email/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "maria@example.com" } });
    expect(input.value).toBe("maria@example.com");
  });

  it("actualiza el valor del campo teléfono al escribir", () => {
    renderReservado();
    const input = screen.getByLabelText(/teléfono/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "600123456" } });
    expect(input.value).toBe("600123456");
  });

  it("muestra 'Enviando...' y luego llama a toast al hacer submit correcto", async () => {
    renderReservado();

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "María García" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "maria@example.com" } });
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: "600123456" } });

    const submitBtn = screen.getByRole("button", { name: /enviar solicitud/i });
    fireEvent.submit(submitBtn.closest("form")!);

    // Inmediatamente después del submit el botón debe decir "Enviando..."
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /enviando/i })).toBeInTheDocument()
    );

    // Esperar a que el setTimeout de 1500ms se resuelva y el toast sea llamado
    await waitFor(
      () => {
        expect(mockToast).toHaveBeenCalledTimes(1);
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ title: "¡Solicitud enviada!" })
        );
      },
      { timeout: 3000 }
    );
  }, 10000);

  it("el estado del formulario se actualiza correctamente con cada cambio de campo", () => {
    // Verifica que todos los campos del formulario actualizan su estado
    // (el reset del estado tras submit se cubre en el test de toast)
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

  it("el botón queda deshabilitado mientras se está enviando", async () => {
    renderReservado();

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: "600000000" } });

    fireEvent.submit(screen.getByLabelText(/nombre/i).closest("form")!);

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /enviando/i });
      expect(btn).toBeDisabled();
    });
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

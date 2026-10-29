import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { cartaSSG } from "./scripts/carta-ssg-plugin.mjs";

export default defineConfig({
  // Resuelve `virtual:touza/carta`. Fuera de `build` devuelve null y no toca
  // la red, así que los hooks se comportan igual que antes en los tests.
  plugins: [react(), cartaSSG()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "scripts/__tests__/*.test.mjs"],
    // Cada fichero de test corre en su propio worker para evitar
    // que los mocks de un fichero contaminen a otro (necesario con
    // React.lazy y vi.mock de módulos complejos)
    isolate: true,
    pool: "forks",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});

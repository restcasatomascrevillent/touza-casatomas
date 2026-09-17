import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./App";
import "./index.css";

// Entry de vite-react-ssg: monta/hidrata en cliente y prerenderiza en build.
// El HelmetProvider lo aporta vite-react-ssg internamente (componente <Head />).
export const createRoot = ViteReactSSG({ routes }, ({ isClient }) => {
  // PWA service worker: solo en cliente (en Node/SSG `navigator` no existe).
  if (isClient && "serviceWorker" in navigator) {
    import("virtual:pwa-register").then(({ registerSW }) => {
      registerSW({ immediate: true });
    });
  }
});

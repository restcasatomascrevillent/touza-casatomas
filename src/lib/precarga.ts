import type { ComponentType } from "react";
import type { ImagenResponsive } from "@/assets/imagenes";

/**
 * Páginas de la web, cada una en su propio trozo de JS (rutas `lazy` de
 * App.tsx). Viven aquí y no en App.tsx para poder pedir el trozo ANTES de
 * navegar: react-router solo llama a `lazy` al pulsar, y entre el toque y la
 * página nueva había un hueco sin respuesta mientras se descargaba (en 4G,
 * medio segundo con la portada quieta y después un fundido a negro).
 *
 * `import()` guarda su promesa: pedirlo dos veces no descarga dos veces, y
 * cuando react-router llama a `lazy` al navegar, el módulo ya está.
 */
type Pagina = () => Promise<{ default: ComponentType }>;

export const PAGINAS = {
  "/": () => import("@/pages/Index"),
  "/carta": () => import("@/pages/Carta"),
  "/galeria": () => import("@/pages/Galeria"),
  "/contacto": () => import("@/pages/Contacto"),
  "/aviso-legal": () => import("@/pages/AvisoLegal"),
  "/privacidad": () => import("@/pages/Privacidad"),
  "/cookies": () => import("@/pages/Cookies"),
  "/404": () => import("@/pages/NotFound"),
} satisfies Record<string, Pagina>;

/**
 * Foto de cabecera de cada página (la que hace de LCP y de elemento
 * compartido en la transición). Se pide junto con el trozo de JS para que la
 * página nueva no entre con la cabecera en negro y la foto apareciendo
 * después.
 */
const FOTO_CABECERA: Record<string, (i: typeof import("@/assets/imagenes")) => ImagenResponsive> = {
  "/carta": (i) => i.IMAGENES.barra,
  "/galeria": (i) => i.IMAGENES.botellas,
  "/contacto": (i) => i.IMAGENES.interior,
};

const pedidas = new Set<string>();

/**
 * vite-react-ssg pone a cada ruta un `loader` que, al navegar, descarga en
 * serie su manifiesto (la primera vez) y el JSON de datos de la página (con
 * esta web, siempre `null`: no usamos loaders). Son dos viajes de red más
 * entre el toque y el cambio de página: en 4G, ~300 ms con la página quieta.
 * Se adelantan aquí y se dejan donde ese loader los busca
 * (`window.__VITE_REACT_SSG_STATIC_LOADER_*`), así al navegar no espera a
 * nada. Si algo falla, no pasa nada: el loader los pide como siempre.
 */
interface VentanaSSG {
  __VITE_REACT_SSG_HASH__?: string;
  __VITE_REACT_SSG_STATIC_LOADER_MANIFEST__?: Record<string, string>;
  __VITE_REACT_SSG_STATIC_LOADER_DATA__?: Record<string, unknown>;
}
let manifiestoSSG: Promise<Record<string, string>> | null = null;

async function precargarDatosSSG(ruta: string) {
  const w = window as unknown as VentanaSSG;
  if (!w.__VITE_REACT_SSG_HASH__ || !document.querySelector("[data-server-rendered=true]")) return;
  manifiestoSSG ??= w.__VITE_REACT_SSG_STATIC_LOADER_MANIFEST__
    ? Promise.resolve(w.__VITE_REACT_SSG_STATIC_LOADER_MANIFEST__)
    : fetch(`/static-loader-data-manifest-${w.__VITE_REACT_SSG_HASH__}.json`).then((r) => r.json());
  const manifiesto = await manifiestoSSG;
  w.__VITE_REACT_SSG_STATIC_LOADER_MANIFEST__ ??= manifiesto;
  const archivo = manifiesto[ruta];
  const datos = (w.__VITE_REACT_SSG_STATIC_LOADER_DATA__ ??= {});
  if (!archivo || ruta in datos) return;
  const json = await fetch(`/${archivo}`).then((r) => r.json());
  datos[ruta] ??= json;
}

/** Pide la foto con el mismo srcset y `sizes` que el <picture> de la página. */
function precargarFoto(imagen: ImagenResponsive) {
  const img = new Image();
  img.decoding = "async";
  img.sizes = "100vw";
  // Con AVIF el navegador elige igual que la <source type="image/avif">.
  img.srcset = imagen.avif || imagen.webp;
  img.src = imagen.src;
}

/**
 * Descarga (una vez) el JS de la página de `ruta` y su foto de cabecera.
 * Rutas desconocidas o externas: no hace nada.
 */
export function precargarRuta(ruta: string) {
  if (typeof window === "undefined") return;
  const limpia = ruta.replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";
  if (pedidas.has(limpia) || !(limpia in PAGINAS)) return;
  pedidas.add(limpia);
  PAGINAS[limpia as keyof typeof PAGINAS]().catch(() => pedidas.delete(limpia));
  precargarDatosSSG(limpia).catch(() => {});
  const foto = FOTO_CABECERA[limpia];
  if (foto) import("@/assets/imagenes").then((m) => precargarFoto(foto(m))).catch(() => {});
}

/**
 * Precarga por intención: al pasar el ratón, enfocar o empezar a tocar un
 * enlace interno. En el móvil `pointerdown` llega ~100 ms antes del `click`,
 * lo justo para adelantar la descarga sin gastar datos en enlaces que nadie
 * toca. Devuelve la función que quita los oyentes.
 */
export function precargarAlApuntar(): () => void {
  const alApuntar = (evento: Event) => {
    const enlace = (evento.target as Element | null)?.closest?.("a[href]");
    if (!(enlace instanceof HTMLAnchorElement)) return;
    if (enlace.origin !== window.location.origin || enlace.target === "_blank") return;
    precargarRuta(enlace.pathname);
  };
  const opciones = { capture: true, passive: true } as const;
  const eventos = ["pointerdown", "mouseover", "focusin"] as const;
  eventos.forEach((e) => document.addEventListener(e, alApuntar, opciones));
  return () => eventos.forEach((e) => document.removeEventListener(e, alApuntar, opciones));
}

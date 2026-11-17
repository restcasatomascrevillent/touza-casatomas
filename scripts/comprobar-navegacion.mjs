// ============================================================================
// Comprueba, con un navegador de verdad, que al NAVEGAR por la web (pulsando
// enlaces, y con atrás/adelante) cada página se ve.
// ----------------------------------------------------------------------------
// Por qué existe: en la demo v0.19 la carta salía en negro al entrar desde un
// enlace (entrando por la URL se veía bien). Los tests de jsdom no pintan ni
// animan; esto sí.
//
// Uso (contra el build servido en local o contra la demo):
//   npm run build && npx vite preview --port 4173
//   node scripts/comprobar-navegacion.mjs http://localhost:4173
//   node scripts/comprobar-navegacion.mjs https://touza-casatomas-git-staging-casa-tomas.vercel.app
//
// Playwright NO es dependencia del repo. Se busca primero aquí y, si no está,
// en la carpeta de PLAYWRIGHT_DIR o en la carpeta desde la que se lanza:
//   cd <carpeta con playwright instalado> && node <repo>/scripts/comprobar-navegacion.mjs <URL>
// Usa el Chrome instalado (`channel: "chrome"`); si no hay, el Chromium de Playwright.
//
// Qué mira tras cada navegación, a los 1,5 s de llegar a la URL nueva, en
// móvil (390×844) y escritorio (1440×900):
//   - la URL es la esperada y no se ha recargado la página (navegación en cliente);
//   - hay un solo <h1>, con tamaño, y él y todos sus ancestros tienen opacidad 1
//     y son visibles (lo mismo <main>, que además tiene alto);
//   - no queda nada tapado por un <Reveal> a medias dentro de la pantalla;
//   - el scroll está arriba o, si el enlace lleva ancla, en la ficha del cóctel;
//   - no hay errores en la consola.
// Sale con código 1 si algo falla.
// ============================================================================
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const base = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("Uso: node scripts/comprobar-navegacion.mjs <URL base>   (p. ej. http://localhost:4173)");
  process.exit(2);
}

async function cargarPlaywright() {
  try {
    return await import("playwright");
  } catch {
    const carpeta = process.env.PLAYWRIGHT_DIR ?? process.cwd();
    return createRequire(pathToFileURL(path.join(carpeta, "_.js")))("playwright");
  }
}

const ESPERA_MS = 1500;
const VISTAS = [
  { nombre: "móvil", movil: true, contexto: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } },
  { nombre: "escritorio", movil: false, contexto: { viewport: { width: 1440, height: 900 } } },
];

// ── Acciones ────────────────────────────────────────────────────────────────

const abrir = (ruta) => async (page) => {
  await page.goto(base + ruta, { waitUntil: "networkidle" });
  // Margen para que React hidrate: un clic antes de tiempo sería una carga
  // normal de página y no probaría la navegación en cliente.
  await page.waitForTimeout(700);
};

/**
 * Enlace del menú: en el móvil hay que abrir antes el panel. La cabecera se
 * esconde al bajar (p. ej. tras llegar a la ficha de un cóctel) y vuelve al
 * subir un poco, que es lo que haría una persona.
 */
const menu = (nombre) => async (page, vista) => {
  const escondida = await page.evaluate(() => document.querySelector("header").getBoundingClientRect().bottom <= 0);
  if (escondida) {
    await page.evaluate(() => window.scrollBy(0, -160));
    await page.waitForTimeout(700);
  }
  if (vista.movil) {
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await page.getByRole("dialog").getByRole("link", { name: nombre, exact: true }).click();
  } else {
    await page.locator("header").getByRole("link", { name: nombre, exact: true }).click();
  }
};

const enlace = (selector) => async (page) => {
  await page.locator(selector).first().click();
};

const atras = async (page) => {
  await page.goBack({ waitUntil: "commit" });
};
const adelante = async (page) => {
  await page.goForward({ waitUntil: "commit" });
};

// ── Recorridos ──────────────────────────────────────────────────────────────
// Cada recorrido abre una página (carga normal) y encadena navegaciones en
// cliente. `ruta` es la esperada; `ancla: true` = la que lleve el enlace.

const PIE = [
  ["logo del pie", 'footer a[aria-label="Touza, ir al inicio"]', "/"],
  ["pie «Inicio»", 'footer nav[aria-label="Pie de página"] a[href="/"]', "/"],
  ["pie «Carta»", 'footer a[href="/carta"]', "/carta"],
  ["pie «Contacto»", 'footer a[href="/contacto"]', "/contacto"],
  ["pie «Copas después de cenar…»", 'footer a[href="/despues-de-cenar"]', "/despues-de-cenar"],
  ["pie «Aviso legal»", 'footer a[href="/aviso-legal"]', "/aviso-legal"],
  ["pie «Privacidad»", 'footer a[href="/privacidad"]', "/privacidad"],
  ["pie «Cookies»", 'footer a[href="/cookies"]', "/cookies"],
];

const COCTEL = 'main a[href^="/carta#"]';

const RECORRIDOS = [
  ...[
    ["Inicio", "/"],
    ["Carta", "/carta"],
    ["Contacto", "/contacto"],
  ].map(([nombre, ruta]) => ({ desde: "/", pasos: [{ nombre: `menú «${nombre}»`, accion: menu(nombre), ruta }] })),
  {
    desde: "/",
    pasos: [
      { nombre: "hero «Ver la carta»", accion: enlace('.hero-portada a[href="/carta"]'), ruta: "/carta" },
      { nombre: "atrás", accion: atras, ruta: "/" },
      { nombre: "adelante", accion: adelante, ruta: "/carta" },
    ],
  },
  {
    desde: "/",
    pasos: [
      { nombre: "hero «Cómo llegar»", accion: enlace('.hero-portada a[href="/contacto"]'), ruta: "/contacto" },
      { nombre: "atrás", accion: atras, ruta: "/" },
      { nombre: "adelante", accion: adelante, ruta: "/contacto" },
    ],
  },
  {
    desde: "/",
    pasos: [
      { nombre: "un cóctel de «La carta»", accion: enlace(COCTEL), ancla: true },
      { nombre: "atrás", accion: atras, ruta: "/" },
      { nombre: "adelante", accion: adelante, ancla: true },
    ],
  },
  {
    desde: "/",
    pasos: [
      { nombre: "«Ver la carta completa»", accion: enlace('main a[href="/carta"]:has-text("carta completa")'), ruta: "/carta" },
      { nombre: "atrás", accion: atras, ruta: "/" },
      { nombre: "adelante", accion: adelante, ruta: "/carta" },
    ],
  },
  {
    desde: "/",
    pasos: [
      { nombre: "«copas después de cenar» (El local)", accion: enlace('main a[href="/despues-de-cenar"]'), ruta: "/despues-de-cenar" },
      { nombre: "atrás", accion: atras, ruta: "/" },
      { nombre: "adelante", accion: adelante, ruta: "/despues-de-cenar" },
    ],
  },
  ...PIE.map(([nombre, selector, ruta]) => ({ desde: "/", pasos: [{ nombre, accion: enlace(selector), ruta }] })),
  {
    desde: "/carta",
    pasos: [
      { nombre: "menú «Contacto»", accion: menu("Contacto"), ruta: "/contacto" },
      { nombre: "pie «Copas después de cenar…»", accion: enlace('footer a[href="/despues-de-cenar"]'), ruta: "/despues-de-cenar" },
      { nombre: "un cóctel de «Para la sobremesa»", accion: enlace(COCTEL), ancla: true },
      { nombre: "menú «Contacto»", accion: menu("Contacto"), ruta: "/contacto" },
      { nombre: "atrás", accion: atras, ancla: true },
      { nombre: "atrás", accion: atras, ruta: "/despues-de-cenar" },
      { nombre: "«Ver la carta de cócteles»", accion: enlace('main a[href="/carta"]'), ruta: "/carta" },
      { nombre: "atrás", accion: atras, ruta: "/despues-de-cenar" },
      { nombre: "«Cómo llegar» (Después de cenar)", accion: enlace('main a[href="/contacto"]'), ruta: "/contacto" },
      { nombre: "menú «Carta»", accion: menu("Carta"), ruta: "/carta" },
      { nombre: "menú «Inicio»", accion: menu("Inicio"), ruta: "/" },
    ],
  },
];

// ── Medición (dentro de la página) ──────────────────────────────────────────

const medir = (page) =>
  page.evaluate(() => {
    const escondidos = (desde) => {
      const lista = [];
      for (let el = desde; el; el = el.parentElement) {
        const cs = getComputedStyle(el);
        if (Number(cs.opacity) < 1 || cs.visibility !== "visible" || cs.display === "none") {
          lista.push(`<${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 40)}"> opacity ${cs.opacity}, ${cs.visibility}, ${cs.display}`);
        }
      }
      return lista;
    };
    const h1s = [...document.querySelectorAll("h1")];
    const h1 = h1s[0];
    const main = document.querySelector("main");
    const cajaH1 = h1?.getBoundingClientRect();
    const slug = decodeURIComponent(location.hash.slice(1));
    const destino = slug ? document.getElementById(slug) : null;
    // <Reveal> que sigue tapado estando ya dentro de la pantalla.
    const revealAtascados = [...document.querySelectorAll('[data-reveal="pendiente"]')].filter((el) => {
      const caja = el.getBoundingClientRect();
      return caja.top < innerHeight * 0.85 && caja.bottom > 0;
    }).length;
    return {
      ruta: location.pathname.replace(/(.)\/+$/, "$1") + location.hash,
      sinRecarga: window.__sinRecarga === true,
      numH1: h1s.length,
      h1: h1 ? h1.innerText.replace(/\s+/g, " ").trim().slice(0, 40) : null,
      h1ConTamano: !!cajaH1 && cajaH1.width > 0 && cajaH1.height > 0,
      h1Escondido: h1 ? escondidos(h1) : ["no hay <h1>"],
      mainEscondido: main ? escondidos(main) : ["no hay <main>"],
      altoMain: main ? Math.round(main.getBoundingClientRect().height) : 0,
      revealAtascados,
      scrollY: Math.round(scrollY),
      anclaTop: destino ? Math.round(destino.getBoundingClientRect().top) : null,
      altoPantalla: innerHeight,
    };
  });

function fallosDe(m, esperada, conAncla, errores) {
  const fallos = [];
  if (m.ruta !== esperada) fallos.push(`URL ${m.ruta} (esperada ${esperada})`);
  if (!m.sinRecarga) fallos.push("la página se recargó: no fue navegación en cliente");
  if (m.numH1 !== 1) fallos.push(`${m.numH1} <h1>`);
  if (!m.h1ConTamano) fallos.push("<h1> sin tamaño");
  if (m.h1Escondido.length) fallos.push(`<h1> escondido por ${m.h1Escondido[m.h1Escondido.length - 1]}`);
  if (m.mainEscondido.length) fallos.push(`<main> escondido por ${m.mainEscondido[m.mainEscondido.length - 1]}`);
  if (m.altoMain < 300) fallos.push(`<main> de ${m.altoMain} px de alto`);
  if (m.revealAtascados) fallos.push(`${m.revealAtascados} bloque(s) tapados dentro de la pantalla`);
  if (conAncla) {
    if (m.anclaTop === null) fallos.push("no existe la ficha del ancla");
    else if (m.anclaTop < 0 || m.anclaTop > m.altoPantalla * 0.6) fallos.push(`la ficha del ancla queda a ${m.anclaTop} px del borde de arriba`);
  } else if (m.scrollY > 2) fallos.push(`scroll a ${m.scrollY} px (no arriba)`);
  if (errores.length) fallos.push(`${errores.length} error(es) de consola: ${errores[0]}`);
  return fallos;
}

// ── Ejecución ───────────────────────────────────────────────────────────────

const { chromium } = await cargarPlaywright();
const navegador = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const filas = [];

for (const vista of VISTAS) {
  const contexto = await navegador.newContext(vista.contexto);
  const page = await contexto.newPage();
  let errores = [];
  page.on("console", (mensaje) => {
    if (mensaje.type() !== "error") return;
    // Fuera de Vercel (vite preview) el script de Analytics da 404: es lo esperado.
    if (mensaje.location().url.includes("/_vercel/")) return;
    errores.push(mensaje.text().slice(0, 160));
  });
  page.on("pageerror", (error) => errores.push(`excepción: ${String(error).slice(0, 160)}`));

  for (const recorrido of RECORRIDOS) {
    await abrir(recorrido.desde)(page);
    await page.evaluate(() => {
      window.__sinRecarga = true;
    });
    // Último enlace con ancla pulsado: es adonde vuelven atrás/adelante.
    let ultimaAncla = null;
    // Si un paso no se puede hacer, los siguientes ya no parten de donde deben.
    let roto = false;
    for (const paso of recorrido.pasos) {
      errores = [];
      let esperada = paso.ruta;
      let fallos;
      if (roto) {
        filas.push({ vista: vista.nombre, desde: "↳", paso: paso.nombre, esperada: esperada ?? "(ancla)", fallos: ["sin probar: falló un paso anterior del recorrido"] });
        continue;
      }
      try {
        if (paso.ancla) {
          const esClic = paso.accion !== atras && paso.accion !== adelante;
          if (esClic) ultimaAncla = await page.locator(COCTEL).first().getAttribute("href");
          esperada = ultimaAncla;
        }
        await paso.accion(page, vista);
        // El reloj corre desde que la URL es la nueva (ahí se pinta la página):
        // lo que tarde la red en traer el trozo de JS de esa página no cuenta.
        // Si la URL no llega a cambiar, lo dirá la comprobación.
        await page.waitForFunction((ruta) => location.pathname.replace(/(.)\/+$/, "$1") + location.hash === ruta, esperada, { timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(ESPERA_MS);
        fallos = fallosDe(await medir(page), esperada, !!paso.ancla, errores);
      } catch (error) {
        fallos = [`no se pudo hacer: ${String(error).split("\n")[0].slice(0, 160)}`];
        roto = true;
      }
      filas.push({ vista: vista.nombre, desde: recorrido.pasos[0] === paso ? recorrido.desde : "↳", paso: paso.nombre, esperada: esperada ?? "(ancla)", fallos });
    }
  }
  await contexto.close();
}
await navegador.close();

// ── Informe ─────────────────────────────────────────────────────────────────

console.log(`\nNavegación en ${base} · comprobado a los ${ESPERA_MS} ms de cada navegación\n`);
console.log("| Vista | Desde | Acción | Llega a | Resultado |");
console.log("|---|---|---|---|---|");
for (const fila of filas) {
  console.log(`| ${fila.vista} | ${fila.desde} | ${fila.paso} | ${fila.esperada} | ${fila.fallos.length ? `FALLA: ${fila.fallos.join("; ")}` : "bien"} |`);
}
console.log("");
let hayFallos = false;
for (const vista of VISTAS) {
  const suyas = filas.filter((fila) => fila.vista === vista.nombre);
  const bien = suyas.filter((fila) => !fila.fallos.length).length;
  if (bien !== suyas.length) hayFallos = true;
  console.log(`${vista.nombre}: ${bien} de ${suyas.length} navegaciones correctas`);
}
process.exit(hayFallos ? 1 : 0);

# Auditoría de diseño y QA — web de Touza (octubre 2026)

- **Rama:** `revision-diseno-touza` (sobre `f50cd0c`, ya sin la escena 3D del hero)
- **Fecha:** 01/10/2026
- **Alcance:** las 7 rutas (`/`, `/carta`, `/galeria`, `/reservado`, `/contacto`, `/reserva/respuesta`, 404), a 320, 375, 1440 y 1920 px, con el servidor de desarrollo y el build SSG (`dist/`).
- **Método:** recorrido manual en navegador (ratón, teclado y táctil emulado), inspección del DOM y de los estilos calculados, revisión del HTML prerenderizado, consola y red, y lectura del código.
- **Seguridad:** no se ha enviado ninguna reserva real ni se ha pulsado ninguna acción de los enlaces de los correos. El envío del formulario de El Reservado y los estados de `/reserva/respuesta` se han probado con `fetch` interceptado en el navegador. Los datos de prueba eran ficticios.

La web no tiene modo claro: es solo oscura. No hay conmutador de tema y no se ha añadido.

## Resumen

| Severidad | Encontrados | Corregidos | Pendientes / propuesta |
|---|---|---|---|
| Crítico | 3 | 3 | 0 |
| Alto | 12 | 11 | 1 (texto legal) |
| Medio | 17 | 14 | 3 |
| Bajo | 9 | 4 | 5 |

Los tres críticos afectaban a **todas** las páginas:

1. **La cabecera dejaba de ser fija.** `PageTransition` terminaba con `filter: blur(0px)`, y cualquier `filter` convierte al elemento en el bloque contenedor de sus hijos `position: fixed`. Por eso la cabecera se iba con el scroll y el menú no se podía usar fuera de la parte alta de la página.
2. **El HTML prerenderizado llegaba invisible.** Toda la página salía con `opacity:0; filter: blur(8px)` (el `initial` de framer-motion se escribe como estilo en línea), y además el hero llevaba otro `opacity:0` propio. El SSG no servía para la primera pintura: no se veía nada hasta que React hidrataba.
3. **En móvil la portada daba un salto completo.** El SSG solo prerenderizaba la versión de escritorio, porque `useIsMobile()` vale `false` en Node. Un móvil veía primero "TOUZA" a 160 px cortado y, al hidratar, la página entera se cambiaba por la versión móvil.

## Hallazgos por página

Columnas: **Sev.** = severidad · **Cat.** = categoría · **Estado** = ✅ corregido (con su commit), 📝 queda como propuesta o decisión, ⏸ no se toca.

### Global (layout, cabecera, transiciones y scroll)

| # | Sev. | Cat. | Hallazgo y evidencia | Estado |
|---|---|---|---|---|
| G1 | Crítico | Bug funcional | Cabecera no fija: `filter: blur(0px)` en el contenedor de la transición. Con `scrollY=2400`, `header.getBoundingClientRect().top` daba `-2400`. | ✅ `925a653` |
| G2 | Crítico | Rendimiento | HTML del SSG con `opacity:0; blur(8px)` en todas las páginas (53 estilos `opacity:0` en `dist/index.html`). Ahora la primera página no se anima y las demás navegaciones sí. | ✅ `925a653` |
| G3 | Alto | Bug funcional | Al navegar, la página nueva se abría a la altura de scroll de la anterior. Por ejemplo, Galería desde el pie se abría en `y=2819`, al final. Ahora se sube arriba al terminar la transición, pasando también por Lenis. | ✅ `925a653` |
| G4 | Alto | Bug funcional | Las barras `sticky` (pestañas de la carta, filtros de la galería) no se pegaban nunca, porque `overflow-x: hidden` en `Layout` crea un contenedor de scroll. Con 9 pestañas y listas de vinos largas, había que volver arriba para cambiar de sección. | ✅ `9b9800a` |
| G5 | Medio | UX | Las barras pegajosas iban a 52/60 px fijos, así que con la cabecera oculta quedaba una franja hueca. Ahora siguen a la cabecera mediante `--offset-cabecera`. | ✅ `9b9800a` |
| G6 | Alto | Accesibilidad | `prefers-reduced-motion` solo afectaba a las animaciones CSS. Parallax, rebotes infinitos, Lenis y el cursor propio seguían activos. Ahora hay `MotionConfig reducedMotion="user"`, Lenis desactivado, el cursor desactivado y `animation-delay: 0`. | ✅ `925a653`, `8d3ef43`, `d3c0951` |
| G7 | Medio | Bug funcional | El bucle `requestAnimationFrame` de Lenis seguía vivo después de destruir Lenis. | ✅ `925a653` |
| G8 | Medio | Bug funcional | Lenis capturaba la rueda dentro de diálogos y del menú, así que el contenido con scroll del diálogo de cóctel no se movía. Se añade `data-lenis-prevent`. | ✅ `371fb26` |
| G9 | Medio | Accesibilidad | La barra de scroll estaba oculta en todo el sitio: en escritorio no había indicación de posición ni forma de arrastrar. Ahora es fina y oscura. | ✅ `d3c0951` |
| G10 | Alto | Accesibilidad | Foco de teclado casi invisible sobre negro. Ahora hay un `outline` dorado por defecto en todo lo interactivo, más anillos propios en tarjetas, filtros y botones. | ✅ `d3c0951` y siguientes |
| G11 | Alto | Accesibilidad | Contraste: muchos textos al 25–45 % de blanco (≈2–4:1) en descripciones, etiquetas, pie, navegación inactiva y avisos. Se suben al 55–70 % (≥4,5:1). | ✅ varios |
| G12 | Medio | Accesibilidad | El menú móvil (Sheet) no tenía título y Radix lo marcaba como error en consola. El botón de cerrar decía "Close". | ✅ `371fb26` |
| G13 | Bajo | Accesibilidad | No había `aria-current` en el enlace activo y el logo no tenía nombre accesible. | ✅ `371fb26` |
| G14 | Medio | Bug funcional | A 320 px el botón "Reservar" de la barra fija móvil se salía 9 px de la pantalla. | ✅ `ebd1ba7` |
| G15 | Medio | Diseño | Una imagen que falla mostraba el texto gris "Error al cargar imagen". Ahora se ve un relleno con la marca y se conserva el `alt`. | ✅ `ebd1ba7` |
| G16 | Medio | Rendimiento | Quedan secciones bajo el pliegue con `opacity:0` en el HTML (reveals de `whileInView`). Si el JS tarda o falla, esas secciones no se ven. | ✅ P4 (todo el sitio) |

### Portada (`/`)

| # | Sev. | Cat. | Hallazgo y evidencia | Estado |
|---|---|---|---|---|
| H1 | Crítico | Rendimiento / Diseño | Salto completo en móvil al hidratar (ver resumen). Ahora el HTML lleva las dos composiciones y CSS (`md:`) decide cuál se ve desde el primer pintado. Tras montar, se desmonta la que no se usa sin volver a montar la visible. | ✅ `8d3ef43` |
| H2 | Alto | Rendimiento | La foto del hero (candidata a LCP) tenía un fundido de opacidad de 2 s y titular, subtítulo y botones salían con `opacity:0` hasta hidratar. Ahora la entrada es una animación CSS (`.entrada-hero`) y la foto no tiene fundido. | ✅ `8d3ef43` |
| H3 | Medio | Diseño | Hero de escritorio sin la escena 3D: queda bien con foto, ondas doradas y halo. El parallax dejaba un corte duro contra la sección siguiente; se añade un fundido inferior. | ✅ `8d3ef43` |
| H4 | Medio | SEO | Con un `<Seo>` en cada composición, el JSON-LD se habría duplicado. Ahora hay uno solo, en `Index`. | ✅ `8d3ef43` |
| H5 | Medio | UX | En "Visítanos", dirección, teléfono y email eran texto suelto: en el móvil no se podía llamar ni abrir el mapa desde la portada. | ✅ `d3c0951` |
| H6 | Bajo | Diseño | Ritmo de escritorio: había unos 400 px de aire entre Filosofía y la primera vitrina. | ✅ `0212741` |
| H7 | Bajo | Diseño | El titular móvil "TOUZA" a 3,5 rem quedaba pequeño para un hero. Sube a 4,25 rem. | ✅ `8d3ef43` |
| H8 | Medio | Contenido | El hero dice "Est. 2023" y las cifras dicen "5 Años de experiencia" y "200+ cócteles creados", mientras la carta tiene 12. Son datos que el dueño debe confirmar o cambiar. | 📝 Decisión |
| H9 | Bajo | Diseño | Las dos vitrinas ("Cócteles de Autor" y "El Reservado") usan exactamente la misma maquetación: imagen 16:9 y texto centrado. Se ven repetitivas. | 📝 P2 |
| H10 | Bajo | Contenido | En móvil la vitrina se llama "El Privado" y en escritorio "El Reservado". | ⏸ No cambiado por si es intencionado (decisión) |

### Carta (`/carta`)

| # | Sev. | Cat. | Hallazgo y evidencia | Estado |
|---|---|---|---|---|
| C1 | Alto | Bug funcional | En móvil, la fila de filtros (Todos / De Autor / …) desbordaba por los dos lados, y "Todos" quedaba cortado sin poder llegar a él (captura `antes-movil-carta-todos-cortado.jpg`). | ✅ `6ad3a85` |
| C2 | Alto | Accesibilidad | Las tarjetas de cóctel solo se abrían con ratón (`onClick` en un `div`). Ahora tienen un botón con nombre ("Ver detalle de X, precio"). Comprobado: con Enter se abre el detalle. | ✅ `6ad3a85` |
| C3 | Alto | Accesibilidad | Avisos de alérgenos en `text-destructive` (rojo oscuro, ≈2:1 sobre negro), justo el texto que más importa leer. Ahora en rojo claro legible. | ✅ `6ad3a85` |
| C4 | Medio | UX | Una búsqueda sin resultados dejaba la lista en blanco. Ahora muestra un estado vacío con "Borrar búsqueda". | ✅ `6ad3a85` |
| C5 | Medio | UX | La búsqueda distinguía tildes, así que "pina" no encontraba "Piña". Ahora es insensible a mayúsculas y diacríticos. | ✅ `6ad3a85` |
| C6 | Medio | Accesibilidad | El buscador no tenía etiqueta (solo placeholder) y el botón de borrar no tenía nombre y medía 16 px. | ✅ `6ad3a85` |
| C7 | Medio | Bug funcional | En el diálogo de detalle en móvil, el texto largo (ingredientes y alérgenos) se salía por abajo. Ahora es a pantalla completa con scroll. | ✅ `6ad3a85` |
| C8 | Bajo | Bug funcional | El detalle mostraba el id interno de la categoría ("CLASICOS") en vez de su nombre ("Clásicos"). | ✅ `6ad3a85` |
| C9 | Medio | Rendimiento | `useIsMobile` decidía alturas y rejillas, lo que provocaba un salto al hidratar en móvil. Se cambia por clases responsive. | ✅ `6ad3a85` |
| C10 | Alto | Contenido / datos | La foto del **Clover Club** en Supabase es una URL de Unsplash que da **404**, y el JSON-LD `Menu` anuncia esa imagen. La foto del **Pornstar Martini** es de un vaso de whisky. Todas las fotos de cóctel son de stock. | 📝 Corregir en el panel (datos de producción, fuera del alcance de esta rama) |
| C11 | Bajo | Contenido | "Sin información de alérgenos — consulte al personal" usa "usted", mientras el resto de la web tutea. | ⏸ Copy compartido en `lib/alergenos.ts`; decidir el tono |
| C12 | Bajo | Código | El estado `selectedBase` no se usaba (no tenía controles). | ✅ eliminado en `6ad3a85` |

### Galería (`/galeria`)

| # | Sev. | Cat. | Hallazgo y evidencia | Estado |
|---|---|---|---|---|
| GA1 | Alto | Accesibilidad | Las fotos solo se abrían con clic (0 elementos enfocables en la rejilla). Ahora cada foto tiene un botón "Ampliar foto: …". | ✅ `1c2cff5` |
| GA2 | Medio | Accesibilidad | El visor no tenía título (error de Radix en consola) y no respondía a ← / →. Los botones eran "←" y "→" en texto. | ✅ `1c2cff5` |
| GA3 | Bajo | Rendimiento | Se importaban los CSS de `yet-another-react-lightbox` sin usar la librería. | ✅ `1c2cff5` (la dependencia sigue en `package.json`: P6) |
| GA4 | Medio | Diseño | La rejilla con fotos 2×2 podía dejar huecos. Se añade `grid-flow-dense` y clases responsive. | ✅ `1c2cff5` |
| GA5 | Alto | Contenido | Las 5 fotos de "Cócteles" son de Unsplash (ya figuraba como pendiente en el código), y "Evento en El Reservado" repite la foto de la barra. | 📝 Faltan fotos reales del dueño |

### El Reservado (`/reservado`) y formulario

| # | Sev. | Cat. | Hallazgo y evidencia | Estado |
|---|---|---|---|---|
| R1 | Alto | Bug funcional | En móvil (y en tablet a 4 columnas) el selector de fecha no cabía y el icono del calendario salía cortado. Ahora la rejilla es de 2 columnas, con fecha y hora a lo ancho en móvil. | ✅ `213d931` |
| R2 | Medio | Bug funcional | `manana()` usaba `toISOString()` (UTC). Entre las 00:00 y las 02:00 de Madrid, el mínimo del selector era el día de hoy. | ✅ `213d931` |
| R3 | Medio | UX | El selector de hora aceptaba cualquier hora sin avisar de que el local abre de noche. Ahora el horario aparece bajo los campos, enlazado con `aria-describedby`. | ✅ `213d931` |
| R4 | Medio | Accesibilidad | Etiquetas al 40 %, placeholders al 20 % y bordes de campo casi invisibles. | ✅ `213d931` |
| R5 | Alto | Legal / UX | El formulario recoge nombre, email y teléfono **sin información básica de protección de datos** (responsable, finalidad, derechos) y sin enlace a una política de privacidad, que no existe. | 📝 P1 (texto legal: decisión humana) |
| R6 | — | QA | Comprobado con `fetch` interceptado: la validación nativa bloquea el envío vacío y lleva el foco al primer campo; con un 201 aparece el diálogo "Solicitud recibida" con los datos. El rechazo, `grupo_grande`, el 500 y el fallo de red ya los cubren los tests. | ✅ sin cambios |
| R7 | Bajo | Contenido | La foto del hero ("El Reservado") muestra botellas y no el espacio privado. El carrusel presentaba un mojito y un bodegón de champán como "Espacio privado El Reservado - vista N". | ✅ Textos alternativos que dicen lo que enseña cada foto y carrusel "El ambiente de Touza" (barra, sala principal, botellas). 📝 Siguen faltando fotos reales de la sala |

### Contacto (`/contacto`) y cookies

| # | Sev. | Cat. | Hallazgo y evidencia | Estado |
|---|---|---|---|---|
| K1 | Alto | Legal / Bug funcional | "Rechazar" se guardaba en `localStorage`, pero nadie lo leía: el iframe de Google Maps (cookies de terceros) cargaba igual. Ahora solo carga con "Aceptar" o con "Cargar mapa"; sin consentimiento, se ofrece "Abrir en Google Maps". | ✅ `77f8bf8` |
| K2 | Alto | Legal / UX | El aviso decía "Al navegar aceptas su uso" (consentimiento implícito) y "Más información" tenía `href="#"`, que solo subía al principio de la página. | ✅ `77f8bf8` (falta la página de la política: P1) |
| K3 | Medio | Bug funcional | El embed del mapa llevaba un `place id` inventado (`0x4a1234567890abcd`) y una marca de tiempo de ejemplo. El `sandbox` bloqueaba "Ampliar el mapa". | ✅ `77f8bf8`: embed por dirección. 📝 Que el dueño confirme que el pin cae en el local |
| K4 | Bajo | Diseño | El aviso de cookies usaba colores hex sueltos (`#D4A574`) en vez de los del tema, y sus botones medían menos de 44 px. | ✅ `77f8bf8` |
| K5 | Medio | Rendimiento | Contacto también usaba `useIsMobile` para tamaños. | ✅ `77f8bf8` |
| K6 | Bajo | Diseño | La cabecera de Contacto (y la de Galería) es un bloque negro con un titular. Funciona, pero es la parte más genérica del sitio. | 📝 P2 |

### Pie, 404 y respuesta a la reserva

| # | Sev. | Cat. | Hallazgo y evidencia | Estado |
|---|---|---|---|---|
| F1 | Medio | Bug funcional | El teléfono del pie era `tel:966782000`, sin +34: falla al llamar con una SIM extranjera. Faltaba el email. | ✅ `d3c0951` |
| F2 | Bajo | UX | El CTA "Reserva tu experiencia" tenía como botón solo "El Reservado". Ahora dice "Solicita El Reservado". | ✅ `d3c0951` |
| N1 | Medio | UX | El 404 no tenía cabecera ni pie (solo "Volver al inicio") y hacía `console.error` en cada visita, bots incluidos. | ✅ `6002bcc` |
| RR1 | Bajo | UX | `/reserva/respuesta` sin token era el único estado final sin botón a la web. | ✅ `67f01eb` |
| RR2 | — | QA | Sin token: "Falta el enlace de tu correo" ✅. Con un token inventado, la consulta real falla por CORS desde `localhost` (la función solo admite los orígenes de producción) y aparece "el fallo es nuestro" con "Reintentar" ✅. Con la respuesta simulada `invalido` aparece "Este enlace ya no es válido" ✅. No se ha pulsado ninguna acción. | ✅ sin cambios |

### SEO (comprobado en `dist/`)

- `<title>`, `description` y `canonical` son propios en cada ruta. El 404 y `/reserva/respuesta` llevan `noindex, nofollow`. Hay un único JSON-LD (`BarOrPub` en la portada y `Menu` en la carta).
- La portada lleva ahora dos `<h1>` en el HTML estático (el de móvil y el de escritorio, uno de ellos con `display:none` según el ancho). Es un efecto conocido de H1 y aceptable; si se quiere uno solo, ver P3.
- Pendiente de antes, sin cambio: el dominio definitivo no está decidido (`VITE_SITE_URL` apunta a vercel.app).

## Propuestas (no implementadas: cambian la dirección o necesitan una decisión)

- **P1 · Textos legales (Alto).** Hace falta crear la política de privacidad y la de cookies. También hay que añadir la información básica de protección de datos bajo el formulario de El Reservado (responsable, finalidad, base legal, derechos y enlace), con el "Más información" del aviso de cookies apuntando a esa página. Necesita el texto del responsable del tratamiento: no se ha inventado.
- **P2 · Variedad de maquetación.** Para que la portada y las páginas interiores parezcan menos plantilla: alternar las vitrinas de la portada (la segunda con imagen a un lado y texto al otro) y dar a Galería y Contacto una cabecera con foto, como ya tienen Carta y El Reservado. Es una decisión de dirección visual y por eso no se ha aplicado.
  - ✅ **Hecho** (`a544842`, `4f553e4`, `ef5bf40`). Vitrinas de dos columnas desde `md`, la segunda invertida, fotos en vertical (el 16:9 recortaba fotos que son verticales) y una foto de detalle superpuesta en escritorio; en móvil se mantiene foto 3:4 y botón a lo ancho. Galería (botellas de la barra) y Contacto (interior) tienen cabecera con foto como Carta. Contacto pone datos y mapa en dos columnas desde `lg`. Las cifras de la portada pasan a una lista editorial numerada ("Lo que nos define").
- **P3 · Portada en un solo árbol responsive.** La solución de H1 (las dos composiciones en el HTML, controladas con CSS) es segura e inmediata. A medio plazo, unificar `IndexDesktop` e `IndexMobile` en un solo árbol con clases `md:` reduciría el HTML (de 35 a 63 KB) y dejaría un único `<h1>`.
  - ✅ **Hecho** (`a544842`). `Index` es un solo árbol (`Hero`, `Showcase`, `Claves`, `VisitUs`) sin `useIsMobile`: `dist/index.html` lleva un único `<h1>` y pesa 41,5 KB. Comprobado a 320, 375, 768, 1024, 1440 y 1920 px: sin desbordamiento horizontal, sin salto al hidratar y la foto del hero (LCP) con `fetchpriority="high"`, sin fundido y con el recorte vertical en móvil.
- **P4 · Reveals sin depender del JS.** Pasar los `whileInView` a una clase CSS que se activa con `IntersectionObserver`, o añadir un `<noscript>` que fuerce `opacity:1`, para que nada quede invisible si el JS tarda o falla.
  - ✅ **Hecho** en portada, Galería y Contacto (`ed69e6c`, `4f553e4`, `ef5bf40`) y con `<noscript>` para todo el sitio (`92c1d3c`). Nuevo `<Reveal>`: el HTML sale visible y solo se oculta, ya en el navegador, lo que está bajo el pliegue al montar; con `prefers-reduced-motion` no se anima. `ScrollTextReveal` ya no vuelca `opacity:0.15` por palabra. Quedan `whileInView` en Carta, El Reservado y el CTA del pie (otros dueños): sin JS los cubre el `<noscript>`, pero con JS lento siguen ocultos hasta hidratar.
  - ✅ **Completado** en Carta (tarjetas de cóctel, filas de vinos y bebidas, tapas), El Reservado (ventajas, galería, formulario), el CTA "Reserva tu experiencia" del pie (en todas las páginas) y el 404 (que pasa a `.entrada-hero`, como los heroes). Ya no queda ningún `whileInView` en `src/`. Los retrasos escalonados ya no crecen con la posición: con `index * 0.04` el vino 60 de una lista esperaba 2,4 s después de llegar a la pantalla. En `dist/` solo queda `opacity:0` en el CSS del `<noscript>` y en el SVG decorativo del hero de escritorio.
- **P5 · Fotos reales.** Sustituir las fotos de stock de cócteles (en Supabase y en la galería), las rotas (Clover Club) y las que no corresponden (Pornstar Martini, El Reservado).
  - 📝 Parcial (`4f553e4`): en la galería cada `alt` describe ya lo que muestra la foto, se quitaron los duplicados y el filtro "El Reservado" (no hay ninguna foto real de la sala). Siguen faltando las fotos.
- **P6 · Limpieza de dependencias.** `yet-another-react-lightbox` ya no se importa en ningún sitio. Quitarla del `package.json` cuando se vaya a tocar el lockfile.
  - ✅ **Hecho** (`c7c02b3`).
- **Decisiones del dueño sobre H8 y H10** ✅ (`09e0c2d`, `a544842`). Se habla de "cinco años" de experiencia y no hay ningún año de fundación ("Est. 2023" fuera; no había `foundingDate` en el JSON-LD). Fuera "200+ cócteles creados". La sala privada se llama El Reservado en todas partes (adiós a "El Privado").
- **P7 · Ficha de Google Business.** Cuando exista, sustituir el embed por dirección por el de la ficha oficial y añadir `hasMap` al JSON-LD (ver la nota de `src/lib/negocio.ts`).

## Lo que no se ha podido probar

- **Envío real del formulario y acciones reales de `/reserva/respuesta`:** van contra producción y quedan excluidos a propósito. Se han probado con `fetch` simulado y con los tests.
- **Consulta real de un enlace desde `localhost`:** la Edge Function rechaza ese origen por CORS (es lo esperado).
- **Gestos táctiles reales (swipe del visor):** el panel emula un móvil, pero los clics llegan como ratón. El código del arrastre no ha cambiado.
- **Lectores de pantalla reales:** se ha revisado el árbol de accesibilidad, no se ha probado con NVDA ni VoiceOver.
- **Lighthouse / Web Vitals medidos:** el panel de pruebas limita los fotogramas cuando está oculto, así que los tiempos no serían fiables. La mejora del LCP se deduce del HTML generado: hero, titulares y fotos de cabecera ya no salen con `opacity:0`.

## Verificación

- `npm run typecheck` ✅.
- `npm run build` ✅ (SSG de las 7 rutas, PWA y sitemap).
- `npm test`: 125/126 en el árbol de trabajo. El único fallo (`App.routes › /carta`) lo provoca un cambio **sin commitear de otro trabajo en curso** sobre `usePlatos`/`Carta.tsx` (la función `useMostrarFotosPlatosTouza`, que falta en el mock del test). No viene de esta auditoría: en un worktree limpio de `HEAD` pasan todos los tests que no necesitan `.env`.
- `npm run lint`: 45 problemas, todos anteriores (eran 46: desaparece el `any` de `Galeria.tsx`). Ninguno nuevo.

### Segunda pasada (01/10/2026, tarde)

- **Vinos sin orden estable.** `Vinos.orden` es texto y vale "0" (o null) en las 184 filas: el orden del HTML prerenderizado y el del refresco del navegador podían no coincidir, y como texto "10" iría antes que "2". Ahora `ordenarVinos` (`src/lib/carta-consultas.mjs`, compartido por los hooks y el plugin del build) ordena por `orden` numérico, nombre sin mayúsculas ni tildes e id. `agruparVinosPorTipo` desempata las denominaciones con el mismo número de vinos. Comprobado: los 37 champagnes salen en el mismo orden en el JSON-LD de `dist/carta.html` que en una consulta nueva.
- **Peso de la carta.** Cócteles, vinos y bebidas pedían `select=*` (en Vinos, 36 columnas, casi todo traducciones). Ahora solo las columnas que se usan. La instantánea dentro del chunk de la carta pasa de 213 KB a 64 KB: chunk `Carta-*.js` de 431 KB a 282 KB (81,2 → 73,8 KB con gzip). `dist/carta.html` queda igual (100,8 → 101,1 KB): no lleva la instantánea, y cambia el orden de los vinos del JSON-LD.
- **El 404 de cada página** con `npm run preview` es `/_vercel/insights/script.js` (Vercel Web Analytics). Solo existe en Vercel: en producción responde 200. No es un fallo.

## Revisión móvil (01/10/2026, noche)

- **Petición del dueño:** "hay que trabajar mucho la vista móvil". Su captura (≈440×950) enseñaba la portada con la foto del sofá a pantalla completa, sin titular, sin frase y sin botones, la barra "Llamar | Reservar" y un punto negro sobre "Reservar".
- **Método:** Chromium y WebKit sin cabeza (Playwright, emulación de móvil táctil) a 360, 375, 390, 414, 430 y 440 px de ancho y de 640 a 956 de alto, en horizontal (667×375, 844×390, 932×430), en tablet (768×1024) y a 1440 en escritorio; servidor de desarrollo y build (`vite preview`), y el HTML sin JS. Métricas automáticas por página: desbordamiento horizontal, texto de menos de 13 px y objetivos táctiles de menos de 44 px. El formulario se ha enviado con la respuesta **simulada** (201) y con cualquier otra petición de escritura bloqueada: no ha salido nada hacia producción.
- **Capturas** (antes/después): carpeta `capturas/movil/` del scratchpad de la sesión (`comparativa-hero-panel.jpg`, `comparativa-menu.jpg`, `comparativa-hero-cookies.jpg`, `antes-375-*-full.png` / `despues-375-*-full.png`).

### Causa del hero vacío

Todo el texto del hero (antetítulo, TOUZA, frase y botones) entraba con `.entrada-hero`, una animación CSS que **arranca en `opacity: 0`** y tiene retrasos de hasta 0,45 s. Si la línea de tiempo de animaciones no avanza, el texto se queda invisible y solo se ve la foto. Se reproduce tal cual en el visor del escritorio (que congela los fotogramas cuando está oculto: 0 `requestAnimationFrame` por segundo, la animación parada en 50 ms y `opacity: 0`), y pasa igual con una pestaña abierta en segundo plano, el ahorro de energía o una captura hecha nada más cargar. En Chromium y WebKit con fotogramas normales el texto sí aparecía, pero a los ~1,3 s (en WebKit, a los 300 ms tenía `opacity: 0,2`).

El punto negro era el cursor propio (`CustomCursor`): un círculo blanco con `mix-blend-difference`, que sobre el botón blanco se ve negro. Solo se apagaba con `(pointer: coarse)`, comprobado una vez al montar, así que salía en cualquier vista en la que esa media query no fuera cierta en ese instante (emulación de móvil activada después de cargar, portátiles táctiles, tabletas con ratón).

### Hallazgos y estado

| # | Sev. | Hallazgo | Estado |
|---|---|---|---|
| M1 | Crítico | Hero del móvil sin texto ni botones mientras la animación de entrada no avanza (ver la causa arriba). | ✅ `3b63729`: en móvil la entrada es solo de posición (sin fundido) y el texto es visible desde el primer pintado; el fundido queda para ≥ md. En el mismo visor congelado ya se ven marca, "Cocktail bar · Crevillente", frase y botones. El LCP del móvil pasa a ser el `<h1>` (256 ms en el build). |
| M2 | Alto | Hero de `100dvh` fijo con `overflow: hidden`: cambia de alto al hacer scroll (barra del navegador) y en horizontal dejaba los botones bajo la barra fija. | ✅ `3b63729`: alto mínimo `100svh`, padding inferior según `--barra-movil` y variante `apaisado:` (Tailwind) para el móvil en horizontal. Comprobado: el último botón queda 28 px por encima de la barra en vertical y 14–43 px en horizontal. |
| M3 | Medio | Legibilidad del hero: foto al 50 % y degradado suave; antetítulo de 10–11 px. Cuatro botones grandes apilados (dos del hero y dos de la barra). | ✅ `3b63729`: foto más viva arriba y degradado oscuro donde va el texto; antetítulo dorado a 12 px; botones del hero en una fila de 48 px; fuera la flecha de scroll en móvil. |
| M4 | Alto | Punto negro del cursor propio en móvil. | ✅ `3e07491`: solo con `(hover: hover) and (pointer: fine)`, reevaluado si cambia; aparece al mover el ratón (no en la esquina) y desaparece al tocar. |
| M5 | Medio | La barra fija medía 81 px y el hueco final y el aviso de cookies contaban con 76: tapaba el final del pie y el aviso se montaba 5 px sobre los botones. En El Reservado y Contacto (sin barra) el aviso flotaba a 76 px del borde. | ✅ `08ec332`: una sola medida (`--barra-movil` = 4,5 rem + zona segura); el aviso se apoya sobre la barra solo donde la hay (`lib/barra-movil.ts`, con test). |
| M6 | Medio | Sin `viewport-fit=cover`, `env(safe-area-inset-*)` vale 0 en iOS: la barra quedaba sobre el indicador de inicio. | ✅ `abc3b5d`: `viewport-fit=cover` y márgenes laterales del notch en horizontal (body y `.safe-x` en cabecera, barra y aviso). |
| M7 | Medio | Aviso de cookies con `z-index` 9998: tapaba el botón de reservar del menú abierto. | ✅ `0daa142` (z-45) |
| M8 | Medio | Menú móvil correcto (Radix: foco atrapado, Escape, scroll bloqueado) pero pobre: enlaces de 18 px y la sección actual solo en blanco frente a gris. | ✅ `0daa142`: pantalla completa, enlaces en serif de 32 px numerados, sección actual en dorado y, abajo, Llamar, Reservar, horario y dirección. |
| M9 | Medio | Objetivos táctiles de menos de 44 px: 10–21 por página (logo 28 px, pie 32, pestañas de la carta 40, filtros 36–40, datos de contacto 31–32, enlaces del 404 36). | ✅ `0daa142`, `1f63da9`, `a798fd0`, `a8b3afb`, `3060f31`, `e9cb071`: quedan 1–3 por página, todos enlaces dentro de un texto (excepción de WCAG 2.5.8) o de 44 px de alto y menos de ancho ("Carta" en el pie). |
| M10 | Medio | Contacto en el móvil: sin barra fija y sin acciones a mano; solo el texto de cada dato era pulsable. | ✅ `1f63da9`: Llamar / Cómo llegar / Escribir arriba y filas enteras pulsables. "Visítanos" de la portada pasa a lista compacta. |
| M11 | Bajo | Pie del móvil todo apilado (casi dos pantallas) y el CTA "Solicita El Reservado" repetido justo debajo del formulario de El Reservado. | ✅ `a798fd0`: Explora y Contacto en dos columnas; sin el CTA en /reservado. La portada baja de 5083 a 4754 px a 375. |
| M12 | Medio | Carta: con 9 pestañas, al cambiar de pestaña desde media lista la nueva se abría a media altura, y la pestaña elegida podía quedar medio fuera. Precios a 12 px, etiquetas de alérgenos a 10 px. | ✅ `a8b3afb`: la pestaña se centra y la lista empieza bajo la barra pegajosa; precios a 13 px, etiquetas a 11 px, aviso a 13 px. |
| M13 | Bajo | Visor de la galería en el móvil: ventana al 95 % con los botones flotando sobre las esquinas de la foto. | ✅ `3060f31`: pantalla completa con anterior / contador / siguiente en una fila bajo la foto; el arrastre lateral se mantiene. |
| M14 | Medio | El Reservado en el móvil: ninguna acción en la primera pantalla (sin barra y con el formulario tres secciones más abajo); titular sobre las etiquetas de las botellas; etiquetas del formulario a 12 px. | ✅ `ea189cd`: botón "Solicitar El Reservado" a `#solicitud`, degradado más oscuro y etiquetas a 13 px. Los campos ya tenían `type`, `autocomplete` e `inputMode` correctos y 16 px (sin zoom de iOS); los errores salen en un diálogo. |
| M15 | Bajo | Diálogos de borde a borde y con esquinas rectas en el móvil. | ✅ `e9cb071` |
| M16 | Bajo | Teléfono de los textos legales partido en dos líneas. | ✅ `59bc04d` |

Sin cambios porque ya estaban bien: no hay desbordamiento horizontal en ninguna página a 360–430; la foto del hero en el móvil es el recorte vertical de 600/900 px (96 KB en AVIF a DPR 3); los campos del formulario no provocan zoom; el diálogo de cóctel ya era de pantalla completa con scroll.

### Pendiente o decisión del dueño

- **Aviso de cookies en la primera visita:** en una pantalla pequeña (360×640) tapa la frase y los botones del hero hasta que se acepta o se rechaza (153 px sobre la barra). Es lo normal en un aviso así; si se prefiere, puede ir arriba o como tarjeta flotante más pequeña.
- **Fotos de cócteles:** muchas tarjetas de la carta salen con el relleno "TOUZA" (sin foto en Supabase). En el móvil se nota más, porque la rejilla es casi todo foto (ver P5).
- **Registro mercantil:** el aviso legal sigue mostrando "[DATOS DE INSCRIPCIÓN EN EL REGISTRO MERCANTIL PENDIENTES]".
- **404 en URLs inventadas:** en `/404` no sale la barra fija, pero en una URL inexistente cualquiera (`/no-existe`) sí, porque la barra decide por la ruta. No molesta (ofrece llamar y reservar), pero es incoherente.
- **Gestos reales:** el arrastre del visor y el scroll de las pestañas se han probado con emulación; falta un repaso en un iPhone real (zona segura y barra de Safari).

### Verificación

- `npm run typecheck` ✅ · `npm test` ✅ 153/153 (nuevo `barra-movil.test.ts`; los tests de Contacto se adaptan a las filas pulsables y comprueban las acciones rápidas) · `npm run build` ✅ · `npm run lint`: 44 problemas, todos anteriores (eran 46), ninguno nuevo.
- Escritorio a 1440: hero, cabecera, pie, Contacto y El Reservado sin cambios a peor (el hero conserva el fundido, el parallax y el titular grande).

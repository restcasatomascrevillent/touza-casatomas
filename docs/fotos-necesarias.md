# Fotos necesarias — web de Touza

- **Fecha:** 01/10/2026 (rama `revision-diseno-touza`)
- **Origen:** comprobación de todas las imágenes que ve un visitante. Las de la carta vienen de Supabase (`Cocteles.imagen_url`) y las demás son fotos propias en `src/assets/originales/` o URL de Unsplash escritas en `src/pages/Galeria.tsx`. Cada URL se ha comprobado con `curl` y se ha revisado a ojo qué enseña.
- **Qué hay hoy:** 6 fotos propias, todas buenas y del local: interior con sofá mostaza, barman con colador, barman con mojito, dos bodegones de champán Laurent-Perrier y un bodegón de botellas (Select, Kraken). Todas las fotos de cócteles (12 en la carta y 5 en la galería) son de stock. Una da error 404 y seis enseñan una bebida que no es la que dicen.

## Formatos que pide la web

| Hueco | Dónde | Proporción | Mínimo recomendado |
|---|---|---|---|
| Tarjeta y detalle de cóctel | `/carta` (rejilla y diálogo) | Vertical 3:4 | 1200 × 1600 px |
| Hero de página | `/reservado`, `/carta` y portada (a todo el ancho; en móvil se recorta al centro) | Horizontal 3:2 o 16:9, con el motivo centrado | 2560 × 1600 px |
| Vitrina de portada | "Cócteles de Autor" y "El Reservado" (16:9 en escritorio, 3:4 en móvil) | Horizontal 16:9, con el motivo centrado para que aguante el recorte 3:4 | 2400 × 1350 px |
| Galería | `/galeria` | Vertical 3:4 (cócteles), libre (ambiente) | 1600 px por el lado largo |
| Miniaturas de El Reservado | `/reservado` (carrusel) | Vertical 2:3 | 1200 × 1800 px |
| Tapas (cuando se activen) | `/carta`, "Tapea con tu Cóctel" | Horizontal 4:3 | 1200 × 900 px |

Para todas: foto real del local, con la luz cálida y el fondo oscuro de las fotos de barra que ya hay (`touza-5` y `touza-7`), y sin texto ni logos sobreimpresos. Se entrega el original sin comprimir: las variantes AVIF y WebP las genera `npm run imagenes`. Las fotos de los cócteles se suben desde el panel (Gestor Web → Carta) y las demás van a `src/assets/originales/`.

---

## Prioridad 1: rotas o que enseñan otra cosa en un sitio visible

| Elemento | Dónde se ve | Problema | Qué debe enseñar la foto real | Formato |
|---|---|---|---|---|
| **Clover Club** | `/carta` y JSON-LD `Menu` | **404**: la URL de Unsplash ya no existe. Hoy se ve el relleno "TOUZA" y Google recibe una imagen rota. `supabase/migrations/20261001_touza_correcciones_datos.sql` la deja en NULL. | Copa coupé con el cóctel rosa pálido y espuma de clara, y frambuesa de guarnición | 3:4 · 1200 × 1600 |
| **Pornstar Martini** | `/carta` | Enseña un vaso bajo de whisky con hielo grande (un old fashioned) | Copa de martini con maracuyá, medio maracuyá flotando y el chupito de cava al lado | 3:4 · 1200 × 1600 |
| **Hero de El Reservado** | `/reservado`, arriba del todo | Enseña botellas de champán (`touza-8`), no el espacio | El Reservado entero, vacío y montado para un evento: mesa, sillas e iluminación, tomado desde la puerta | Horizontal 3:2 · 2560 × 1600 |
| **Vitrina "El Reservado"** | Portada (escritorio y móvil) | Enseña un bodegón de botellas (`touza-10`) | El Reservado con gente o con la mesa puesta: que se entienda que es un espacio privado | 16:9 · 2400 × 1350 |
| **Carrusel de El Reservado** (3 fotos) | `/reservado` | Hoy, como "El ambiente de Touza": la barra (`touza-5`), la sala principal (`touza-2`, recorte vertical) y un bodegón de botellas (`touza-10`). Ninguna es del espacio. | 1) mesa larga montada · 2) detalle de la decoración del reservado · 3) un evento real (cumpleaños o cena) | 2:3 · 1200 × 1800 |
| **Galería → "El Reservado"** (3 fotos) | `/galeria` | Son las mismas tres fotos. "El Reservado - espacio privado" es el barman, "Mesa privada" es el champán y "Evento en El Reservado" repite la foto de la barra de "Ambiente". | Las mismas fotos que el carrusel, o variantes de ellas | 3:4 · 1200 × 1600 |

> El `alt` de esas fotos de la galería también describe algo que no aparece en la imagen (por ejemplo, "Mesa privada" en una foto de botellas de champán). Un lector de pantalla lo leería mal. Cuando lleguen las fotos reales hay que corregir los textos de `src/pages/Galeria.tsx`.

## Prioridad 2: stock que no corresponde al cóctel

Las fotos cargan bien, pero enseñan otra bebida. La parte 2 del fichero SQL las deja preparadas para ponerlas en NULL, comentadas: decide el dueño.

| Cóctel | Qué enseña hoy | Qué debe enseñar | Formato |
|---|---|---|---|
| **Green Dream** | Un cóctel morado de moras con naranja deshidratada | Cóctel verde de kiwi y manzana verde, con rodaja de kiwi | 3:4 · 1200 × 1600 |
| **Piña Colada** | Copa de martini naranja con hierbabuena | Cóctel cremoso blanco en vaso alto o hurricane, con piña y cereza | 3:4 · 1200 × 1600 |
| **Colada Virgen** | Tres copas de martini, roja y verdes, sobre fondo amarillo | Lo mismo que la Piña Colada (sin alcohol). Se puede usar otra toma de la misma foto. | 3:4 · 1200 × 1600 |
| **Spicy Mango Margarita** | Margarita roja (de fresa) | Margarita amarilla o naranja de mango, con borde de sal y chile | 3:4 · 1200 × 1600 |
| **Ipanema** | Vasos altos de fresa | Caipirinha sin alcohol: vaso bajo, lima machacada, hielo picado y azúcar moreno | 3:4 · 1200 × 1600 |
| **Moscow Mule** | Un highball claro con lima, sin la taza de cobre | El cóctel en la taza de cobre, con lima y hierbabuena | 3:4 · 1200 × 1600 |
| **Furia Frutal** | Tres bebidas genéricas en la barra | El cóctel solo, centrado | 3:4 · 1200 × 1600 |

## Prioridad 3: stock que encaja pero no es del bar

| Elemento | Dónde | Nota | Formato |
|---|---|---|---|
| Aperol Spritz, Mojito, Mojito Virgen | `/carta` | La foto se parece al cóctel, pero es de catálogo | 3:4 · 1200 × 1600 |
| Galería → "Cócteles" (5 fotos) | `/galeria` | Son de Unsplash y **duplican** las de la carta: "Cóctel Signature" es la de Beso Escarlata, "Cóctel tropical" la de Furia Frutal, "Cóctel clásico" la de Green Dream, "Mojito" la de Mojito y "Margarita" la de Spicy Mango Margarita. Bastan cinco de las fotos reales de la carta, con otro encuadre. | 3:4 · 1600 px el lado largo |
| Galería → "Vista general del local" | `/galeria` | Es el bodegón de champán (`touza-8`), no una vista del local | Horizontal 3:2 · 2560 × 1700 |
| Galería → "Detalle decoración" | `/galeria` y vitrina de portada | Es un bodegón de botellas: vale como "detalle", pero no es decoración | Libre · 1600 px |
| Vitrina "Cócteles de Autor" | Portada | Es una foto real buena (barman con colador, `touza-5`), pero vertical dentro de una caja 16:9: en escritorio se pierde más de la mitad | 16:9 · 2400 × 1350 (la misma escena en horizontal) |

## Para más adelante

- **Tapas:** ningún plato tiene `touza = true`, así que la sección "Tapea con tu Cóctel" no sale. Cuando el dueño marque qué tapas se sirven en el bar, cada una necesitará su foto (4:3, 1200 × 900), o habrá que apagar "Fotos de platos en Touza" en el panel.
- **Fachada / entrada:** no hay ninguna foto de la calle ni de la puerta. Ayudaría en Contacto y en la ficha de Google (horizontal, 2400 × 1600).
- **og:image** (`public/og-image.jpg`, 1200 × 630): ya es del local. Si llega una foto mejor del ambiente, conviene regenerarla.

## Lo que ya está bien

`touza-2` (interior con sofá mostaza: hero de la portada, og:image y JSON-LD) y `touza-5` (barman: hero de `/carta`) son fotos propias, de calidad y bien usadas.

# Vídeos de la portada

Generados con `python scripts/retoque/videos.py --origen <carpeta con los vídeos>` (ffmpeg en local, no en el build). Llevan la misma receta de color que las fotos: la LUT común `scripts/retoque/touza-noche.cube`, con el balance de blancos y la exposición de cada clip delante (en los clips de día, +5 % de verde para que el mármol quede crema y no melocotón) y la misma viñeta. No llevan audio ni grano. Los originales no están en el repo: son los de la carpeta de Drive de Touza.

## Hero: `hero/`

| Archivo | Qué es |
|---|---|
| `bucle.mp4` | H.264 High, yuv420p, `+faststart`, 720×1280, 24 fps, 4,0 s, ≈705 KB |
| `bucle.webm` | AV1 (SVT-AV1), 720×1280, 24 fps, 4,0 s, ≈445 KB |
| `poster.webp` | Primer fotograma del bucle, 720×1280, ≈57 KB |

- Origen: `A001_11121847_C029.MP4` (espresso martini delante de la «T»), tramo **1-6 s**.
- Se descartó `clover club 1 - C018` (1-7 s): está grabado a mano y la «T» se desplaza hasta 65 px en el tramo, así que el fundido del bucle dejaría una imagen doble. C029 es de trípode.
- Bucle sin salto: el último segundo funde con el primero (`xfade` de 1 s), por eso dura 4 s y no 5. El salto del último fotograma al primero es igual que el de dos fotogramas seguidos.

## Franja de clips: `clips/`

Cada clip tiene `NN-nombre.webm` (AV1), `.mp4` (H.264, `+faststart`) y `.webp` (póster, primer fotograma). 540×960, 29,97 fps. Origen: vídeos del iPhone (HEVC 1440×1920) recortados a 9:16 con un paneo que sigue a la copa.

| Clip | Origen y tramo | Duración | MP4 / WebM |
|---|---|---|---|
| `01-aperol` | `IMG_0379.MOV`, 0,3-3,4 s | 3,1 s | ≈520 / 310 KB |
| `02-moscow-mule` | `IMG_0392.MOV`, 0,4-4,7 s | 4,3 s | ≈650 / 380 KB |
| `03-rosa-hibisco` | `IMG_0433.MOV`, 0,3-3,5 s (cóctel sin identificar, vaso rosa con hibisco) | 3,2 s | ≈400 / 215 KB |
| `04-clover-club` | `IMG_0397.MOV`, 0,3-2,8 s | 2,5 s | ≈360 / 210 KB |

## Presupuesto

- Hero ≤ 900 KB por formato; cada clip ≤ 1,5 MB.
- Toda la portada (hero + 4 clips): ≈2,6 MB en MP4 y ≈1,5 MB en WebM, por debajo de los 3 MB. El navegador solo baja uno de los dos formatos.
- Uso en la página (auditoría §5): `autoplay muted loop playsinline`, `poster`, carga tras `load` y nada de vídeo con reduced-motion o ahorro de datos.

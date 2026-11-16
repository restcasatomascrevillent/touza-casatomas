"""
Vídeo del hero de /carta: la copa que se llena sola (components/carta/HeroCopa.tsx).

Uso (desde la raíz del repo):

    python scripts/retoque/copa_video.py --origen <carpeta con IMG_0284.HEIC … IMG_0293.HEIC>

Origen. De ese plano NO hay vídeo: es una ráfaga de diez fotos del iPhone
(IMG_0284–IMG_0293, HEIC de 3024×4032, carpeta «Elaboración» del Drive; una
cada 0,42 s, el bartender sirviendo un Clover Club). El vídeo se monta con
ellas: cada foto funde con la siguiente al ritmo real de la ráfaga, así que
la copa se llena de forma continua. Al ser fotos, hay más resolución que en
cualquier vídeo del Drive: nada se amplía.

Pasos:

1. Alineado sobre la copa y pantalla del TPV apagada, como en `llenado.py`
   (se reutilizan sus funciones; la máscara del monitor se calcula en su
   geometría de 1280×1024 y se aplica a resolución completa).
2. Dos encuadres del mismo fotograma, los dos desde y=476 para que no entre
   la barbilla del bartender (no sale ninguna cara):
   - horizontal 16:9, todo el ancho de la foto → vídeo de 1920×1080;
   - vertical 4:5, centrado en la copa → vídeo de 1080×1350 (el hero del
     móvil es casi cuadrado: un 9:16 se recortaría a la mitad).
3. Color natural: solo se pasa de Display P3 (el perfil del iPhone) a sRGB.
   Sin la receta «noche», sin viñeta y sin grano: no se oscurece nada.
4. MP4 H.264 a 30 fps, sin audio, `+faststart`. Dura ~5 s y acaba con la
   copa llena (no hace bucle: de llena a vacía sería un salto).
5. Pósters en AVIF y WebP: el primer fotograma (la imagen prioritaria de la
   página) y el último, la copa llena, que es lo que se queda en pantalla al
   terminar y lo único que se ve con «reducir movimiento» o ahorro de datos.
   La copa llena llega al ancho del recorte (3000 px en horizontal, 1440 en
   vertical): un escritorio de 1440 px a densidad 2 pinta 2880 y un móvil de
   390 px a densidad 3, 1170.

Salida: src/assets/videos/carta/copa-{horizontal,vertical}.mp4 y
copa-{horizontal,vertical}-{inicio,llena}-<ancho>.{avif,webp}.
"""
from __future__ import annotations

import argparse
import io
import os
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageCms

sys.path.insert(0, str(Path(__file__).resolve().parent))
import llenado as L  # noqa: E402
import receta as R  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
DESTINO = RAIZ / "src" / "assets" / "videos" / "carta"

FPS = 30
# Segundos de fundido entre cada dos fotos seguidas. La ráfaga va a una foto
# cada 0,40–0,49 s salvo entre la 8.ª y la 9.ª (2,4 s: la espuma), que se acorta.
FUNDIDOS = [0.45] * 7 + [0.60, 0.45]
QUIETO_INICIO = 0.30
QUIETO_FINAL = 0.70
CRF = 23

# Encuadres en coordenadas del HEIC (3024×4032). La copa está centrada en
# x≈1224; por encima de y=476 asoman el cuello y la barbilla.
ENCUADRES = [
    dict(nombre="copa-horizontal", x=12, y=476, ancho=3000, alto=1688, video=(1920, 1080),
         inicio=[1280, 1920], llena=[1280, 1920, 2560, 3000]),
    dict(nombre="copa-vertical", x=344, y=476, ancho=1760, alto=2200, video=(1080, 1350),
         inicio=[720, 1080], llena=[720, 1080, 1440]),
]
CALIDAD = {"avif": 62, "webp": 82}


def perfil_del_iphone(ruta: Path) -> bytes | None:
    import pillow_heif

    pillow_heif.register_heif_opener()
    return Image.open(ruta).info.get("icc_profile")


def apagar_monitor(a: np.ndarray) -> np.ndarray:
    """Apaga el TPV en la foto entera (uint8), con la máscara de `llenado.py`."""
    x0, y0, w, h = (L.RECORTE[k] for k in ("x", "y", "ancho", "alto"))
    zona = a[y0:y0 + h, x0:x0 + w].astype(np.float32) / 255.0
    _, m = L.apagar_monitor(cv2.resize(zona, L.SALIDA, interpolation=cv2.INTER_AREA))
    m = cv2.resize(m, (w, h), interpolation=cv2.INTER_LINEAR)[..., None]
    apagado = np.array([0.030, 0.036, 0.048], np.float32) + 0.10 * R.luma(zona)[..., None]
    salida = a.copy()
    salida[y0:y0 + h, x0:x0 + w] = np.clip((zona + (apagado - zona) * m) * 255 + 0.5, 0, 255).astype(np.uint8)
    return salida


def nitidez_suave(x: np.ndarray) -> np.ndarray:
    """Compensa la reducción: máscara de enfoque muy ligera (float 0…255)."""
    return np.clip(x + 0.30 * (x - cv2.GaussianBlur(x, (0, 0), 0.8)), 0, 255)


def guardar_fotos(im: Image.Image, base: str, anchos: list[int], destino: Path) -> None:
    for ancho in anchos:
        alto = round(im.height * ancho / im.width)
        reducida = im.resize((ancho, alto), Image.LANCZOS)
        for formato, calidad in CALIDAD.items():
            ruta = destino / f"{base}-{ancho}.{formato}"
            reducida.save(ruta, formato.upper(), quality=calidad, **({"method": 6} if formato == "webp" else {"speed": 4}))
            print(f"  {ruta.name}: {os.path.getsize(ruta) // 1024} KB")


def guardar_video(claves: list[np.ndarray], ruta: Path) -> None:
    """Fundido encadenado de los fotogramas clave (float32 0…255, RGB) → MP4."""
    alto, ancho = claves[0].shape[:2]
    orden = [
        "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{ancho}x{alto}",
        "-r", str(FPS), "-i", "-", "-an",
        # Etiquetado como lo que es (primarios BT.709, curva sRGB) para que el
        # primer fotograma del vídeo tenga el mismo tono que el póster.
        "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,"
               "setparams=color_primaries=bt709:color_trc=iec61966-2-1:colorspace=bt709:range=tv",
        "-c:v", "libx264", "-preset", "slow", "-crf", str(CRF), "-profile:v", "high",
        "-movflags", "+faststart", str(ruta),
    ]
    ffmpeg = subprocess.Popen(orden, stdin=subprocess.PIPE)
    assert ffmpeg.stdin is not None

    def escribir(x: np.ndarray, veces: int = 1) -> None:
        datos = np.clip(x + 0.5, 0, 255).astype(np.uint8).tobytes()
        for _ in range(veces):
            ffmpeg.stdin.write(datos)

    total = round(QUIETO_INICIO * FPS)
    escribir(claves[0], total)
    for i, segundos in enumerate(FUNDIDOS):
        pasos = round(segundos * FPS)
        for p in range(1, pasos + 1):
            escribir(claves[i] + (claves[i + 1] - claves[i]) * (p / pasos))
        total += pasos
    escribir(claves[-1], round(QUIETO_FINAL * FPS))
    total += round(QUIETO_FINAL * FPS)
    ffmpeg.stdin.close()
    if ffmpeg.wait() != 0:
        raise SystemExit(f"ffmpeg falló con {ruta.name}")
    print(f"  {ruta.name}: {ancho}×{alto}, {total / FPS:.2f} s, {os.path.getsize(ruta) / 1024 / 1024:.2f} MB")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--origen", type=Path, required=True, help="carpeta con IMG_0284.HEIC … IMG_0293.HEIC")
    ap.add_argument("--destino", type=Path, default=DESTINO)
    args = ap.parse_args()
    assert len(FUNDIDOS) == len(L.NUMEROS) - 1

    imgs = {n: L.cargar_heic(args.origen / f"IMG_0{n}.HEIC") for n in L.NUMEROS}
    print("Alineando sobre la copa…")
    imgs = L.alinear(imgs)
    imgs = {n: apagar_monitor(a) for n, a in imgs.items()}

    # Display P3 → sRGB (sin esto, el rojo del cóctel sale apagado).
    icc = perfil_del_iphone(args.origen / f"IMG_0{L.REFERENCIA}.HEIC")
    a_srgb = None
    if icc:
        a_srgb = ImageCms.buildTransform(ImageCms.ImageCmsProfile(io.BytesIO(icc)), ImageCms.createProfile("sRGB"), "RGB", "RGB")
    else:
        print("  (las fotos no traen perfil de color: se toman como sRGB)")

    args.destino.mkdir(parents=True, exist_ok=True)
    for e in ENCUADRES:
        print(e["nombre"])
        recortes = []
        for n in L.NUMEROS:
            im = Image.fromarray(imgs[n][e["y"]:e["y"] + e["alto"], e["x"]:e["x"] + e["ancho"]])
            recortes.append(ImageCms.applyTransform(im, a_srgb) if a_srgb else im)
        guardar_fotos(recortes[0], f"{e['nombre']}-inicio", e["inicio"], args.destino)
        guardar_fotos(recortes[-1], f"{e['nombre']}-llena", e["llena"], args.destino)
        claves = [
            nitidez_suave(cv2.resize(np.asarray(im).astype(np.float32), e["video"], interpolation=cv2.INTER_AREA))
            for im in recortes
        ]
        guardar_video(claves, args.destino / f"{e['nombre']}.mp4")


if __name__ == "__main__":
    main()

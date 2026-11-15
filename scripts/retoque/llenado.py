"""
Secuencia del hero de /carta (src/assets/secuencias/llenado/01-10.webp).

Uso (desde la raíz del repo):

    python scripts/retoque/llenado.py --origen <carpeta con IMG_0284.HEIC … IMG_0293.HEIC>

Origen: la ráfaga IMG_0284-IMG_0293 de la carpeta «Touza» de Drive (el
bartender sirviendo un Clover Club). Pasos:

1. Alinea los 10 fotogramas sobre la COPA (tallo y borde derecho del cáliz),
   no sobre el fondo: la copa queda quieta y lo que se mueve es el fondo
   desenfocado.
2. Mismo recorte en los 10 (centrado en la copa, ≈5 % más cerrado que el de
   antes para tener margen de alineado) y salida a 1280×1024, como antes.
3. Monitor de la caja (TPV): está detrás de la parte baja del cáliz, así que
   ningún recorte rectangular lo saca sin cortar la copa. Se apaga en los 10
   fotogramas (ver `apagar_monitor`): la pantalla queda como una pantalla
   negra desenfocada; los reflejos nítidos del cristal, el cóctel y el brazo
   del bartender no se tocan.
4. Receta de color común (receta.py) con el mismo balance para los 10 (el de
   la foto `touza-sirviendo`, que es la misma escena) y grano distinto en
   cada fotograma, como en película.
5. WebP con la misma calidad en los 10, la mayor que deja todos < 72 KB.
"""
from __future__ import annotations

import argparse
import io
import os
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

sys.path.insert(0, str(Path(__file__).resolve().parent))
import receta as R  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
DESTINO = RAIZ / "src" / "assets" / "secuencias" / "llenado"
NUMEROS = list(range(284, 294))  # IMG_0284 … IMG_0293 → 01 … 10
REFERENCIA = 293  # la copa llena: es el fotograma que se queda en pantalla

# Recorte en coordenadas del HEIC (3024×4032, vertical). El de antes era
# x 0-2560, y 428-2476 (5:4). La copa está centrada en x≈1248.
RECORTE = dict(x=28, y=476, ancho=2440, alto=1952)
SALIDA = (1280, 1024)
LIMITE_BYTES = 72 * 1024 - 512

# Zonas de la copa para alinear (coordenadas del HEIC).
ZONAS_COPA = [
    (1120, 1840, 1440, 2470),  # tallo (x0, y0, x1, y1)
    (1850, 600, 2080, 1400),  # borde derecho del cáliz
]
# El monitor de la caja en la salida (1280×1024): la pantalla (doble, azulada)
# ocupa x 270-510, y 500-672 y no se mueve más de ±2 px entre fotogramas
# (medido). En los primeros fotogramas también se ve a través del cáliz vacío,
# refractada más arriba (x 360-560, y 395-500).
ZONAS_MONITOR = [(256, 490, 526, 690), (350, 390, 570, 505)]

AJUSTES = R.Ajustes(rb_objetivo=1.50, ruido=4, notas="misma escena que touza-sirviendo")


def cargar_heic(ruta: Path) -> np.ndarray:
    import pillow_heif

    pillow_heif.register_heif_opener()
    return np.asarray(ImageOps.exif_transpose(Image.open(ruta)).convert("RGB"))


def gris_bordes(a: np.ndarray, escala: float) -> np.ndarray:
    g = cv2.cvtColor(a, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
    g = cv2.resize(g, None, fx=escala, fy=escala, interpolation=cv2.INTER_AREA)
    g = cv2.GaussianBlur(g, (0, 0), 1.0)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0)
    gy = cv2.Sobel(g, cv2.CV_32F, 0, 1)
    return np.sqrt(gx * gx + gy * gy)


def alinear(imgs: dict[int, np.ndarray]) -> dict[int, np.ndarray]:
    """Traslación + giro mínimo (euclídea) de cada fotograma sobre la copa del de referencia."""
    esc = 0.5
    ref = gris_bordes(imgs[REFERENCIA], esc)
    mascara = np.zeros_like(ref, np.uint8)
    for x0, y0, x1, y1 in ZONAS_COPA:
        mascara[int(y0 * esc):int(y1 * esc), int(x0 * esc):int(x1 * esc)] = 255
    salida = {}
    for n, a in imgs.items():
        if n == REFERENCIA:
            salida[n] = a
            continue
        M = np.eye(2, 3, dtype=np.float32)
        try:
            _, M = cv2.findTransformECC(ref, gris_bordes(a, esc), M, cv2.MOTION_EUCLIDEAN,
                                        (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-7), mascara, 5)
        except cv2.error as e:  # pragma: no cover
            print(f"  IMG_0{n}: ECC no converge ({e}); sin alinear")
        M[:, 2] /= esc
        print(f"  IMG_0{n}: dx={M[0, 2]:+.1f} dy={M[1, 2]:+.1f} giro={np.degrees(np.arctan2(M[1, 0], M[0, 0])):+.3f}°")
        salida[n] = cv2.warpAffine(a, M, (a.shape[1], a.shape[0]), flags=cv2.INTER_LANCZOS4 + cv2.WARP_INVERSE_MAP,
                                   borderMode=cv2.BORDER_REFLECT)
    return salida


def apagar_monitor(x: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Apaga la pantalla del TPV. x: fotograma sRGB float [0,1] a 1280×1024.

    Máscara = zona del monitor (bordes suaves) × «es pantalla» (luz azulada,
    con un cierre morfológico para incluir los iconos naranjas/rosas de la
    pantalla) × no es cóctel (rojo) × no es reflejo nítido del cristal. Donde
    hay máscara, el píxel pasa a un negro azulado con un 10 % de su luz, como
    una pantalla apagada desenfocada; la camisa y el brazo (neutros) no se tocan.
    """
    alto, ancho = x.shape[:2]
    zona = np.zeros((alto, ancho), np.float32)
    for x0, y0, x1, y1 in ZONAS_MONITOR:
        zona[y0:y1, x0:x1] = 1.0
    zona = cv2.GaussianBlur(zona, (0, 0), 5)
    r, g, b = x[..., 0], x[..., 1], x[..., 2]
    y = R.luma(x)
    azul = R.suavizado(np.float32(0.03), np.float32(0.12), b - np.maximum(r, g) * 0.97)
    azul = azul * R.suavizado(np.float32(0.05), np.float32(0.20), y)
    azul = cv2.morphologyEx(azul, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    azul = cv2.GaussianBlur(azul, (0, 0), 2)
    # Solo protege el rojo grande (el cóctel); los iconos naranjas de la pantalla, no.
    rojo = R.suavizado(np.float32(0.04), np.float32(0.12), r - np.maximum(g, b))
    rojo = cv2.morphologyEx(rojo, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
    rojo = cv2.GaussianBlur(rojo, (0, 0), 1.5)
    nitido = np.abs(y - cv2.GaussianBlur(y, (0, 0), 1.5))
    nitido = cv2.GaussianBlur(cv2.dilate(R.suavizado(np.float32(0.015), np.float32(0.05), nitido), np.ones((3, 3), np.uint8)), (0, 0), 1)
    # Los bordes azul saturado de la propia pantalla no son reflejos del cristal.
    nitido = nitido * (1.0 - R.suavizado(np.float32(0.25), np.float32(0.45), b - np.maximum(r, g)))
    m = np.clip(zona * azul * (1.0 - rojo) * (1.0 - 0.85 * nitido), 0.0, 1.0)
    apagado = np.array([0.030, 0.036, 0.048], np.float32) + 0.10 * y[..., None]
    return x + (apagado - x) * m[..., None], m


def guardar_webp(imgs: list[Image.Image], destino: Path) -> int:
    def peso(im: Image.Image, q: int) -> int:
        buf = io.BytesIO()
        im.save(buf, "WEBP", quality=q, method=6)
        return buf.tell()

    calidad = 90
    while calidad > 40 and max(peso(im, calidad) for im in imgs) > LIMITE_BYTES:
        calidad -= 2
    for i, im in enumerate(imgs, 1):
        im.save(destino / f"{i:02d}.webp", "WEBP", quality=calidad, method=6)
    return calidad


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--origen", type=Path, required=True, help="carpeta con IMG_0284.HEIC … IMG_0293.HEIC")
    ap.add_argument("--destino", type=Path, default=DESTINO)
    ap.add_argument("--depurar", type=Path, help="guarda aquí las máscaras del monitor")
    ap.add_argument("--cache", type=Path, help="npz con los fotogramas ya alineados y recortados (para iterar)")
    args = ap.parse_args()

    if args.cache and args.cache.exists():
        datos = np.load(args.cache)
        recortes = {n: datos[str(n)] for n in NUMEROS}
    else:
        imgs = {n: cargar_heic(args.origen / f"IMG_0{n}.HEIC") for n in NUMEROS}
        print("Alineando sobre la copa…")
        imgs = alinear(imgs)
        x0, y0, w, h = RECORTE["x"], RECORTE["y"], RECORTE["ancho"], RECORTE["alto"]
        # Recorte común y reducción a la salida (1280×1024); el resto se hace a ese tamaño.
        recortes = {n: cv2.resize(a[y0:y0 + h, x0:x0 + w], SALIDA, interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
                    for n, a in imgs.items()}
        del imgs
        if args.cache:
            np.savez(args.cache, **{str(n): v for n, v in recortes.items()})

    # Un solo balance para los 10 (calculado sobre la copa llena) → sin parpadeo.
    aj = AJUSTES
    _, k = R.preparar(recortes[REFERENCIA], aj)
    aj_fijo = R.Ajustes(**{**aj.__dict__, "rb_objetivo": None})
    print(f"Balance común k={k:.3f}")

    args.destino.mkdir(parents=True, exist_ok=True)
    salidas = []
    for i, n in enumerate(NUMEROS, 1):
        x, m = apagar_monitor(recortes[n])
        if args.depurar:
            args.depurar.mkdir(parents=True, exist_ok=True)
            Image.fromarray((m * 255).astype(np.uint8)).resize(SALIDA).save(args.depurar / f"mascara-{i:02d}.png")
        lin = R.ganancias(R.a_lineal(x), k)
        x = R.a_srgb(lin)
        x = R.reducir_ruido(x, aj_fijo.ruido)
        x = R.look(x)
        x = R.nitidez(x, aj_fijo.nitidez)
        x = R.vineta(x, aj_fijo.vineta)
        x = R.grano(x, f"llenado-{i:02d}", aj_fijo.grano)
        salidas.append(Image.fromarray(np.clip(x * 255 + 0.5, 0, 255).astype(np.uint8)))
        print(f"  {i:02d} ← IMG_0{n} {R.medir(x)}")

    q = guardar_webp(salidas, args.destino)
    pesos = [os.path.getsize(args.destino / f"{i:02d}.webp") for i in range(1, 11)]
    print(f"WebP q{q}: " + ", ".join(f"{p // 1024} KB" for p in pesos) + f" (total {sum(pesos) // 1024} KB)")


if __name__ == "__main__":
    main()

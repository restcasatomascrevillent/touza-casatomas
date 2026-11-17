"""
Receta de color única de Touza («la misma noche»).

Especificación: touza-recursos/auditoria/medios-animaciones.md, sección 4.
La usan retocar_fotos.py (maestros de la web), llenado.py (secuencia del hero
de /carta) y videos.py (bucle del hero y franja de clips).

La receta tiene dos partes:

1. El «look» común (`look`): curva de tono, saturación y virado de sombras a
   azul petróleo / luces a ámbar. Es una función píxel a píxel, así que se
   exporta tal cual como LUT 3D (`escribir_cube`, touza-noche.cube) y es lo
   que se aplica también a los vídeos con `ffmpeg lut3d`.
2. Lo que depende de la foto o del entorno del píxel y no cabe en una LUT:
   balance de blancos y exposición por foto (para llevarlas todas al mismo
   punto antes del look), reducción de ruido en sombras, nitidez suave,
   viñeteado y grano. Los ajustes por foto están en retocar_fotos.py.

Todo trabaja en float32 con valores sRGB en [0, 1] salvo donde se indica
«lineal». Sin dependencias fuera de numpy + OpenCV (cv2).
"""
from __future__ import annotations

import zlib
from dataclasses import dataclass, field

import cv2
import numpy as np

# ─────────────────────────── parámetros comunes ────────────────────────────
# Curva de tono: negro levantado (≈8/255, teñido de petróleo), medios más
# densos (gamma 0,93) y hombro suave que empieza hacia 220-235 y deja el
# blanco en ≈239/255 (el mármol quemado recupera algo de textura).
NEGRO = np.array([5.0, 9.0, 11.0], np.float32) / 255.0  # luma ≈ 8
GAMMA_MEDIOS = 0.93
RODILLA = 0.86  # inicio del hombro (≈219/255), tras levantar negros y gamma
BLANCO_ASINTOTA = 0.965  # el blanco puro (255) acaba en ≈239

# Saturación: -6 % global, naranjas -10 % más; los rojos de las copas, intactos.
SAT_GLOBAL = 0.94
SAT_NARANJA_EXTRA = -0.10
SAT_ROJO_EXTRA = +0.06  # compensa el -6 % global → los rojos quedan al 100 %

# Virado (split-toning). Tintes de la auditoría: sombras #0E2A33 (azul
# petróleo), luces #F2C078 (ámbar). Se aplica el croma del tinte, sin tocar la
# luminancia; «fuerza» es el desplazamiento máximo en tanto por uno (0,018 ≈
# 4,6 niveles de 255 en el canal más afectado).
TINTE_SOMBRAS = np.array([0x0E, 0x2A, 0x33], np.float32) / 255.0
TINTE_LUCES = np.array([0xF2, 0xC0, 0x78], np.float32) / 255.0
FUERZA_SOMBRAS = 0.022
FUERZA_LUCES = 0.018

# Espaciales (no van en la LUT).
VINETA = 0.12  # -12 % en las esquinas
GRANO = 0.014  # desviación del grano en los medios (≈3,6 niveles de 255; ≈2 % pico a pico en sombras)
GRANO_LADO_REF = 1600  # el grano se genera a 1600 px de lado largo: mismo tamaño aparente en todas
NITIDEZ_RADIO = 0.6
NITIDEZ_CANTIDAD = 0.6

LUMA = np.array([0.2126, 0.7152, 0.0722], np.float32)


# ─────────────────────────────── utilidades ────────────────────────────────
def a_lineal(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0.0, 1.0)
    return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4).astype(np.float32)


def a_srgb(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0.0, 1.0)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055).astype(np.float32)


def luma(rgb: np.ndarray) -> np.ndarray:
    return (rgb @ LUMA).astype(np.float32)


def suavizado(a: np.ndarray, b: np.ndarray, x: np.ndarray) -> np.ndarray:
    """smoothstep de a a b (admite a > b para una rampa descendente)."""
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return (t * t * (3 - 2 * t)).astype(np.float32)


def ventana_tono(h: np.ndarray, centro: float, plano: float, borde: float) -> np.ndarray:
    """1 a menos de `plano` grados del centro, 0 a más de `borde`, rampa suave."""
    d = np.abs(((h - centro + 180.0) % 360.0) - 180.0)
    return suavizado(np.float32(borde), np.float32(plano), d)


def tono_hsv(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Tono (0-360) y croma (max-min) sin pasar por uint8."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = np.max(rgb, axis=-1)
    mn = np.min(rgb, axis=-1)
    c = mx - mn
    cs = np.where(c == 0, 1.0, c)
    h = np.where(
        mx == r, ((g - b) / cs) % 6.0, np.where(mx == g, (b - r) / cs + 2.0, (r - g) / cs + 4.0)
    ) * 60.0
    return h.astype(np.float32), c.astype(np.float32)


# ──────────────────────────────── el look ──────────────────────────────────
def curva(x: np.ndarray) -> np.ndarray:
    """Curva de tono por canal en [0,1] → [0,1] (sin el negro, que va teñido)."""
    y = np.power(np.clip(x, 0.0, 1.0), 1.0 / GAMMA_MEDIOS)
    k, w = RODILLA, BLANCO_ASINTOTA
    hombro = k + (w - k) * (1.0 - np.exp(-(y - k) / (w - k)))
    return np.where(y > k, hombro, y).astype(np.float32)


def look(rgb: np.ndarray) -> np.ndarray:
    """El look común (lo que va en la LUT). rgb: (..., 3) sRGB en [0, 1]."""
    rgb = np.clip(rgb.astype(np.float32), 0.0, 1.0)

    # 1) Saturación selectiva por tono, conservando la luma.
    h, c = tono_hsv(rgb)
    rojo = ventana_tono(h, 0.0, 10.0, 22.0)
    naranja = ventana_tono(h, 32.0, 10.0, 22.0) * (1.0 - rojo)
    s = SAT_GLOBAL + SAT_ROJO_EXTRA * rojo + SAT_NARANJA_EXTRA * naranja
    y = luma(rgb)[..., None]
    rgb = y + (rgb - y) * s[..., None]

    # 2) Curva por canal y negro levantado (teñido de petróleo).
    rgb = curva(rgb)
    rgb = NEGRO + (1.0 - NEGRO) * rgb

    # 3) Virado: croma del tinte en sombras y en luces, luminancia intacta.
    y = luma(rgb)[..., None]
    w_s = suavizado(np.float32(0.55), np.float32(0.0), y)
    w_l = suavizado(np.float32(0.45), np.float32(0.95), y)
    croma_s = TINTE_SOMBRAS - luma(TINTE_SOMBRAS)
    croma_l = TINTE_LUCES - luma(TINTE_LUCES)
    croma_s = croma_s / np.abs(croma_s).max()
    croma_l = croma_l / np.abs(croma_l).max()
    rgb = rgb + FUERZA_SOMBRAS * w_s * croma_s + FUERZA_LUCES * w_l * croma_l
    return np.clip(rgb, 0.0, 1.0).astype(np.float32)


def escribir_cube(ruta: str, n: int = 33, previo=None, titulo: str = "Touza noche") -> None:
    """Exporta `look` (opcionalmente precedido de `previo`) como LUT 3D .cube.

    Orden estándar .cube: el rojo varía más rápido, luego verde, luego azul.
    `previo` (rgb → rgb, sRGB) sirve para hornear el balance de blancos y la
    exposición de un clip concreto delante del look común.
    """
    eje = np.linspace(0.0, 1.0, n, dtype=np.float32)
    b, g, r = np.meshgrid(eje, eje, eje, indexing="ij")
    rejilla = np.stack([r, g, b], axis=-1).reshape(-1, 3)
    if previo is not None:
        rejilla = previo(rejilla)
    salida = look(rejilla)
    with open(ruta, "w", encoding="ascii", newline="\n") as f:
        f.write(f'TITLE "{titulo}"\n')
        f.write("# Generado por scripts/retoque/receta.py (no editar a mano)\n")
        f.write(f"LUT_3D_SIZE {n}\nDOMAIN_MIN 0.0 0.0 0.0\nDOMAIN_MAX 1.0 1.0 1.0\n")
        for v in salida:
            f.write(f"{v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")


# ──────────────────────── balance de blancos y exposición ───────────────────
def ganancias(rgb_lin: np.ndarray, k: float) -> np.ndarray:
    """Calienta (k > 1) o enfría (k < 1) en lineal manteniendo la luma media."""
    g = np.array([np.sqrt(k), 1.0, 1.0 / np.sqrt(k)], np.float32)
    salida = rgb_lin * g
    escala = luma(rgb_lin).mean() / max(luma(salida).mean(), 1e-6)
    return (salida * escala).astype(np.float32)


def relacion_rb(rgb: np.ndarray) -> float:
    return float(rgb[..., 0].mean() / max(rgb[..., 2].mean(), 1e-6))


def buscar_balance(rgb: np.ndarray, objetivo_rb: float, ev: float = 0.0, zona_luz: bool = False) -> float:
    """Busca la ganancia k para que la foto TERMINADA (tras el look) tenga R/B ≈ objetivo.

    Con `zona_luz` el R/B se mide solo en lo iluminado: en una foto casi negra
    (la «T») el negro teñido de petróleo del look dominaría la media.
    """
    peq = cv2.resize(rgb, (max(1, rgb.shape[1] // 8), max(1, rgb.shape[0] // 8)), interpolation=cv2.INTER_AREA)
    lin = a_lineal(peq) * np.float32(2.0**ev)

    def rb(k: float) -> float:
        fin = look(a_srgb(ganancias(lin, k)))
        if not zona_luz:
            return relacion_rb(fin)
        w = suavizado(np.float32(0.12), np.float32(0.35), luma(fin))[..., None]
        s = (fin * w).reshape(-1, 3).sum(axis=0)
        return float(s[0] / max(s[2], 1e-6))

    lo, hi = np.log(0.4), np.log(2.5)
    for _ in range(40):
        mid = (lo + hi) / 2
        if rb(float(np.exp(mid))) < objetivo_rb:
            lo = mid
        else:
            hi = mid
    return float(np.exp((lo + hi) / 2))


# ──────────────────────────────── espaciales ────────────────────────────────
def reducir_ruido(rgb: np.ndarray, fuerza: float) -> np.ndarray:
    """NLM sobre la luminancia, solo en sombras (y croma muy suave en sombras).

    `fuerza` es el parámetro h de OpenCV (≈ desviación del ruido en niveles de
    255). El NLM respeta los patrones repetidos (la pared trenzada), que es
    textura y no ruido.
    """
    if fuerza <= 0:
        return rgb
    ycc = cv2.cvtColor(rgb, cv2.COLOR_RGB2YCrCb)
    y = ycc[..., 0]
    y8 = np.clip(y * 255.0 + 0.5, 0, 255).astype(np.uint8)
    y_dn = cv2.fastNlMeansDenoising(y8, None, h=float(fuerza), templateWindowSize=7, searchWindowSize=21)
    y_dn = y_dn.astype(np.float32) / 255.0
    # Recupera la parte fraccionaria que perdió el paso a 8 bits.
    y_dn = y_dn + (y - y8.astype(np.float32) / 255.0)
    sigma = max(rgb.shape[:2]) / 400.0
    base = cv2.GaussianBlur(y, (0, 0), sigma)
    sombras = suavizado(np.float32(0.45), np.float32(0.12), base)
    ycc[..., 0] = y + (y_dn - y) * sombras
    for c in (1, 2):
        suave = cv2.GaussianBlur(ycc[..., c], (0, 0), 1.5)
        ycc[..., c] = ycc[..., c] + (suave - ycc[..., c]) * sombras * 0.8
    return np.clip(cv2.cvtColor(ycc, cv2.COLOR_YCrCb2RGB), 0.0, 1.0)


def nitidez(rgb: np.ndarray, cantidad: float = NITIDEZ_CANTIDAD) -> np.ndarray:
    """Máscara de enfoque 0,6 px sobre la luminancia, solo en bordes nítidos y
    en la zona central (donde está la copa), nunca en sombras planas."""
    if cantidad <= 0:
        return rgb
    y = luma(rgb)
    detalle = y - cv2.GaussianBlur(y, (0, 0), NITIDEZ_RADIO)
    gx = cv2.Sobel(cv2.GaussianBlur(y, (0, 0), 1.0), cv2.CV_32F, 1, 0)
    gy = cv2.Sobel(cv2.GaussianBlur(y, (0, 0), 1.0), cv2.CV_32F, 0, 1)
    borde = suavizado(np.float32(0.04), np.float32(0.25), np.sqrt(gx * gx + gy * gy))
    alto, ancho = y.shape
    yy, xx = np.mgrid[0:alto, 0:ancho].astype(np.float32)
    r = np.sqrt(((xx - ancho / 2) / (ancho * 0.42)) ** 2 + ((yy - alto * 0.55) / (alto * 0.45)) ** 2)
    centro = suavizado(np.float32(1.15), np.float32(0.7), r)
    luz = suavizado(np.float32(0.08), np.float32(0.25), cv2.GaussianBlur(y, (0, 0), 3))
    m = borde * centro * luz
    return np.clip(rgb + (cantidad * detalle * m)[..., None], 0.0, 1.0)


def mascara_vineta(alto: int, ancho: int, fuerza: float = VINETA) -> np.ndarray:
    """Factor multiplicativo: 1 en el centro, 1-fuerza en las esquinas, radio amplio."""
    yy, xx = np.mgrid[0:alto, 0:ancho].astype(np.float32)
    r = np.sqrt(((xx - (ancho - 1) / 2) / (ancho / 2)) ** 2 + ((yy - (alto - 1) / 2) / (alto / 2)) ** 2) / np.sqrt(2)
    return (1.0 - fuerza * suavizado(np.float32(0.35), np.float32(1.0), r)).astype(np.float32)


def vineta(rgb: np.ndarray, fuerza: float = VINETA) -> np.ndarray:
    if fuerza <= 0:
        return rgb
    return rgb * mascara_vineta(rgb.shape[0], rgb.shape[1], fuerza)[..., None]


def grano(rgb: np.ndarray, semilla: str, amplitud: float = GRANO) -> np.ndarray:
    """Grano monocromo de película, más visible en los medios que en negros y
    blancos. Se genera a GRANO_LADO_REF de lado largo y se escala: así tiene
    el mismo tamaño aparente en todas las fotos, sean del tamaño que sean."""
    if amplitud <= 0:
        return rgb
    alto, ancho = rgb.shape[:2]
    esc = GRANO_LADO_REF / max(alto, ancho)
    ga, gw = max(8, round(alto * esc)), max(8, round(ancho * esc))
    rng = np.random.default_rng(zlib.crc32(semilla.encode("utf-8")))
    ruido = rng.standard_normal((ga, gw)).astype(np.float32)
    ruido = cv2.GaussianBlur(ruido, (0, 0), 0.55)
    ruido /= ruido.std() + 1e-6
    ruido = cv2.resize(ruido, (ancho, alto), interpolation=cv2.INTER_CUBIC)
    y = luma(rgb)
    peso = np.clip(4.0 * y * (1.0 - y), 0.0, 1.0) ** 1.25
    return np.clip(rgb + (amplitud * ruido * peso)[..., None], 0.0, 1.0)


# ─────────────────────────────── la receta ─────────────────────────────────
@dataclass
class Ajustes:
    """Ajustes por foto (los de la tabla de la auditoría)."""

    rb_objetivo: float | None = None  # R/B final buscado (None = no tocar el balance)
    rb_zona_luz: bool = False  # medir el R/B solo en lo iluminado
    ev: float = 0.0  # exposición global
    ev_mascara: float = 0.0  # exposición solo donde hay luz (la «T» retroiluminada)
    ruido: float = 4.0  # h del NLM en sombras (0 = nada)
    nitidez: float = NITIDEZ_CANTIDAD
    vineta: float = VINETA
    grano: float = GRANO
    notas: str = ""
    extra: dict = field(default_factory=dict)


def mascara_luz(rgb_lin: np.ndarray) -> np.ndarray:
    """Máscara suave de las zonas iluminadas (la «T» y su halo)."""
    y = luma(rgb_lin)
    sigma = max(y.shape) / 80.0
    base = cv2.GaussianBlur(y, (0, 0), sigma)
    return suavizado(np.float32(0.004), np.float32(0.06), base)


def preparar(rgb: np.ndarray, aj: Ajustes) -> tuple[np.ndarray, float]:
    """Balance de blancos + exposición (en lineal). Devuelve (sRGB, k usado)."""
    lin = a_lineal(rgb) * np.float32(2.0**aj.ev)
    if aj.ev_mascara:
        m = mascara_luz(lin)
        lin = lin * (1.0 + (2.0**aj.ev_mascara - 1.0) * m)[..., None]
    k = 1.0
    if aj.rb_objetivo is not None:
        k = buscar_balance(a_srgb(lin), aj.rb_objetivo, zona_luz=aj.rb_zona_luz)
        lin = ganancias(lin, k)
    return a_srgb(lin), k


def retocar(rgb: np.ndarray, aj: Ajustes, semilla: str) -> tuple[np.ndarray, dict]:
    """Aplica la receta completa a una imagen sRGB float [0,1] (H, W, 3)."""
    x, k = preparar(rgb, aj)
    x = reducir_ruido(x, aj.ruido)
    x = look(x)
    x = nitidez(x, aj.nitidez)
    x = vineta(x, aj.vineta)
    ruido_sin_grano = medir(x)["ruido"]
    x = grano(x, semilla, aj.grano)
    return x, {"k_balance": round(k, 3), "ruido_sin_grano": ruido_sin_grano}


def medir(rgb: np.ndarray) -> dict:
    """Las mismas medidas de la auditoría: luz media, % negros, R/B y ruido en sombras."""
    a = np.clip(rgb, 0, 1).astype(np.float32) * 255.0
    lum = a @ np.array([0.299, 0.587, 0.114], np.float32)
    base = cv2.GaussianBlur(lum, (0, 0), 2)
    hp = lum - base
    sombras = base < 60
    return {
        "luz": round(float(lum.mean()), 1),
        "negros": round(float((lum < 30).mean() * 100), 1),
        "rb": round(relacion_rb(a), 3),
        "ruido": round(float(hp[sombras].std()) if sombras.any() else 0.0, 2),
    }

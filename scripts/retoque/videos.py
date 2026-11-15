"""
Vídeos de la portada de Touza con la misma receta de color que las fotos.

Uso (desde la raíz del repo; ffmpeg y ffprobe en el PATH):

    python scripts/retoque/videos.py --origen <carpeta con los vídeos> [--solo hero|clips]

Salidas (ver src/assets/videos/README.md):
  src/assets/videos/hero/bucle.webm|mp4 + poster.webp   (720×1280, 24 fps, bucle con fundido)
  src/assets/videos/clips/NN-nombre.webm|mp4|webp       (540×960, póster = primer fotograma)

Cadena por vídeo (todo en ffmpeg, sin audio):
  tramo → (recorte 9:16 con paneo) → escala → hqdn3d suave
  → lut3d «previa del clip» (balance de blancos + exposición del clip, en lineal)
  → lut3d scripts/retoque/touza-noche.cube (el look común, el mismo de las fotos)
  → viñeta (misma máscara que las fotos) → [bucle: xfade del final al principio]
  → intermedio sin pérdida (FFV1) → H.264 (+faststart) y AV1 (WebM) + póster WebP.
No lleva grano: en vídeo dispara el peso y el presupuesto es ≤ 900 KB / 1,5 MB.

Los parámetros de cada clip (tramo, recorte, objetivo de R/B y luz) están en
HERO y CLIPS. La previa del clip se calcula sola midiendo 3 fotogramas.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import receta as R  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
DESTINO = RAIZ / "src" / "assets" / "videos"
LUT_COMUN = Path(__file__).resolve().parent / "touza-noche.cube"

# Bucle del hero. Se revisaron «clover club 1 - C018» (1-7 s) y C029 (1-6 s):
# el clover club está grabado a mano (la «T» deriva hasta 65 px en el tramo) y
# el fundido del bucle dejaría una imagen doble; C029 es de trípode (deriva
# < 0,2 px), así que el bucle no se nota. Se usa C029.
HERO = dict(
    fuente="A001_11121847_C029.MP4",
    inicio=1.0, fin=6.0, fundido=1.0,
    ancho=720, alto=1280, fps=24,
    matriz="709", rango="limited",
    rb=1.50, luz=58.0,  # misma pared y «T» que la foto touza-coctel-t, algo más oscuro (va con texto encima)
    limite_kb=900,
)

# Franja de clips (IMG_04xx del iPhone: HEVC, 1440×1920 tras girar, rango
# completo, matriz BT.601). Se recortan a 9:16 (1080×1920) con un paneo que
# sigue a la copa y se bajan a 540×960. `paneo` = (a, b, c): el borde
# izquierdo del recorte, en px de 1440, es clip(a - b·(t - c), 0, 360), con t
# en segundos desde el inicio del tramo (b = 0 → recorte fijo).
CLIPS = [
    dict(nombre="01-aperol", fuente="IMG_0379.MOV", inicio=0.3, fin=3.4,
         paneo=(360, 194, 1.05), rb=1.62, luz=118.0),
    dict(nombre="02-moscow-mule", fuente="IMG_0392.MOV", inicio=0.4, fin=4.7,
         paneo=(360, 48, 0), rb=1.55, luz=112.0),
    dict(nombre="03-rosa-hibisco", fuente="IMG_0433.MOV", inicio=0.3, fin=3.5,
         paneo=(375, 61, 0), rb=1.58, luz=115.0),
    dict(nombre="04-clover-club", fuente="IMG_0397.MOV", inicio=0.3, fin=2.8,
         paneo=(180, 0, 0), rb=1.55, luz=115.0),
]
CLIP_COMUN = dict(ancho=540, alto=960, matriz="170m", rango="full", limite_kb=1536, verde=1.05)
TOTAL_PORTADA_KB = 3072


def paneo_ffmpeg(p: tuple[float, float, float]) -> str:
    a, b, c = p
    return f"clip({a}-{b}*(t-{c}),0,360)" if b else str(int(a))


def paneo_en(p: tuple[float, float, float], t: float) -> int:
    a, b, c = p
    return int(min(max(a - b * (t - c), 0), 360))


def ejecutar(cmd: list[str]) -> None:
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        print(" ".join(cmd))
        print(r.stderr[-3000:])
        raise SystemExit(f"ffmpeg falló ({r.returncode})")


def ruta_filtro(p: Path) -> str:
    """Ruta escapada para usarla dentro de un filtro de ffmpeg en Windows."""
    return str(p).replace("\\", "/").replace(":", "\\:")


def fotogramas_muestra(fuente: Path, t0: float, t1: float, cadena: str, n: int = 3) -> list[np.ndarray]:
    """Decodifica n fotogramas (RGB float) con la misma cadena previa a la LUT."""
    salida = []
    for k in range(n):
        t = t0 + (t1 - t0) * (k + 0.5) / n
        with tempfile.TemporaryDirectory() as d:
            png = Path(d) / "f.png"
            ejecutar(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(fuente), "-frames:v", "1",
                      "-vf", cadena + ",format=rgb24", str(png)])
            salida.append(np.asarray(Image.open(png).convert("RGB"), np.float32) / 255.0)
    return salida


def calcular_previa(muestras: list[np.ndarray], rb: float, luz: float, verde: float = 1.0) -> tuple[float, float, np.ndarray]:
    """EV y balance para que, tras el look, el clip quede en (luz, R/B).

    `verde` (> 1) sube un poco el verde antes de calentar: los clips de día
    calentados solo con rojo/azul dejaban el mármol melocotón y no crema como
    en las fotos de noche. Devuelve (ev, k, ganancias RGB lineales finales).
    """
    peq = np.concatenate([cv2.resize(m, (m.shape[1] // 4, m.shape[0] // 4), interpolation=cv2.INTER_AREA) for m in muestras], axis=0)
    lin0 = R.a_lineal(peq) * np.array([1.0, verde, 1.0], np.float32)

    def ganancia_total(ev: float, k: float) -> np.ndarray:
        g = np.array([np.sqrt(k), verde, 1.0 / np.sqrt(k)], np.float32) * np.float32(2.0**ev)
        # misma normalización de luma que R.ganancias (el balance no cambia la luz)
        base = R.luma(R.a_lineal(peq) * np.float32(2.0**ev)).mean()
        return g * np.float32(base / max(R.luma(R.a_lineal(peq) * g).mean(), 1e-6))

    ev = 0.0
    for _ in range(6):
        k = R.buscar_balance(R.a_srgb(lin0), rb, ev=ev)
        fin = R.look(R.a_srgb(R.a_lineal(peq) * ganancia_total(ev, k)))
        ev += float(np.log2(luz / max(R.medir(fin)["luz"], 1.0))) * 1.6  # la curva comprime: se sobrecorrige un poco
        ev = float(np.clip(ev, -2.0, 2.0))
    k = R.buscar_balance(R.a_srgb(lin0), rb, ev=ev)
    return ev, k, ganancia_total(ev, k)


def escribir_previa(ruta: Path, gan: np.ndarray, titulo: str) -> None:
    """LUT 33³ con solo la exposición y el balance del clip (sin look)."""
    n = 33
    eje = np.linspace(0.0, 1.0, n, dtype=np.float32)
    b, g, r = np.meshgrid(eje, eje, eje, indexing="ij")
    rej = np.stack([r, g, b], axis=-1).reshape(-1, 3)
    sal = R.a_srgb(R.a_lineal(rej) * gan.astype(np.float32))
    with open(ruta, "w", encoding="ascii", newline="\n") as f:
        f.write(f'TITLE "{titulo}"\nLUT_3D_SIZE {n}\n')
        for v in sal:
            f.write(f"{v[0]:.5f} {v[1]:.5f} {v[2]:.5f}\n")


def guardar_vineta(ruta: Path, ancho: int, alto: int) -> None:
    m = R.mascara_vineta(alto, ancho)
    Image.fromarray(np.clip(m * 255 + 0.5, 0, 255).astype(np.uint8)).convert("RGB").save(ruta)


def codificar(intermedio: Path, destino_base: Path, limite_kb: int, fps: str) -> dict:
    """H.264 y AV1 desde el intermedio, ajustando CRF hasta caber en el límite."""
    etiquetas = ["-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv"]
    a_yuv = "zscale=matrix=709:transfer=709:primaries=709:range=limited,format=yuv420p"
    res = {}
    mp4 = destino_base.with_suffix(".mp4")
    for crf in (21, 23, 25, 27, 29, 31):
        ejecutar(["ffmpeg", "-v", "error", "-y", "-i", str(intermedio), "-vf", a_yuv, "-an",
                  "-c:v", "libx264", "-preset", "veryslow", "-crf", str(crf), "-profile:v", "high", "-level", "4.0",
                  "-pix_fmt", "yuv420p", "-g", "48", "-movflags", "+faststart", *etiquetas, str(mp4)])
        if os.path.getsize(mp4) <= limite_kb * 1024 * 0.92:
            break
    res["mp4"] = {"crf": crf, "kb": os.path.getsize(mp4) // 1024}
    webm = destino_base.with_suffix(".webm")
    for crf in (30, 33, 36, 39, 42, 45):
        ejecutar(["ffmpeg", "-v", "error", "-y", "-i", str(intermedio), "-vf", a_yuv, "-an",
                  "-c:v", "libsvtav1", "-preset", "4", "-crf", str(crf), "-g", "48",
                  "-pix_fmt", "yuv420p", *etiquetas, str(webm)])
        # AV1 tiene que compensar: ≤ 70 % del MP4 (y del 80 % del límite).
        if os.path.getsize(webm) <= min(limite_kb * 1024 * 0.80, os.path.getsize(mp4) * 0.70):
            break
    res["webm"] = {"crf": crf, "kb": os.path.getsize(webm) // 1024, "codec": "av1"}
    return res


def poster(intermedio: Path, ruta: Path, limite_kb: int = 58) -> dict:
    """Primer fotograma del vídeo en WebP ≤ limite_kb, mismas medidas que el vídeo.

    La pared trenzada es mucha textura: si no cabe con calidad ≥ 45, se suaviza
    un poco (desenfoque de 0,5-1,1 px) antes de bajar más la calidad. El póster
    solo se ve hasta que arranca el vídeo, que ya es así de suave a 720p.
    """
    from PIL import ImageFilter

    with tempfile.TemporaryDirectory() as d:
        png = Path(d) / "p.png"
        ejecutar(["ffmpeg", "-v", "error", "-y", "-i", str(intermedio), "-frames:v", "1",
                  "-vf", "format=rgb24", str(png)])
        im = Image.open(png).convert("RGB")
    for radio in (0.0, 0.5, 0.7, 0.9, 1.1):
        prueba = im.filter(ImageFilter.GaussianBlur(radio)) if radio else im
        for q in range(85, 44, -5):
            prueba.save(ruta, "WEBP", quality=q, method=6)
            if os.path.getsize(ruta) <= limite_kb * 1024:
                return {"q": q, "desenfoque_px": radio, "kb": os.path.getsize(ruta) // 1024}
    return {"q": q, "desenfoque_px": radio, "kb": os.path.getsize(ruta) // 1024}


def procesar(fuente: Path, salida_base: Path, cfg: dict, tmp: Path, bucle: bool, recorte: str | None) -> dict:
    ancho, alto = cfg["ancho"], cfg["alto"]
    # YUV → RGB con la matriz y el rango reales del origen (sin pasar por swscale).
    a_rgb = (f"zscale=matrixin={cfg['matriz']}:rangein={cfg['rango']}:transferin=709:primariesin=709,"
             "format=gbrp16le")
    geometria = []
    if recorte:
        geometria.append(f"crop=1080:1920:x='{recorte}':y=0")
    geometria.append(f"scale={ancho}:{alto}:flags=lanczos")
    geometria = ",".join(geometria)
    muestras = fotogramas_muestra(fuente, cfg["inicio"], cfg["fin"], f"{a_rgb},{geometria}")
    ev, k, gan = calcular_previa(muestras, cfg["rb"], cfg["luz"], cfg.get("verde", 1.0))
    previa = tmp / f"previa-{salida_base.stem}.cube"
    escribir_previa(previa, gan, f"previa ev={ev:+.2f} k={k:.3f} verde={cfg.get('verde', 1.0)}")
    vineta = tmp / f"vineta-{ancho}x{alto}.png"
    guardar_vineta(vineta, ancho, alto)

    duracion = cfg["fin"] - cfg["inicio"]
    color = (f"setpts=PTS-STARTPTS,hqdn3d=1.5:1.5:4:4,{a_rgb},{geometria},"
             f"lut3d=file='{ruta_filtro(previa)}':interp=tetrahedral,"
             f"lut3d=file='{ruta_filtro(LUT_COMUN)}':interp=tetrahedral")
    grafo = f"[0:v]{color}[c];[1:v]format=gbrp16le[m];[c][m]blend=all_mode=multiply:shortest=1"
    if bucle:
        f = cfg["fundido"]
        grafo += (f",split[a][b];[a]trim=start={f}:end={duracion},setpts=PTS-STARTPTS[cuerpo];"
                  f"[b]trim=start=0:end={f},setpts=PTS-STARTPTS[cabeza];"
                  f"[cuerpo][cabeza]xfade=transition=fade:duration={f}:offset={duracion - 2 * f}")
    fps = str(cfg.get("fps") or "30000/1001")
    grafo += f",fps={fps},format=gbrp[v]"
    intermedio = tmp / f"{salida_base.stem}.mkv"
    ejecutar(["ffmpeg", "-v", "error", "-y", "-ss", f"{cfg['inicio']}", "-t", f"{duracion}", "-i", str(fuente),
              "-loop", "1", "-i", str(vineta), "-filter_complex", grafo, "-map", "[v]", "-an",
              "-c:v", "ffv1", "-level", "3", str(intermedio)])
    salida_base.parent.mkdir(parents=True, exist_ok=True)
    res = codificar(intermedio, salida_base, cfg["limite_kb"], fps)
    post = salida_base.parent / (salida_base.name + ".webp") if not bucle else salida_base.parent / "poster.webp"
    res["poster"] = poster(intermedio, post)
    dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                          str(salida_base.with_suffix(".mp4"))], capture_output=True, text=True).stdout.strip()
    res.update({"ev": round(ev, 2), "k_balance": round(k, 3), "ganancias": [round(float(v), 3) for v in gan], "duracion_s": round(float(dur), 2),
                "medida_final": R.medir(np.asarray(Image.open(post).convert("RGB"), np.float32) / 255.0)})
    copia = tmp.parent / f"{salida_base.stem}-intermedio.mkv"
    shutil.copy(intermedio, copia)
    return res


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--origen", type=Path, required=True, help="carpeta con A001_11121847_C029.MP4 e IMG_0379.MOV…")
    ap.add_argument("--destino", type=Path, default=DESTINO)
    ap.add_argument("--solo", choices=["hero", "clips"])
    ap.add_argument("--trabajo", type=Path, default=Path(tempfile.gettempdir()) / "touza-videos")
    args = ap.parse_args()
    if not LUT_COMUN.exists():
        R.escribir_cube(str(LUT_COMUN))
    tmp = args.trabajo / "tmp"
    tmp.mkdir(parents=True, exist_ok=True)

    informe = {}
    if args.solo in (None, "hero"):
        informe["hero"] = procesar(args.origen / HERO["fuente"], args.destino / "hero" / "bucle", HERO, tmp, True, None)
        print("hero", json.dumps(informe["hero"], ensure_ascii=False))
    if args.solo in (None, "clips"):
        for c in CLIPS:
            cfg = {**CLIP_COMUN, **c, "fps": None}
            informe[c["nombre"]] = procesar(args.origen / c["fuente"], args.destino / "clips" / c["nombre"], cfg, tmp, False,
                                            paneo_ffmpeg(c["paneo"]))
            print(c["nombre"], json.dumps(informe[c["nombre"]], ensure_ascii=False))

    for fmt in ("mp4", "webm"):
        total = 0
        for f in (args.destino / "hero").glob(f"*.{fmt}"):
            total += f.stat().st_size
        for f in (args.destino / "clips").glob(f"*.{fmt}"):
            total += f.stat().st_size
        aviso = "" if total <= TOTAL_PORTADA_KB * 1024 else "  ¡SUPERA EL PRESUPUESTO!"
        print(f"Total portada en {fmt}: {total // 1024} KB (máx. {TOTAL_PORTADA_KB}){aviso}")
    with open(args.trabajo / "informe-videos.json", "w", encoding="utf-8") as f:
        json.dump(informe, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()

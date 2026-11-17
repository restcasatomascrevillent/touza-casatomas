"""
Hoja de antes/después del retoque (fotos, secuencia del llenado y vídeos).

Uso (desde la raíz del repo, después de retocar y generar los vídeos):

    python scripts/retoque/hoja_antes_despues.py --videos <carpeta con los vídeos de origen>

Antes = touza-recursos/auditoria/originales-sin-retoque (y el vídeo de origen
con el mismo tramo y recorte, sin la LUT). Después = lo que hay en el repo.
Sale en touza-recursos/auditoria/retoque-antes-despues.jpg.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import receta as R  # noqa: E402
import retocar_fotos as F  # noqa: E402
import videos as V  # noqa: E402

RAIZ = F.RAIZ
AUDITORIA = RAIZ.parent / "touza-recursos" / "auditoria"
ANCHO_HOJA = 2400
ALTO_FOTO = 380
MARGEN = 14
FONDO = (22, 22, 24)
TEXTO = (235, 228, 214)
GRIS = (150, 146, 140)


def fuente(tam: int) -> ImageFont.ImageFont:
    for nombre in ("segoeui.ttf", "arial.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(nombre, tam)
        except OSError:
            continue
    return ImageFont.load_default()


F_TITULO, F_ETIQUETA, F_DATO = fuente(30), fuente(17), fuente(14)


def ficha(antes: Image.Image, despues: Image.Image, titulo: str, dato: str, alto: int = ALTO_FOTO) -> Image.Image:
    w = round(antes.width * alto / antes.height)
    a = antes.convert("RGB").resize((w, alto), Image.LANCZOS)
    d = despues.convert("RGB").resize((w, alto), Image.LANCZOS)
    t = Image.new("RGB", (2 * w + 4, alto + 48), FONDO)
    t.paste(a, (0, 0))
    t.paste(d, (w + 4, 0))
    dib = ImageDraw.Draw(t)
    dib.text((4, alto + 4), titulo, font=F_ETIQUETA, fill=TEXTO)
    dib.text((4, alto + 26), dato, font=F_DATO, fill=GRIS)
    for x, txt in ((6, "antes"), (w + 10, "después")):
        dib.rectangle([x - 2, 4, x + 62, 24], fill=(0, 0, 0))
        dib.text((x + 2, 5), txt, font=F_DATO, fill=TEXTO)
    return t


def montar(secciones: list[tuple[str, list[Image.Image]]]) -> Image.Image:
    filas: list[tuple[str | None, list[Image.Image]]] = []
    for titulo, fichas in secciones:
        filas.append((titulo, []))
        actual: list[Image.Image] = []
        ancho = 0
        for f in fichas:
            if actual and ancho + f.width > ANCHO_HOJA - MARGEN:
                filas.append((None, actual))
                actual, ancho = [], 0
            actual.append(f)
            ancho += f.width + MARGEN
        if actual:
            filas.append((None, actual))
    alto_total = MARGEN + sum((52 if t else max(f.height for f in fs) + MARGEN) for t, fs in filas)
    hoja = Image.new("RGB", (ANCHO_HOJA, alto_total), FONDO)
    dib = ImageDraw.Draw(hoja)
    y = MARGEN
    for titulo, fs in filas:
        if titulo:
            dib.text((MARGEN, y + 8), titulo, font=F_TITULO, fill=TEXTO)
            y += 52
            continue
        x = MARGEN
        for f in fs:
            hoja.paste(f, (x, y))
            x += f.width + MARGEN
        y += max(f.height for f in fs) + MARGEN
    return hoja


def dato(img: Image.Image) -> dict:
    return R.medir(np.asarray(img.convert("RGB"), np.float32) / 255.0)


def fotograma_origen(fuente: Path, t: float, cadena: str) -> Image.Image:
    with tempfile.TemporaryDirectory() as d:
        png = Path(d) / "f.png"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(fuente), "-frames:v", "1",
                        "-vf", cadena + ",format=rgb24", str(png)], check=True)
        return Image.open(png).convert("RGB")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--antes", type=Path, default=F.ORIGEN_DEFECTO)
    ap.add_argument("--videos", type=Path, help="carpeta con los vídeos de origen (si no, solo fotos)")
    ap.add_argument("--salida", type=Path, default=AUDITORIA / "retoque-antes-despues.jpg")
    args = ap.parse_args()

    secciones = []
    fichas = []
    for nombre, aj in F.AJUSTES.items():
        a = Image.open(args.antes / f"{nombre}.webp")
        d = Image.open(F.DESTINO / f"{nombre}.webp")
        ma, md = dato(a), dato(d)
        texto = (f"luz {ma['luz']:.0f}→{md['luz']:.0f} · R/B {ma['rb']:.2f}→{md['rb']:.2f} · "
                 f"ruido {ma['ruido']:.1f}→{md['ruido']:.1f}")
        fichas.append(ficha(a, d, f"{nombre} · {aj.notas.split(':')[-1].strip()}"[:58], texto))
    secciones.append(("Fotos de la web (15 maestros) — receta única + LUT touza-noche.cube", fichas))

    llen = RAIZ / "src" / "assets" / "secuencias" / "llenado"
    fichas = []
    for i in (1, 4, 10):
        a = Image.open(args.antes / "llenado" / f"{i:02d}.webp")
        d = Image.open(llen / f"{i:02d}.webp")
        fichas.append(ficha(a, d, f"llenado {i:02d}.webp", "realineado sobre la copa · monitor del TPV apagado", 300))
    secciones.append(("Secuencia del llenado (hero de /carta)", fichas))

    if args.videos:
        fichas = []
        h = V.HERO
        cadena = f"zscale=matrixin={h['matriz']}:rangein={h['rango']}:transferin=709:primariesin=709"
        a = fotograma_origen(args.videos / h["fuente"], h["inicio"] + h["fundido"], cadena)
        d = Image.open(RAIZ / "src" / "assets" / "videos" / "hero" / "poster.webp")
        fichas.append(ficha(a, d, "hero · C029 (1-6 s), bucle 4 s", "póster = primer fotograma del bucle", 420))
        for c in V.CLIPS:
            cfg = {**V.CLIP_COMUN, **c}
            x = V.paneo_en(c["paneo"], 0.0)
            cadena = (f"zscale=matrixin={cfg['matriz']}:rangein={cfg['rango']}:transferin=709:primariesin=709,"
                      f"crop=1080:1920:{int(x)}:0,scale={cfg['ancho']}:{cfg['alto']}")
            a = fotograma_origen(args.videos / c["fuente"], c["inicio"], cadena)
            d = Image.open(RAIZ / "src" / "assets" / "videos" / "clips" / f"{c['nombre']}.webp")
            fichas.append(ficha(a, d, f"{c['nombre']} · {c['fuente']}", f"{c['inicio']}-{c['fin']} s", 420))
        secciones.append(("Vídeos de la portada (primer fotograma: origen sin retocar / póster con la LUT)", fichas))

    hoja = montar(secciones)
    args.salida.parent.mkdir(parents=True, exist_ok=True)
    hoja.save(args.salida, "JPEG", quality=84, optimize=True)
    print(f"{args.salida} ({hoja.width}×{hoja.height})")


if __name__ == "__main__":
    main()

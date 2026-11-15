"""
Retoca los maestros de la web de Touza con la receta única (receta.py).

Uso (desde la raíz del repo):

    python scripts/retoque/retocar_fotos.py            # retoca y escribe los maestros
    python scripts/retoque/retocar_fotos.py --previa   # solo una prueba reducida en --previa-dir
    npm run imagenes                                   # después: variantes AVIF/WebP + og-image

Lee SIEMPRE los maestros sin retocar (copia de seguridad en
touza-recursos/auditoria/originales-sin-retoque/, ver --origen), nunca los de
src/assets/originales: así se puede volver a ejecutar sin retocar dos veces.
Escribe en src/assets/originales/ con el mismo nombre y las mismas medidas
(imagenes.ts y dimensiones.json siguen valiendo) y exporta la LUT común en
scripts/retoque/touza-noche.cube.

Solo toca las 15 fotos de la tabla de la auditoría (§2); las otras 14 quedan
como estaban hasta que se usen.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import receta as R  # noqa: E402

RAIZ = Path(__file__).resolve().parents[2]
ORIGEN_DEFECTO = RAIZ.parent / "touza-recursos" / "auditoria" / "originales-sin-retoque"
DESTINO = RAIZ / "src" / "assets" / "originales"
LUT = Path(__file__).resolve().parent / "touza-noche.cube"

# Peso máximo de los maestros que la auditoría marca como demasiado pesados.
LIMITE_KB = {"touza-coctel-t": 700, "touza-logo": 700}
CALIDAD_MAESTRO = 90

# Ajustes por foto (auditoría §2 y §4). R/B final al rango 1,50-1,65.
A = R.Ajustes
AJUSTES: dict[str, R.Ajustes] = {
    # Hero de la portada y og:image. Muy cálida (1,84): se enfría hacia 1,65.
    "touza-2": A(rb_objetivo=1.65, ruido=9, notas="interior: -cálida, ruido fuerte en sombras"),
    "touza-5": A(rb_objetivo=1.57, ruido=4, notas="barra"),
    "touza-7": A(rb_objetivo=1.62, ev=0.3, ruido=4, notas="mojito: +0,3 EV"),
    "touza-8-1": A(rb_objetivo=1.62, ruido=4, notas="champán"),
    "touza-10": A(rb_objetivo=1.62, ruido=4, notas="botellas"),
    # Fría (1,26). Lo que la auditoría midió como «ruido» es sobre todo la
    # textura trenzada de la pared (nítida): el NLM quita el ruido y la respeta.
    "touza-coctel-t": A(rb_objetivo=1.50, ruido=9, nitidez=0.0, notas="coctel-t: +calidez, ruido fuerte"),
    "touza-sirviendo": A(rb_objetivo=1.50, ruido=4, notas="sirviendo: +calidez"),
    "touza-copa-roja-2": A(rb_objetivo=1.50, ruido=4, notas="copa-roja-2: la más fría, +calidez"),
    "touza-logo": A(rb_objetivo=1.50, rb_zona_luz=True, ev_mascara=0.8, ruido=9, nitidez=0.0, notas="logo: +0,8 EV en la «T», ruido fuerte"),
    "touza-moscow-mule": A(rb_objetivo=1.50, ev=0.3, ruido=4, notas="moscow mule: +0,3 EV"),
    # Quemada (168 de luz media): -0,6 EV. Ya trae viñeta del móvil.
    "touza-mango": A(rb_objetivo=1.56, ev=-0.6, ruido=0, vineta=0.0, notas="mango: -0,6 EV, sin viñeta extra"),
    "touza-pina-botellas": A(rb_objetivo=1.65, ruido=4, notas="piña: la más cálida (2,05), se enfría"),
    "touza-aperol": A(rb_objetivo=1.65, ruido=4, notas="aperol"),
    "touza-mojito-2": A(rb_objetivo=1.55, ruido=4, notas="mojito barra"),
    "touza-estanteria": A(rb_objetivo=1.50, ruido=9, notas="estantería: +calidez, ruido fuerte"),
    # La sala (IMG_0420 de «Local y ambiente», 15/11/2026), reducida a 1708 px
    # de ancho antes del retoque. Muy fría (1,23): se calienta a 1,55.
    "touza-sala": A(rb_objetivo=1.55, ruido=4, notas="sala: +calidez"),
}


def cargar(ruta: Path) -> np.ndarray:
    return np.asarray(Image.open(ruta).convert("RGB"), dtype=np.float32) / 255.0


def a_imagen(x: np.ndarray) -> Image.Image:
    return Image.fromarray(np.clip(x * 255.0 + 0.5, 0, 255).astype(np.uint8))


def guardar_maestro(img: Image.Image, ruta: Path, limite_kb: int | None) -> tuple[int, Image.Image]:
    """WebP q90. Si hay límite de peso: baja la calidad hasta q80 y, si no
    basta, reduce a 2000 px de lado largo (misma proporción, auditoría §4) y
    vuelve a probar desde q90. Devuelve (calidad, imagen guardada)."""
    for intento in range(2):
        calidad = CALIDAD_MAESTRO
        minima = 80 if intento == 0 else 70
        while True:
            img.save(ruta, "WEBP", quality=calidad, method=6)
            if limite_kb is None or os.path.getsize(ruta) < limite_kb * 1000:  # KB decimales: el más estricto
                return calidad, img
            if calidad <= minima:
                break
            calidad -= 2
        esc = 2000 / max(img.size)
        if esc >= 1:
            return calidad, img
        img = img.resize((round(img.width * esc), round(img.height * esc)), Image.LANCZOS)
    return calidad, img


def borrar_variantes_sobrantes(nombre: str, ancho: int) -> list[str]:
    """generar-imagenes.mjs no amplía ni borra: si el maestro encoge, las
    variantes más anchas que el nuevo maestro quedarían viejas en el glob de
    imagenes.ts. Se borran aquí."""
    borradas = []
    for f in (RAIZ / "src" / "assets" / "img").glob(f"{nombre}-*.*"):
        resto = f.stem[len(nombre) + 1:]
        if resto.isdigit() and int(resto) > ancho:
            f.unlink()
            borradas.append(f.name)
    return borradas


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--origen", type=Path, default=ORIGEN_DEFECTO, help="maestros sin retocar")
    ap.add_argument("--previa", action="store_true", help="prueba a tamaño reducido, sin tocar el repo")
    ap.add_argument("--previa-dir", type=Path, default=Path(os.environ.get("TEMP", ".")) / "touza-retoque-previa")
    ap.add_argument("--escala", type=float, default=0.4, help="escala de la previa")
    ap.add_argument("--solo", nargs="*", help="limitar a estos nombres (sin .webp)")
    args = ap.parse_args()

    nombres = args.solo or list(AJUSTES)
    informe = {}
    if not args.previa:
        R.escribir_cube(str(LUT))
        print(f"LUT: {LUT.relative_to(RAIZ)}")
    destino = args.previa_dir if args.previa else DESTINO
    destino.mkdir(parents=True, exist_ok=True)

    for nombre in nombres:
        aj = AJUSTES[nombre]
        origen = args.origen / f"{nombre}.webp"
        im = Image.open(origen).convert("RGB")
        tam = im.size
        if args.previa:
            im = im.resize((round(tam[0] * args.escala), round(tam[1] * args.escala)), Image.LANCZOS)
        x = np.asarray(im, dtype=np.float32) / 255.0
        antes = R.medir(x)
        y, extra = R.retocar(x, aj, semilla=nombre)
        despues = R.medir(y)
        salida = a_imagen(y)
        assert salida.size == im.size
        ruta = destino / f"{nombre}.webp"
        calidad, guardada = guardar_maestro(salida, ruta, LIMITE_KB.get(nombre))
        kb = os.path.getsize(ruta) // 1024
        if guardada.size != salida.size:
            print(f"  {nombre}: reducido a {guardada.size[0]}x{guardada.size[1]} para bajar de {LIMITE_KB[nombre]} KB")
            if not args.previa:
                print("  variantes sobrantes borradas:", borrar_variantes_sobrantes(nombre, guardada.size[0]))
        informe[nombre] = {"antes": antes, "despues": despues, **extra, "calidad": calidad, "kb": kb,
                           "medidas": list(guardada.size), "notas": aj.notas}
        print(f"{nombre:22s} luz {antes['luz']:6.1f}->{despues['luz']:6.1f}  negros {antes['negros']:5.1f}->{despues['negros']:5.1f}"
              f"  R/B {antes['rb']:.2f}->{despues['rb']:.2f}  ruido {antes['ruido']:5.2f}->{despues['ruido']:5.2f}"
              f" (sin grano {extra['ruido_sin_grano']:5.2f})  {kb} KB (q{calidad})")

    ruta_informe = destino / "informe-retoque.json" if args.previa else Path(__file__).resolve().parent / "informe-retoque.json"
    previo = json.loads(ruta_informe.read_text(encoding="utf-8")) if ruta_informe.exists() else {}
    previo.update(informe)  # con --solo se actualizan solo esas fotos
    ruta_informe.write_text(json.dumps({n: previo[n] for n in AJUSTES if n in previo}, ensure_ascii=False, indent=2),
                            encoding="utf-8")


if __name__ == "__main__":
    main()

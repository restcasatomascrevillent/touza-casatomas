"""
Variante móvil de la secuencia de la copa (hero de /carta, HeroLlenado.tsx).

En el móvil el hero es vertical (la foto ocupa el 64 % de alto de la
pantalla) y los fotogramas de 1280×1024 se pintan con `object-cover`: solo
se ve la franja central (~60 % del ancho) y el resto se descargaba para nada
(auditoría de carga v0.10, punto 5). Aquí se recorta esa franja central
(880×1024, el centro horizontal, como `object-[50%_30%]`) y se reduce a
704×819. Mismo encuadre, ~45 % de los píxeles.

Uso (desde la raíz del repo), después de `llenado.py` o al cambiar los
fotogramas:

    python scripts/retoque/llenado_movil.py

Lee src/assets/secuencias/llenado/NN.webp y escribe
src/assets/secuencias/llenado-movil/NN.webp con los mismos nombres.
"""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parents[2]
ORIGEN = RAIZ / "src" / "assets" / "secuencias" / "llenado"
DESTINO = RAIZ / "src" / "assets" / "secuencias" / "llenado-movil"

ANCHO_RECORTE = 880  # de 1280: cubre pantallas verticales hasta ~0,55 de proporción
SALIDA = (704, 819)
CALIDAD = 72


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)
    total = 0
    for ruta in sorted(ORIGEN.glob("*.webp")):
        im = Image.open(ruta).convert("RGB")
        x0 = (im.width - ANCHO_RECORTE) // 2
        recorte = im.crop((x0, 0, x0 + ANCHO_RECORTE, im.height)).resize(SALIDA, Image.LANCZOS)
        salida = DESTINO / ruta.name
        recorte.save(salida, "WEBP", quality=CALIDAD, method=6)
        total += os.path.getsize(salida)
        print(f"  {salida.name}: {os.path.getsize(salida) // 1024} KB")
    print(f"Total: {total // 1024} KB")


if __name__ == "__main__":
    main()

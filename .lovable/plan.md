

## Plan: Mejoras Premium de UX para Touza

Mejoras enfocadas en elevar la experiencia del usuario con micro-interacciones, transiciones entre paginas mas cinematicas, y detalles visuales que transmiten lujo y cuidado.

---

### 1. Transiciones de pagina cinematicas

**`src/components/PageTransition.tsx`** - Reescribir con efecto de cortina/fade mas sofisticado:
- Entrada: fade-in con un sutil desplazamiento vertical (y: 20px) y un ligero blur que se disipa
- Salida: fade-out rapido sin blur
- Duracion: 0.5s entrada, 0.3s salida
- Esto crea una sensacion mas cinematica al navegar entre paginas

### 2. ScrollTextReveal real (texto que se revela palabra a palabra)

**`src/components/ScrollTextReveal.tsx`** - Implementar revelacion real:
- Cada palabra se anima individualmente con `whileInView`
- Opacidad de 0.15 a 1 conforme entra en el viewport
- Usa `useScroll` + `useTransform` de Framer Motion para vincular la opacidad al progreso de scroll
- Efecto: el texto parece "escribirse" conforme el usuario baja, como en las paginas de Apple

### 3. Cursor personalizado (solo desktop)

**`src/components/CustomCursor.tsx`** - Nuevo componente:
- Circulo pequeno (8px) que sigue el cursor con un ligero retraso (spring animation)
- Al hacer hover sobre elementos interactivos (links, botones, cards), el circulo crece (40px) y se vuelve semi-transparente
- Solo se muestra en desktop (oculto en touch devices)
- Se anade en `Layout.tsx`

### 4. Parallax sutil en imagenes de las ShowcaseSections

**`src/components/home/ShowcaseSection.tsx`** - Mejorar:
- Anadir efecto parallax con `useScroll` + `useTransform` en la imagen
- La imagen se mueve ligeramente (translateY del -5% al 5%) al hacer scroll
- Crea profundidad visual sin ser agresivo

**`src/components/home/ShowcaseMobile.tsx`** - Mismo efecto pero mas sutil (translateY del -3% al 3%)

### 5. Header que desaparece al bajar y reaparece al subir

**`src/components/layout/Header.tsx`** - Mejorar comportamiento:
- Al hacer scroll hacia abajo: el header se oculta con una transicion suave (translateY: -100%)
- Al hacer scroll hacia arriba: el header reaparece con blur y fondo oscuro
- Esto libera espacio visual y es un patron premium usado por Apple, Stripe, etc.
- Se mantiene visible en la parte superior de la pagina (primeros 50px)

### 6. Numeros animados en la seccion de Features

**`src/components/home/FeaturesGrid.tsx`** - Anadir datos con contadores:
- Cambiar el grid para incluir estadisticas con numeros que se animan al entrar en pantalla
- Ejemplo: "200+ Cocteles", "5 Anos", "El Unico Reservado Privado"
- Los numeros cuentan de 0 al valor final con una animacion suave
- Efecto de "counting up" que transmite dinamismo

### 7. Efecto hover magnetico en botones principales

**`src/hooks/useMagneticEffect.ts`** - Nuevo hook:
- En desktop, los botones principales (CTA del hero, botones de navegacion) se desplazan ligeramente hacia el cursor cuando este se acerca
- Desplazamiento maximo de 4-6px
- Spring animation para el retorno
- Se aplica a los botones del HeroDesktop y ShowcaseSection

### 8. Loading screen premium

**`src/App.tsx`** - Mejorar el PageLoader:
- En vez del spinner generico, mostrar el logo "TOUZA" en grande con una animacion de fade-in
- Una linea de progreso fina debajo que se llena
- Al completar, fade-out del loader con una animacion de escala sutil
- Solo se muestra la primera vez (no en cada navegacion)

### 9. Footer con separador animado

**`src/components/layout/Footer.tsx`** - Mejorar:
- Anadir una linea horizontal dorada fina antes del footer que se expande de centro hacia los lados al entrar en viewport (whileInView, scaleX de 0 a 1)
- Anadir un CTA final tipo "Reserva tu experiencia" antes del footer con tipografia grande

### 10. Galeria lightbox con gestos swipe

**`src/pages/Galeria.tsx`** - Mejorar lightbox:
- Implementar deteccion de swipe (drag de Framer Motion) para navegar entre imagenes
- `drag="x"` con `dragConstraints` y `onDragEnd` para detectar la direccion
- Animacion de transicion entre imagenes con slide horizontal
- Contador de imagenes con estilo pill flotante

---

### Seccion Tecnica

**Archivos nuevos:**
| Archivo | Descripcion |
|---------|-------------|
| `src/components/CustomCursor.tsx` | Cursor personalizado con efecto grow en hover |
| `src/hooks/useMagneticEffect.ts` | Hook para efecto magnetico en botones |

**Archivos modificados:**
| Archivo | Cambios |
|---------|---------|
| `src/components/PageTransition.tsx` | Transicion cinematica con blur |
| `src/components/ScrollTextReveal.tsx` | Revelacion palabra por palabra vinculada al scroll |
| `src/components/layout/Header.tsx` | Auto-hide al bajar, reaparece al subir |
| `src/components/layout/Footer.tsx` | Linea animada + CTA final |
| `src/components/layout/Layout.tsx` | Integrar CustomCursor |
| `src/components/home/ShowcaseSection.tsx` | Parallax en imagenes |
| `src/components/home/ShowcaseMobile.tsx` | Parallax sutil |
| `src/components/home/FeaturesGrid.tsx` | Numeros animados con contadores |
| `src/pages/Galeria.tsx` | Swipe gestures en lightbox |
| `src/App.tsx` | Loading screen premium |

Total: 2 archivos nuevos, 10 modificados.


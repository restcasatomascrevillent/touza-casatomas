

## Plan: Animaciones scroll-triggered + Imagenes de fondo en Carta

### Resumen

Mejorar las animaciones en todas las paginas para que los elementos aparezcan conforme el usuario baja (scroll-triggered), y anadir una imagen de fondo inmersiva en la seccion hero de la pagina Carta usando fotos reales de Touza.

---

### 1. Carta - Hero con imagen de fondo

Anadir una imagen de fondo inmersiva al hero de la pagina Carta, similar al estilo del hero del Index y Reservado.

**`src/pages/Carta.tsx`** - Cambios en el hero:
- Anadir imagen de fondo del bar: `https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-5-scaled.webp`
- Gradiente oscuro encima para legibilidad del texto
- Aumentar la altura del hero (de solo padding a una seccion con min-height)
- Animacion de entrada con scale sutil en la imagen (como en HeroDesktop)

### 2. Carta - Animaciones scroll-triggered en el contenido

**`src/pages/Carta.tsx`** - Mejorar animaciones:
- Cambiar el grid de cocteles de `animate="show"` (que anima al montar) a `whileInView` para que aparezcan al hacer scroll
- Anadir `viewport={{ once: true, margin: "-50px" }}` a todos los motion elements
- Las bebidas genericas (champagne, cervezas, etc.) tambien con `whileInView` y stagger
- Seccion de tapas: titulo y cards con `whileInView` y stagger progresivo
- Cada card de coctel individual con animacion `whileInView` con delay escalonado

### 3. Galeria - Animaciones scroll-triggered

**`src/pages/Galeria.tsx`** - Mejorar:
- Cada imagen del grid con `whileInView` individual en vez de animacion de grupo
- Stagger visual: delay basado en el indice (index * 0.05) para efecto cascada
- Anadir imagen de fondo sutil al hero (opcional, fondo negro funciona bien)

### 4. Reservado - Mas animaciones scroll

**`src/pages/Reservado.tsx`** - Mejorar:
- Anadir animaciones `whileInView` a los labels y titulos de la seccion de galeria
- Formulario: cada campo con animacion escalonada conforme aparece en pantalla
- Boton de envio con animacion separada

### 5. Contacto - Animaciones scroll

**`src/pages/Contacto.tsx`** - Mejorar:
- Info de contacto: ya tiene `whileInView`, mantener
- Formulario: envolver cada campo del formulario en motion.div con `whileInView` escalonado
- Mapa con animacion de aparicion (fade + scale sutil)
- Redes sociales con animacion de entrada

### 6. Home (Desktop + Mobile) - Refinar animaciones

**`src/components/home/FeaturesGrid.tsx`** y **`src/components/home/FeaturesMobile.tsx`**:
- Ya tienen `whileInView`, solo asegurar que el margin sea `-80px` para que se disparen antes del borde de pantalla

**`src/components/VisitUs.tsx`**:
- Ya tiene `whileInView`, verificar consistencia

### 7. NotFound - Animacion de entrada

**`src/pages/NotFound.tsx`**:
- Envolver en motion.div con fade-in inicial para el titulo 404 y los textos

---

### Seccion Tecnica

**Patron de animacion consistente para todos los elementos:**

```typescript
// Elementos individuales
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
>

// Elementos con stagger (listas, grids)
<motion.div
  initial={{ opacity: 0, y: 25 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
>

// Imagenes grandes (scale reveal)
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
>
```

**Imagen de fondo para Carta hero:**
- URL: `https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-5-scaled.webp` (imagen de la barra/cocteles)
- Gradiente: `bg-gradient-to-b from-black/60 via-black/40 to-black`
- La seccion hero pasara de ser solo texto con padding a tener min-height relativa con imagen de fondo y contenido centrado verticalmente

**Resumen de archivos modificados:**

| Archivo | Cambios |
|---------|---------|
| `src/pages/Carta.tsx` | Hero con imagen de fondo + animaciones whileInView en grid y tapas |
| `src/pages/Galeria.tsx` | Animaciones whileInView individuales por imagen |
| `src/pages/Reservado.tsx` | Animaciones escalonadas en formulario y galeria |
| `src/pages/Contacto.tsx` | Animaciones escalonadas en formulario y mapa |
| `src/pages/NotFound.tsx` | Animaciones de entrada con framer-motion |

Total: 5 archivos modificados.



## Plan: Rediseno Apple Design para todas las paginas

Se aplicara el estilo Apple (tipografia masiva, espaciado generoso, animaciones suaves con ease [0.25, 0.1, 0.25, 1], fondos negros puros, minimalismo) a todas las paginas del sitio, con vistas separadas mobile/desktop donde sea necesario.

---

### Cambios Globales

**`src/index.css`** - Nuevas utilidades Apple:
- Clase `.apple-ease` con transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1)
- Clase `.text-balance` con text-wrap: balance
- Eliminar App.css innecesario (estilos de Vite boilerplate)

**`src/App.css`** - Eliminar archivo completo (estilos sobrantes del scaffold de Vite que no se usan)

**`src/components/layout/Header.tsx`** - Refinar estilo Apple:
- Logo mas limpio, sin subtitulo "Cocktail Bar" en movil
- Navegacion desktop con tracking mas amplio y font-weight light
- Menu movil: fondo negro puro, items con mas padding, sin bordes redondeados excesivos
- Blur mas sutil en scroll

**`src/components/layout/Footer.tsx`** - Estilo Apple:
- Fondo negro puro (bg-black)
- Tipografia mas ligera
- Espaciado mas generoso entre secciones
- Links sin decoracion, solo hover color

**`src/components/MobileReserveCTA.tsx`** - Refinar:
- Fondo negro puro con blur
- Boton mas limpio con esquinas mas suaves (rounded-2xl)
- Sin sombras doradas excesivas
- Sin icono Sparkles (demasiado ruidoso)

---

### Pagina Index (/)

**`src/pages/Index.tsx`** - Convertir en router mobile/desktop:
```typescript
const Index = () => {
  const isMobile = useIsMobile();
  return isMobile ? <IndexMobile /> : <IndexDesktop />;
};
```

**Nuevos archivos:**

| Archivo | Descripcion |
|---------|-------------|
| `src/components/home/IndexDesktop.tsx` | Composicion completa desktop |
| `src/components/home/IndexMobile.tsx` | Composicion completa mobile |
| `src/components/home/HeroDesktop.tsx` | Hero inmersivo con titulo text-[12rem], parallax sutil |
| `src/components/home/HeroMobile.tsx` | Hero optimizado: titulo text-6xl, botones full-width, sin scroll indicator |
| `src/components/home/ShowcaseSection.tsx` | Reemplaza StickyScrollSection: imagen full-width con scale-reveal, texto centrado debajo |
| `src/components/home/ShowcaseMobile.tsx` | Imagen aspect-4/5, texto debajo, CTA full-width |
| `src/components/home/FeaturesGrid.tsx` | 3 columnas con iconos grandes, fondo negro puro |
| `src/components/home/FeaturesMobile.tsx` | Stack vertical, layout horizontal por item |

**`src/components/VisitUs.tsx`** - Rediseno:
- Eliminar textura cubes y spin animation del fondo
- Fondo negro limpio
- Grid mas espacioso con separadores finos
- Datos de contacto reales (corregir direccion placeholder)

---

### Pagina Carta (/carta)

**`src/pages/Carta.tsx`** - Refactorizar con vistas separadas:

**Desktop:**
- Hero mas inmersivo: titulo text-8xl, mas espacio negativo (pt-48 pb-40)
- Tabs con estilo Apple: pill buttons mas grandes, sin iconos dentro de los tabs (limpieza visual)
- Buscador mas minimal: sin icono Search visible, placeholder centrado, border solo al focus
- Grid de cocteles: gap mas generoso, hover sutil (solo opacity change, sin translate)
- Cards de bebidas genericas: sin bordes, solo separador inferior fino, fondo transparente
- Modal de detalle: mas espacio, tipografia mas grande

**Mobile:**
- Hero reducido: titulo text-4xl, pt-28 pb-12
- Tabs horizontales scrollables con snap
- Grid cocteles 2 columnas con gap reducido
- Cards mas compactas con tap feedback
- Modal fullscreen con gesture dismiss

---

### Pagina Galeria (/galeria)

**`src/pages/Galeria.tsx`** - Rediseno Apple:

**Desktop:**
- Hero minimalista: titulo text-8xl, sin imagen de fondo (fondo negro puro)
- Filtros como pills flotantes centrados
- Grid masonry-like: imagenes con rounded-2xl, gap generoso
- Hover: overlay minimalista sin texto "Ver", solo oscurecimiento sutil
- Lightbox: fondo negro puro, navegacion con flechas minimalistas

**Mobile:**
- Hero compacto
- Filtros scrollables horizontalmente
- Grid 2 columnas uniforme, aspect-square
- Tap para abrir lightbox, swipe para navegar
- Navegacion lightbox con botones mas grandes en zona inferior

---

### Pagina Reservado (/reservado)

**`src/pages/Reservado.tsx`** - Rediseno Apple:

**Desktop:**
- Hero inmersivo: imagen full-width con titulo superpuesto text-8xl
- Features en fila horizontal con iconos grandes y texto centrado, sin cards con borde
- Galeria: imagenes con scale-reveal al scroll, rounded-2xl
- Formulario: inputs con estilo minimal (border-bottom only o bordes muy sutiles), labels floating style

**Mobile:**
- Hero con titulo text-4xl
- Features en grid 2x2 compacto
- Galeria scroll horizontal con snap
- Formulario: inputs full-width con altura generosa (h-14), labels arriba

---

### Pagina Contacto (/contacto)

**`src/pages/Contacto.tsx`** - Rediseno Apple:

**Desktop:**
- Hero minimalista: solo titulo text-8xl centrado, fondo negro
- Layout 2 columnas: info contacto a la izquierda con iconos grandes y espaciado generoso, formulario a la derecha en card sutil
- Mapa con bordes redondeados (rounded-2xl), sin filtro grayscale
- Redes sociales: iconos mas grandes

**Mobile:**
- Hero compacto
- Info de contacto en stack vertical con cards individuales
- Formulario full-width debajo
- Mapa full-width con rounded-xl

---

### Pagina NotFound (404)

**`src/pages/NotFound.tsx`** - Estilo Apple:
- Titulo "404" masivo (text-[12rem]) en font-sans, ultra-light, color white/10
- Subtitulo elegante centrado
- Boton estilo Apple: blanco con texto negro, rounded-full
- Sin icono de flecha

---

### Resumen de archivos

| Archivo | Accion |
|---------|--------|
| `src/pages/Index.tsx` | Modificar - router mobile/desktop |
| `src/components/home/IndexDesktop.tsx` | Crear |
| `src/components/home/IndexMobile.tsx` | Crear |
| `src/components/home/HeroDesktop.tsx` | Crear |
| `src/components/home/HeroMobile.tsx` | Crear |
| `src/components/home/ShowcaseSection.tsx` | Crear |
| `src/components/home/ShowcaseMobile.tsx` | Crear |
| `src/components/home/FeaturesGrid.tsx` | Crear |
| `src/components/home/FeaturesMobile.tsx` | Crear |
| `src/components/VisitUs.tsx` | Modificar |
| `src/components/layout/Header.tsx` | Modificar |
| `src/components/layout/Footer.tsx` | Modificar |
| `src/components/MobileReserveCTA.tsx` | Modificar |
| `src/pages/Carta.tsx` | Modificar |
| `src/pages/Galeria.tsx` | Modificar |
| `src/pages/Reservado.tsx` | Modificar |
| `src/pages/Contacto.tsx` | Modificar |
| `src/pages/NotFound.tsx` | Modificar |
| `src/index.css` | Modificar |
| `src/App.css` | Eliminar |

Total: 9 archivos nuevos, 10 modificados, 1 eliminado.


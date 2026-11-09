# NetDrop Icons System

Sistema unificado de iconografía técnica para NetDrop-Web.
Basado en **Lucide** (trazo 1.5px, licencia ISC) y **Simple Icons** (marcas monocromáticas, licencia CC0).

## Estructura
- `sprite.svg`: Sprite SVG con todos los símbolos disponibles (`#i-{nombre}`).
- `icons.css`: Tokens CSS, escala de tamaños (.icon--sm, .icon--md, .icon--lg, .icon--xl) y baldosa .icon-tile.
- `icons/lucide/`: SVGs fuente de interfaz y utilidades.
- `icons/brands/`: SVGs fuente de marcas (Python, Rust, Linux, GitHub).
- `preview.html`: Catálogo interactivo de previsualización en tema oscuro.
- `LICENSE-lucide.txt` y `LICENSE-simple-icons.txt`: Licencias legales.

## Uso en HTML
```html
<!-- Icono de interfaz -->
<svg class="icon icon--md" aria-hidden="true">
  <use href="#i-qr-code"/>
</svg>

<!-- Icono de marca -->
<svg class="icon icon--brand icon--md" aria-hidden="true">
  <use href="#i-python"/>
</svg>
```

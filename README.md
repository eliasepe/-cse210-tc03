# Mussri Cocina — Recetario digital de Doctor Mussri

SPA ligera en HTML, CSS y JavaScript vanilla. Pensada para la comunidad de [@doctormussri](https://www.instagram.com/doctormussri/): encontrar recetas de Instagram, filtrarlas y cocinarlas cómodo desde el teléfono.

Abre `index.html` en el navegador (o sirve la carpeta con cualquier static server).

## 1. Estructura del proyecto

```
/
├── index.html
├── styles.css
├── app.js
├── recipes.js
├── manifest.webmanifest
├── sw.js
├── assets/
│   ├── images/
│   ├── icons/
│   └── logo/
└── README.md
```

| Archivo | Rol |
|---|---|
| `recipes.js` | Datos de recetas + categorías + atajos |
| `app.js` | UI, búsqueda, filtros, favoritos, modo cocinar |
| `styles.css` | Sistema visual y tokens de marca |
| `manifest.webmanifest` / `sw.js` | Base PWA (instalable / offline futuro) |

## 2. Cómo agregar una receta

1. Abre `recipes.js`.
2. Copia `RECIPE_TEMPLATE` o un objeto existente dentro del array `RECIPES`.
3. Completa **solo datos verificados** del post/reel original.
4. Si falta un dato: usa `null`, `[]` o el texto `"No especificado"`.
5. Guarda `instagramUrl` con el enlace al reel/post.
6. Pon `isDemo: false` (o elimínalo) para contenido real.

No inventes ingredientes, cantidades, tiempos ni macros.

## 3. Cómo agregar una imagen

1. Guarda el archivo en `assets/images/` (ej. `pollo-cremoso.jpg`).
2. En la receta: `image: "assets/images/pollo-cremoso.jpg"`.
3. Completa `imageAlt` con una descripción corta.
4. Si no hay imagen pública fiable, deja `image: ""` — la UI muestra un placeholder neutro (no una foto de comida falsa).

## 4. Cómo modificar colores

En `styles.css`, al inicio:

```css
:root {
  --primary: #2f6b4f;
  --secondary: #f0f5f2;
  --accent: #e07a3d;
  --background: #f7faf8;
  --text: #1a2e24;
}
```

Cambia esas variables para alinear la marca con el creador.

## 5. Cómo agregar categorías

1. Añade la clave en `CATEGORY_META` dentro de `recipes.js`.
2. Usa esa misma clave en `category` de la receta.
3. La UI solo muestra categorías que tengan al menos una receta.

## 6. Cómo publicar la web

Opciones simples:

- **GitHub Pages / Netlify / Vercel / Cloudflare Pages**: sube la carpeta tal cual (sitio estático).
- **Local**: `npx serve .` o cualquier servidor estático.
- No requiere build ni framework.

Recomendado: servir por HTTPS para Web Share API, service worker y localStorage estables.

## 7. Cómo reemplazar datos demo por datos reales

En `recipes.js` busca el marcador `DEMO DATA` o propiedades `isDemo: true`.

1. Elimina esos objetos del array `RECIPES`.
2. Importa recetas reales desde los reels/posts de Instagram.
3. La interfaz se actualiza sola (contadores, filtros, chips).

### Estado actual de datos (importante)

El acceso automatizado a Instagram es limitado. Tras revisar el perfil público de `@doctormussri` (≈20 publicaciones), se identificó **1 receta verificable** con ingredientes en caption:

- **Avena tostada con fruta** — [reel](https://www.instagram.com/doctormussri/reel/Db9ypELOZDv/)

Hay **3 recetas DEMO** claramente marcadas solo para demostrar búsqueda, filtros, favoritos y modo cocinar. Deben eliminarse al cargar el catálogo real.

## Funcionalidades

- Búsqueda en vivo (nombre, ingredientes, categorías, tags)
- Categorías y filtros (solo con datos verificables)
- Cards + detalle con checklist de ingredientes
- Modo cocinar (pasos grandes, una mano)
- Favoritos en `localStorage`
- Compartir (Web Share API / copiar enlace)
- Deep links `#recipe=slug`
- Contador dinámico de resultados
- Orden: recientes, antiguas, A–Z, más rápidas
- Sección comunidad + disclaimer de atribución
- Schema.org Recipe en recetas reales
- Base PWA (`manifest` + service worker mínimo)

## Atribución

Las recetas pertenecen a su creador original, Doctor Mussri (@doctormussri). Este recetario solo organiza contenido público para la comunidad.

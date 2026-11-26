# Portafolio Interactivo

> Portafolio con habitación 2D, avatar animado y proyectos interactivos.

## Características

-  **Pantalla de bienvenida** con nombre, rol y descripción
-  **Puerta animada** que se abre al hacer scroll
-  **Habitación cartoon** dibujada en Canvas 2D con perspectiva
-  **Avatar animado** que camina hacia los proyectos y los lanza
-  **Modal de proyecto** con galería, descripción y links
-  **Responsive** — funciona en PC y celular 
  

## Personalización

Edita el archivo **`js/data.js`** para:

1. **Cambiar tus datos personales** (`OWNER`)
2. **Agregar tus proyectos** (`PROJECTS`)

```js
const OWNER = {
  name:  "Tu Nombre",
  role:  "Tu rol",
  bio:   "Tu descripción corta",
};

const PROJECTS = [
  {
    name:        "🛒 Mi Proyecto",
    shortName:   "Proyecto",
    icon:        "🛒",
    description: "Descripción detallada...",
    tech:        ["React", "Node.js"],
    images:      ["https://url-de-tu-imagen.com/screenshot.png"],
    github:      "https://github.com/tuusuario/repo",
    demo:        "https://demo.com",
    live:        "",
    color:       "#ff6b6b",
    roomPos:     { x: 0.15, y: 0.55 },
    roomObject:  "shelf",
  },
  // ... más proyectos
];
```
### 2. Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. **Settings** → **Pages**
3. En **Source**, selecciona **GitHub Actions**
4. El deploy se hará automático en cada push a `main`

Tu portfolio estará en: `https://TUUSUARIO.github.io`

## 📂 Estructura del proyecto

```
portfolio/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── data.js       ← ✏️ EDITA ESTO
│   ├── room.js       — Renderiza la habitación
│   ├── avatar.js     — Anima el avatar
│   ├── scroll.js     — Transición scroll→puerta→habitación
│   ├── modal.js      — Modal de proyectos
│   └── main.js       — Orquestador
├── assets/           ← Pon aquí tus imágenes
└── .github/
    └── workflows/
        └── deploy.yml
```

## 🎨 Personalización avanzada

| Archivo | Qué puedes cambiar |
|---|---|
| `css/style.css` | Colores, fuentes, tamaños |
| `js/room.js` | Muebles, decoración de la habitación |
| `js/avatar.js` | Colores, forma del avatar |
| `js/data.js` | Todo tu contenido |

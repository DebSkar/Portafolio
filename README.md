# Portafolio Interactivo

> Portafolio con habitación 2D, avatar animado y proyectos interactivos.

> https://debskar.github.io/Portafolio/

## Características

-  **Pantalla de bienvenida** con nombre, rol y descripción
-  **Puerta animada** que se abre al hacer scroll
-  **Habitación cartoon** dibujada en Canvas 2D con perspectiva
-  **Avatar animado** que camina hacia los proyectos y los lanza
-  **Modal de proyecto** con galería, descripción y links
-  **Responsive** — funciona en PC y celular 
  
## Glosario del Semestre

*  HTML: Significa HyperText Markup Language, es un lenguaje que sirve para crear páginas web, le da la  estructura a los contenidos de estas. 

* CSS: Significa Cascading Style Sheets, CSS sirve para darle estilo a los contenidos, es el cómo se presentan visual y estéticamente en pantalla.

* JavaScript: Es un lenguaje de programación que se utiliza para la creación de las interacciones de las páginas web, además sirve para enviar y recibir información de servidores.

* MQTT:  Significa Message Queuing Telemetry Transport.Es un protocolo de mensajería que se utiliza para comunicar equipos entre sí.

* MediaPipe: Es una herramienta de código abierto que facilita la visión artificial en tiempo real.

* Three.js: Es una biblioteca de JavaScript que sirve para facilitar la visualización y creación de gráficos en 3D.

| Archivo | Qué puedes cambiar |
|---|---|
| `css/style.css` | Colores, fuentes, tamaños |
| `js/room.js` | Muebles, decoración de la habitación |
| `js/avatar.js` | Colores, forma del avatar |
| `js/data.js` | Todo tu contenido |


## Como funciona: Ejemplo Personalización

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
## Reflexión








# Portafolio Interactivo

> About: Portafolio con habitación 2D, avatar animado y proyectos interactivos.

> Portafolio: https://debskar.github.io/Portafolio/

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
## Créditos:
intente ocupar un componente de la lista, pero al final no resulto igual al de la página. Tenía este promt:
Help me add the "3d-card-demo" component from Aceternity UI to my project. Its source files and dependencies are at https://ui.aceternity.com/registry/3d-card-demo.json. First check that the project uses shadcn/ui, Tailwind CSS v4 and TypeScript.
> Enlace componente: https://ui.aceternity.com/components/3d-card-effect




## Reflexión

Esté semestre me ayudó a entender mejor como funcionan los dispositivos y herramientas digitales, y a perder un poco el miedo a estos, a veces me sentía demasiado vigilada por la tecnología, y comprender que estas no ven ni reconocen nada más allá de lo que se les dice, hace más sencillo convivir con ellas. Creo que como seres humanos tenemos la costumbre de humanizar y dotar de vida a objetos que no la tienen, y la IA y cualquier tecnología son ejemplo de ello, se nos olvida que son herramientas (quieras usarlas o no) que no piensan ni sienten por si solas.
El uso de la IA todavía me causa conflicto, sé el mal que producen y creo ir perdiendo neuronas cada vez que la uso, pero para efectos de esté curso me fue inevitable no hacerlo.

> Para la realización de esté portafolio y los trabajos del curso se ocupó Antigravity 






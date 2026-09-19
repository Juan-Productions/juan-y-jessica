# Invitación de boda — Jessica & Juan Daniel

Invitación web de una sola página, con cuenta regresiva, música de fondo y confirmación de asistencia (RSVP) contra una hoja de Google Sheets.

## Estructura

```
index.html                     página principal (autocontenida)
scripts/
  bump-version.js              actualiza la versión de caché (correr antes de cada commit)
  build-intro.js               compila intro-cover.jsx -> intro-cover.js
assets/
  intro-cover.jsx              portada animada (código fuente, el que se edita)
  intro-cover.js               la misma portada ya compilada (la que carga el sitio)
  vendor/                      React, ReactDOM y el runtime de la plantilla
  fonts/                       tipografías (Cormorant Garamond, Lora) en woff2
  photos/                      fotos del sitio + assets de la portada animada
  audio/musica.mp3             música de fondo (después de la portada)
  audio/Intro portada sonido.mp3   audio de la portada animada
```

## Ejecutar en local

Como el sitio carga sus assets con rutas relativas, ábrelo con un servidor local (no funciona bien con doble clic / `file://`):

```bash
npx serve .
```

o

```bash
python -m http.server 5173
```

y entra a `http://localhost:5173`.

## Editar contenido

- **Lista de invitados y hoja de confirmación**: la lista vive en la hoja de Google (pestaña con las columnas `FAMILIA`, `TITULAR`, `CUPOS`), no en este repo. `SHEET_ENDPOINT` (en el bloque `<script type="text/x-dc">` al final de `index.html`) es la URL del Web App de Google Apps Script: con `POST` recibe las confirmaciones y con `GET ?q=texto` devuelve solo las familias que coinciden (mínimo 3 letras, máximo 8 resultados). Para agregar o quitar invitados, editá la hoja — no hace falta tocar el sitio. Las confirmaciones caen en la pestaña `Confirmaciones`; una familia con una fila ahí figura como "ya confirmada" (el sitio le avisa en vez de dejarla confirmar otra vez, y el script rechaza duplicados). Por eso los valores de `FAMILIA` tienen que ser únicos. Para que una familia pueda volver a confirmar, borrá su fila en `Confirmaciones`. Si cambiás el código del script, en "Implementar → Administrar implementaciones" editá la implementación existente y elegí "Nueva versión" para que la URL no cambie.
- **Fecha de la boda**: la constante `target` dentro de `renderVals()` en ese mismo script (`new Date(2026, 9, 24, 17, 0, 0)`, o sea 5:00 PM).
- **Fotos** (portada, versículo, galería): todas son `<img>` normales — funcionan en cualquier hosting, no hay que editarlas desde ningún editor especial. Instrucciones y nombres exactos de archivo en [assets/photos/README.md](assets/photos/README.md); básicamente: subís los archivos con esos nombres a `assets/photos/` y listo.
- **Foto de portada**: es estática a propósito — no tiene botón de reemplazo, ni se puede ampliar/hacer clic (a diferencia de las demás fotos, que sí abren en grande al tocarlas).
- **Textos y estilos**: son HTML/CSS planos dentro del mismo `index.html`.

## Galería con carrusel

La sección "Galería" recorre automáticamente las fotos de `GALLERY_PHOTOS`
(definidas cerca del final de `index.html`, junto a `SHEET_ENDPOINT`) cada
`GALLERY_INTERVAL_MS` (4.5s por defecto). Tocar/cliquear una foto la abre en
grande sobre un fondo difuminado (lightbox); se cierra con la X, tocando
afuera, o con Escape.

Las fotos llevan `draggable="false"`, no se pueden seleccionar y el clic
derecho está bloqueado sobre ellas — son trabas básicas contra la descarga
casual, **no protección real**: cualquiera puede sacar una captura de
pantalla o abrir las herramientas de desarrollador del navegador. No subas
fotos que no quieras que alguien pueda llegar a guardar de esa forma.

## Portada animada

Antes de la invitación en sí, el sitio muestra una portada animada
(`assets/intro-cover.jsx`, un componente React/JSX cargado vía
`<x-import>`): un sello de lacre sobre papel que, al tocarlo, se abre y da
paso a una ilustración animada (paisaje, mariposas, textos, nombres).

**Después de editar `intro-cover.jsx` hay que recompilarlo**: el sitio no
carga el `.jsx` sino `assets/intro-cover.js` (así el navegador no descarga
Babel, ~3 MB desde un CDN, en cada visita, y la portada no depende de
internet más que del propio sitio). En la carpeta del proyecto:

```bash
npm install --no-save @babel/core @babel/preset-react
node scripts/build-intro.js
node scripts/bump-version.js
```

Si por algún motivo la portada no llega a cargar, la página se desbloquea
sola a los 10 s (red de seguridad en `componentDidMount`) en vez de quedar
sin scroll.

- **Reloj propio**: el tiempo no avanza hasta el primer toque (los
  navegadores bloquean el audio sin un gesto del usuario), y queda limitado
  a saltos chicos por fotograma para que, si el celular bloquea la pestaña
  un momento, la animación se pause en vez de "saltar" al volver.
- **Sonido**: al tocar para empezar, suena `assets/audio/Intro portada
  sonido.mp3`. Al tocar **"Más información"** (aparece a partir del
  segundo 22, editable con `MORE_INFO_AT` en `intro-cover.jsx`), esa pista
  se detiene y arranca la música de fondo normal del sitio
  (`assets/audio/musica.mp3`) — llama a `window.__triggerOpenInvitation()`,
  que expone el componente principal de `index.html`.
- **Marcas de tiempo de las escenas** (`CUES` en `intro-cover.jsx`): Sello
  0s, Apertura 0.3s, Paisaje 8s, Historia 10s, Acompañas 15s, Destello 19s,
  Nombres 20.5s, Cierre 54.5s. Si nadie toca "Más información", el reloj
  se congela en el Cierre (no vuelve a empezar). Para retocar el diseño/tiempos con más comodidad (con panel de
  ajustes visual) se puede volver a abrir el proyecto original en Claude
  Design y exportar de nuevo — este archivo es una adaptación manual para
  que funcione standalone en el sitio publicado, sin ese editor.
- Imágenes: `assets/photos/seal_blank.jpg` (el sello, sin iniciales — el
  "J&J" se dibuja aparte en HTML/CSS, así que cambiar las iniciales es
  editar el texto en `intro-cover.jsx`, no la imagen) y
  `assets/photos/land.jpg` (la ilustración del paisaje).

## Itinerario

La sección "Itinerario del día" es un póster ilustrado (`assets/photos/
itinerario-art.jpg`, 1225×2399 px) que se dibuja a ese tamaño y se reduce
solo al ancho del contenedor (con `zoom`, ver el script al final de
`index.html`). Al hacer scroll, la ilustración se revela de arriba hacia
abajo y cada horario entra desde su lado; se desactiva solo con
`prefers-reduced-motion`.

Para cambiar los horarios o el texto de cada parada, editá los bloques
`data-stop` dentro de `<div id="itin">` en `index.html` — cada uno es un
`<p>` con la hora y otro con el nombre del momento. `data-side` controla
desde qué lado entra al hacer scroll (`1` derecha, `-1` izquierda, `0`
centro). Los textos están posicionados con `top`/`left`/`right` en
píxeles del póster (1225 px de ancho) para que caigan en los espacios
libres entre los dibujos; **si agrandás la letra o cambiás un texto por
otro más largo, revisá que no se crucen con las líneas del dibujo** (el
cable que une las ilustraciones pasa justo debajo de varias paradas). La cuenta regresiva de la portada usa el mismo horario de la
ceremonia (`target` dentro de `renderVals()`); si cambia la hora de la
ceremonia, actualizá los dos lugares.

## Efecto de scroll (reveal on scroll)

Las secciones principales (introducción, fecha/mapa, cuenta regresiva, itinerario, código de vestimenta, foto, RSVP y pie) tienen la clase `reveal`. Un `IntersectionObserver` (al final de `index.html`) les agrega la clase `is-visible` cuando entran en pantalla, disparando una transición de opacidad + desplazamiento definida en el bloque `<style>` del `<head>`.

Para ajustar la animación, modifica en `index.html`:

```css
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.9s cubic-bezier(.22,.61,.36,1), transform 0.9s cubic-bezier(.22,.61,.36,1);
}
```

Respeta `prefers-reduced-motion` automáticamente.

## Publicar

Cualquier hosting estático sirve (GitHub Pages, Netlify, Vercel, Cloudflare Pages). Por ejemplo, con GitHub Pages:

1. Sube este repositorio a GitHub.
2. En **Settings → Pages**, elige la rama `main` y carpeta raíz (`/`).
3. GitHub publicará el sitio en `https://<usuario>.github.io/<repo>/`.

Este sitio usa dominio propio (archivo `CNAME`): **`https://www.boda-juan-y-jessica.date/`**.
Ese es el link que hay que compartir; también está escrito en las etiquetas
`og:url` / `og:image` / `canonical` del `<head>` de `index.html` — si cambia el
dominio, actualizá esas tres.

### Al compartir por WhatsApp

El `<head>` trae las etiquetas Open Graph (título, descripción y la imagen
`assets/photos/og-image.jpg`, 1200×630) para que el link se vea con foto en la
vista previa. WhatsApp guarda esa vista previa en caché: si después cambiás
la imagen o el texto y el link ya se había compartido, puede seguir mostrando
la anterior; para forzarlo, pegá el link con un parámetro nuevo
(`...date/?v=2`) o probalo en https://developers.facebook.com/tools/debug/.

### Antes de cada despliegue: actualizar la versión de caché

`index.html` incluye, al inicio del `<head>`, un chequeo que compara su propia
versión contra `version.json` (pedido siempre sin caché); si detecta que hay
una versión más nueva en el servidor, recarga la página una sola vez sin
caché. Esto evita que alguien vea una versión vieja de la invitación después
de que publiques cambios.

Para que funcione, hay que avisarle al chequeo que hubo un despliegue nuevo.
Después de editar `index.html` y antes de hacer commit, corré:

```bash
node scripts/bump-version.js
```

Esto actualiza `version.json` y todas las referencias de versión dentro de
`index.html` (el chequeo del `<head>` y los `?v=` de los assets) en un solo
paso.

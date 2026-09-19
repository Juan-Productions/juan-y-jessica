# Fotos

Poné acá las fotos con estos nombres exactos:

```
hero.jpg
galeria-1.jpg
galeria-2.jpg
galeria-3.jpg
galeria-4.jpg
galeria-5.jpg
galeria-6.jpg
galeria-7.jpg
galeria-8.jpg
versiculo.jpg
og-image.jpg
```

`hero.jpg` es la foto de portada (donde dice "Nos casamos", arriba de todo).
Es estática a propósito: no tiene botón de reemplazo ni se puede ampliar
tocándola, a diferencia de las demás fotos de la página.

`versiculo.jpg` es la foto grande de la sección con el texto de Rut 1:16b
(entre la cuenta regresiva y el itinerario) — usá una foto vertical/horizontal
con buen contraste en la parte de abajo, porque ahí se le pone un degradado
oscuro para que el texto se lea bien.

`og-image.jpg` (1200×630, horizontal) es la imagen que aparece en la vista
previa cuando se comparte el link por WhatsApp/Facebook. Es un recorte de
`versiculo.jpg` donde se ven los dos rostros; si la cambiás, mantené ese
tamaño y que pese menos de ~300 KB.

Para agregar más fotos (o sacar alguna), editá el arreglo `GALLERY_PHOTOS`
dentro de `index.html` (buscá `var GALLERY_PHOTOS = [` cerca del final del
archivo) y agregá/quitá una línea con el nombre de archivo correspondiente
— el carrusel y los puntos de navegación se ajustan solos a la cantidad de
fotos que haya en la lista.

## Tamaño y peso (importante para que cargue rápido)

Las fotos actuales ya están optimizadas: **1200×1800 px, JPG calidad ~82,
~200–400 KB cada una** (`hero.jpg` y `versiculo.jpg` a 1600 px de ancho). Las
originales de la cámara (2399×3600, 1–1.7 MB) quedaron en el historial de
git (commit `c6e07dd`) por si hicieran falta.

Si agregás fotos nuevas, no las subas tal cual salen del celular: la
invitación se abre desde el teléfono de los invitados, muchas veces con datos
móviles. Reducilas a ~1200 px de ancho y ~300 KB (https://squoosh.app, o
cualquier editor) antes de subirlas. Formato `.jpg`; `.webp` también sirve
pero en iPhones muy viejos (iOS 13 o anterior) no se vería.

## Ilustraciones fijas

No son fotos que reemplaces por las tuyas:

- `seal_blank.jpg` es la foto del sello de lacre sobre papel (sin iniciales —
  el "J&J" se dibuja en HTML/CSS encima); `land.jpg` es la ilustración del
  paisaje que aparece al abrir el sello. Ver la sección "Portada animada" en
  el README principal.
- `itinerario-art.jpg` es el póster ilustrado de la sección "Itinerario del
  día" (flores y anillos, copas, mesa servida, pareja bailando, música,
  tornamesa, luna y cama). Los horarios y el texto de cada parada están en
  `index.html`, no en la imagen — ver la sección "Itinerario" en el README
  principal.
- `vestimenta-art.png` es el dibujo de línea (pareja bailando e invitados
  brindando bajo un arco de flores) debajo de "Código de vestimenta:
  Formal". Es PNG con fondo transparente a propósito (recomprimirlo le quita
  definición a las líneas finas).

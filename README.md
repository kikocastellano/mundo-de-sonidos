# Mundo de Sonidos 🦁🔊

App educativa para niños de 2 a 8 años: explora un mapa del mundo animado, descubre animales y escucha sus sonidos.
Sin anuncios, sin cuentas, sin rastreo. Funciona en cualquier móvil, tablet y ordenador (web/PWA, sin conexión)
y se puede empaquetar con Capacitor igual que *Salto al Charco*.

> El plan pedía Flutter, pero no está instalado en este entorno y el repositorio ya usa Vite + Capacitor.
> Se ha hecho con la misma pila (TypeScript + Vite), que da una sola base de código para Android, iOS y web.

```bash
cd animales
npm install
npm run dev        # http://localhost:5174 (también desde el móvil en la misma red)
npm run build
npm run test:e2e   # recorre todas las pantallas en iPhone, Android, horizontal, iPad y escritorio
```

## Estado del roadmap
- **Fase 1 ✅** estructura, colores y botones grandes para niños, navegación, español/inglés, ficha de datos (30 animales, 8 regiones).
- **Fase 2 ✅** mapa del mundo táctil (continentes, granja, océano), región con tarjetas, ficha con imagen grande, sonido, nombre hablado, dato curioso, deslizar/flechas, favoritos guardados, candado en animales de pago.
- **Fase 3 ✅** «¿Quién suena?»: 3 opciones (4 tras 5 aciertos seguidos), confeti al acertar, reintentar sin castigo, estrellas por región, sin vidas ni límites.
- **Fase 5 (parcial)**: puerta para padres (mantener pulsado el número escrito en palabras) y pantalla informativa de suscripción con botón de cerrar. Falta conectar RevenueCat/Google Play.
- **Fase 4 (herramientas listas)**: los sonidos actuales siguen siendo **sintetizados de prueba**. Flujo para los reales:
  1. `npm run sounds:fetch` busca en Wikimedia Commons, Xeno-canto (`XC_KEY`) y Freesound (`FREESOUND_TOKEN`) solo licencias comerciales (CC0, dominio público, CC BY, CC BY-SA) y descarga candidatos a `sounds-raw/<animal>/`.
  2. Escuchas y apuntas el elegido en `sounds-approved.json`: `{ "vaca": { "file": "02-commons.ogg", "start": 0.4 } }`.
  3. `npm run sounds:process` recorta, nivela a -16 LUFS, guarda `public/sounds/<animal>.mp3`, registra autor/licencia en `src/sounds.json` y pasa `tests/licenses.mjs`, que falla si algún sonido no tiene licencia válida.
  El nombre hablado usa la voz del dispositivo (sin archivos).
- **Fase 6 (parcial)**: modo calma (lluvia, olas, noche, viento con temporizador y paisaje nocturno) y modo profe (favoritos seguidos, pantalla completa). Son premium; en la zona de padres hay un interruptor «Probar premium (solo pruebas)» hasta conectar el cobro.
- **Fase 7 (parcial)**: pantalla de créditos, `public/privacidad.html` (ES/EN) y borrador de ficha en `docs/FICHA_TIENDA.md`.

## Estructura
- `src/data.ts` animales y regiones · `src/audio.ts` sonidos, voz y efectos · `src/scenery.ts` paisaje animado por región
- `src/screens/` inicio, mapa, región, ficha, juego, favoritos, padres · `src/store.ts` datos locales del dispositivo

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
- **Fase 4 pendiente**: los sonidos actuales son **sintetizados de prueba** (`src/audio.ts`). Para cada animal basta con añadir `audio: 'sounds/vaca.mp3'` y `credit` en `src/data.ts`; la grabación real tiene prioridad automáticamente.

## Estructura
- `src/data.ts` animales y regiones · `src/audio.ts` sonidos, voz y efectos · `src/scenery.ts` paisaje animado por región
- `src/screens/` inicio, mapa, región, ficha, juego, favoritos, padres · `src/store.ts` datos locales del dispositivo

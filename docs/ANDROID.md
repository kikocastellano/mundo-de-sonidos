# Android: probar en el móvil y publicar en Google Play

## 1. Probar en tu móvil (sin instalar nada)
1. GitHub → repositorio **mundo-de-sonidos** → pestaña **Actions** → flujo **Android**.
2. Abre la última ejecución en verde y descarga **mundo-de-sonidos-prueba-apk** (abajo, en *Artifacts*).
3. Descomprime el ZIP, pasa `app-debug.apk` al móvil y ábrelo (acepta instalar desde origen desconocido solo para este archivo).
   En esta versión de prueba **no funciona la compra** (Google Play solo la permite en apps instaladas desde la tienda).

## 2. Crear tu clave de firma (una sola vez, en tu ordenador)
Necesitas **Android Studio** o, si ya tienes Java, solo una terminal:
```bash
keytool -genkeypair -v -keystore mundo-de-sonidos.jks -alias mundo -keyalg RSA -keysize 2048 -validity 10000
```
- Guarda `mundo-de-sonidos.jks` FUERA del proyecto y haz copia (USB, nube privada).
- Apunta la contraseña y el alias (`mundo`). **Si la pierdes, no podrás actualizar la app.**
- Es la misma idea que hiciste con Salto al Charco; puedes reutilizar la de la rana si quieres, pero es mejor una por app.

## 3. Que GitHub firme el paquete de Google Play automáticamente
En GitHub → **Settings → Secrets and variables → Actions → New repository secret**, crea 4 secretos:
| Nombre | Valor |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | el archivo .jks en base64 (Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("mundo-de-sonidos.jks"))`; Mac/Linux: `base64 -i mundo-de-sonidos.jks`) |
| `ANDROID_KEYSTORE_PASSWORD` | la contraseña del almacén |
| `ANDROID_KEY_ALIAS` | `mundo` |
| `ANDROID_KEY_PASSWORD` | la contraseña de la clave (suele ser la misma) |

A partir de ahí, cada cambio en `main` genera también **mundo-de-sonidos-google-play-aab**: ese `.aab` es el que se sube a Play Console.
El número de versión sube solo en cada compilación.

## 4. Play Console
1. **Crear app** → «Mundo de Sonidos», español, **App**, **Gratis**.
2. **Prueba interna** → crear versión → subir el `.aab`.
3. **Monetizar → Productos integrados** → `desbloquear_todo`, 3,99 € (ver `docs/PAGO_UNICO.md`).
4. **Contenido de la app** (ver `docs/PROFESORES.md`): público 2–8 años, sin anuncios, sin datos.
   Política de privacidad: `https://kikocastellano.github.io/mundo-de-sonidos/privacidad.html`
5. **Ficha**: textos en `docs/FICHA_TIENDA.md`, imágenes en `docs/tienda/`.
6. **Prueba cerrada**: 12 testers durante 14 días antes de poder publicar.

## Alternativa: Android Studio
`npm install` y `npm run android` → **Build → Generate Signed App Bundle** con tu `.jks`.

# Pago único «Desbloquear todo»

La app es **gratis** y tiene **un único producto integrado** que desbloquea todo para siempre. Sin suscripción, sin RevenueCat.

## Lo que haces tú en Play Console
1. Crea la app (nombre «Mundo de Sonidos», gratuita, ID de paquete `com.kikocastellano.mundodesonidos`).
2. Sube una primera versión a **Prueba interna** (hace falta para poder crear productos): `npm run android` → en Android Studio *Build › Generate Signed App Bundle*.
3. **Monetizar › Productos › Productos integrados › Crear producto**
   - ID del producto: `desbloquear_todo` (exactamente así)
   - Nombre: «Desbloquear todo» · Descripción: «Todos los animales, modo calma y modo profe. Pago único.»
   - Precio: 3,99 € (Play calcula el resto de países) → **Activar**.
4. **Configuración › Pruebas de licencias**: añade tu cuenta de Gmail para hacer compras de prueba sin pagar.
5. Instala la app desde el enlace de prueba interna y compra: verás «¡Todo desbloqueado!».

## Cómo funciona en la app
- Botón de compra solo en la **zona de padres** (puerta con número escrito en palabras).
- Muestra el precio real que devuelve Google Play, el texto «Pago único · sin suscripción» y **Restaurar compra**.
- La compra se guarda en el dispositivo, así que funciona sin conexión; al reinstalar se recupera con «Restaurar compra» o automáticamente al abrir.
- En la web (navegador) no se puede comprar; sigue el interruptor «Probar premium (solo pruebas)».

## Antes de publicar
- Quitar el interruptor de pruebas no hace falta: en la app nativa no aparece.
- Revisar que el permiso `AD_ID` sigue eliminado (`android/app/src/main/AndroidManifest.xml`).

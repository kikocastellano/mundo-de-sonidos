import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kikocastellano.mundodesonidos',
  appName: 'Mundo de Sonidos',
  webDir: 'dist',
  android: { backgroundColor: '#d9f1ff' },
  // Android 15+: la app va de borde a borde; Capacitor pasa los márgenes de las barras del sistema como variables CSS
  plugins: { SystemBars: { insetsHandling: 'css', initialViewportFitValueHint: 'cover' } },
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dmestrong.app',
  appName: 'DME Strong',
  webDir: 'dist/dme-strong-frontend/browser',
  // Mismo color que --dme-bg: evita flashes blancos en overscroll y arranque del WebView.
  backgroundColor: '#0B0F0E'
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'site.daska.app',
  appName: 'Daska',
  webDir: 'www',
  server: {
    url: 'https://daska.site',
    cleartext: false,
    allowNavigation: [
      'daska.site',
      'www.daska.site',
      '*.supabase.co',
      'accounts.google.com',
    ],
  },
  android: {
    appendUserAgent: 'DaskaApp',
  },
  plugins: {
    SystemBars: {
      style: 'LIGHT',
      insetsHandling: 'disable',
    },
  },
};

export default config;
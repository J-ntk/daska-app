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
  plugins: {
    SystemBars: {
      // Light (white) icons, appropriate for Daska's dark background.
      style: 'LIGHT',
    },
  },
};

export default config;
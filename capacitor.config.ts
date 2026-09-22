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
    // Known Capacitor bug on Android (still open, see
    // ionic-team/capacitor#7269, #7454, #8429): window.Capacitor stays
    // undefined on a remote page loaded via server.url, so no plugin
    // (including push notifications) can be detected or used. Setting
    // any non-empty appendUserAgent is a confirmed community workaround
    // that gets the bridge injected correctly.
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
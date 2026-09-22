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
      style: 'LIGHT',
      // This is likely the real missing piece: Capacitor's SystemBars
      // plugin auto-pads the WebView away from the system bars by
      // default, which is why no native theme color could ever make
      // things blend — the WebView itself never actually reached the
      // edge. Disabling this lets the page's own background draw all
      // the way under the (now transparent) bars, same as a native
      // Expo/RN app would.
      insetsHandling: 'disable',
    },
  },
};

export default config;
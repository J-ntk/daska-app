import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'site.daska.app',
  appName: 'Daska',
  webDir: 'www',
  server: {
    url: 'https://daska.site',
    cleartext: false,
    // Hosts Capacitor treats as "part of the app" and loads inside its own
    // WebView. Anything not listed here gets handed to the system browser
    // instead — which is what was happening to daska.site itself if any
    // redirect (even internal) resolved to a host not on this list.
    allowNavigation: [
      'daska.site',
      'www.daska.site',
      '*.supabase.co',       // Supabase auth/session endpoints
      'accounts.google.com', // Google sign-in
    ],
  },
};

export default config;
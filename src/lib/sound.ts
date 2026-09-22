let tapAudio: HTMLAudioElement | null = null;

// Whether we're running inside the native app. window.Capacitor is
// unreliable here — a confirmed, still-unresolved Capacitor bug means it
// stays undefined on this app (it loads a remote URL rather than bundled
// local files, see capacitor.config.ts's server.url). Playing a sound
// doesn't need Capacitor's bridge at all though, just the standard
// HTML5 Audio API — so detect the app via the custom user-agent string
// set in capacitor.config.ts (android.appendUserAgent: 'DaskaApp')
// instead, which isn't affected by that bug.
function isNativeApp(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent.includes("DaskaApp");
}

// Plays a short tap sound — only inside the native app, never on
// daska.site in a regular browser, where an unexpected click sound would
// likely feel out of place on a desktop productivity site. Reuses one
// Audio element and rewinds it rather than creating a new one per tap.
export function playTap() {
  if (typeof window === "undefined") return;
  if (!isNativeApp()) return;

  try {
    if (!tapAudio) {
      tapAudio = new Audio("/sounds/tap.mp3");
      tapAudio.volume = 0.5;
    }
    tapAudio.currentTime = 0;
    tapAudio.play().catch(() => {
      // Autoplay/gesture restrictions occasionally block this — skipping
      // the sound is harmless, so there's nothing to handle here.
    });
  } catch {
    // no-op
  }
}
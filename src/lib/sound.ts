let tapAudio: HTMLAudioElement | null = null;

// Plays a short tap sound — only inside the native app, never on
// daska.site in a regular browser, where an unexpected click sound would
// likely feel out of place on a desktop productivity site. Reuses one
// Audio element and rewinds it rather than creating a new one per tap.
export function playTap() {
  if (typeof window === "undefined") return;
  if (!(window as any).Capacitor?.isNativePlatform?.()) return;

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
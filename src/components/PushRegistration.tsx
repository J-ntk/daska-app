"use client";

import { useEffect } from "react";
import { registerPushToken } from "@/lib/actions/push";

// Registers this device for push notifications. Renders nothing — mount
// it once near the root of the logged-in app (e.g. inside AppShell).
// It's a no-op outside the native Android app: window.Capacitor only
// exists there, so this silently does nothing in a normal browser tab.
export default function PushRegistration() {
  useEffect(() => {
    const capacitor = (window as any).Capacitor;
    if (!capacitor?.isNativePlatform?.()) {
      console.log("[push] not running in the native app — skipping registration");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");

        const perm = await PushNotifications.checkPermissions();
        console.log("[push] current permission state:", perm.receive);

        let granted = perm.receive === "granted";
        if (!granted && perm.receive !== "denied") {
          const req = await PushNotifications.requestPermissions();
          console.log("[push] permission request result:", req.receive);
          granted = req.receive === "granted";
        }

        if (!granted) {
          console.log("[push] permission not granted — stopping");
          return;
        }
        if (cancelled) return;

        await PushNotifications.register();
        console.log("[push] register() called, waiting for token…");

        PushNotifications.addListener("registration", async (token) => {
          console.log("[push] got device token, saving it");
          const result = await registerPushToken(token.value, "android");
          console.log("[push] registerPushToken result:", result);
        });

        PushNotifications.addListener("registrationError", (err) => {
          console.error("[push] registration error", err);
        });
      } catch (err) {
        console.error("[push] setup threw an error", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
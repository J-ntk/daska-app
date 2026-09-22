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
    if (!capacitor?.isNativePlatform?.()) return;

    let cancelled = false;

    (async () => {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      const perm = await PushNotifications.checkPermissions();
      let granted = perm.receive === "granted";
      if (!granted && perm.receive !== "denied") {
        const req = await PushNotifications.requestPermissions();
        granted = req.receive === "granted";
      }
      if (!granted || cancelled) return;

      await PushNotifications.register();

      PushNotifications.addListener("registration", (token) => {
        registerPushToken(token.value, "android");
      });

      PushNotifications.addListener("registrationError", (err) => {
        console.error("Push registration error", err);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
"use client";

import { useEffect, useState } from "react";
import { registerPushToken } from "@/lib/actions/push";

// Registers this device for push notifications. Mount once near the root
// of the logged-in app. It's a no-op outside the native Android app.
//
// TEMPORARY: also renders a small on-screen debug panel showing what
// happened, so this can be checked by just looking at the phone instead
// of needing a working chrome://inspect connection. Remove the visible
// <pre> block (search "DEBUG PANEL" below) once push notifications are
// confirmed working end to end.
export default function PushRegistration() {
  const [log, setLog] = useState<string[]>([]);
  const addLog = (line: string) => setLog((prev) => [...prev, line]);

  useEffect(() => {
    const capacitor = (window as any).Capacitor;
    if (!capacitor?.isNativePlatform?.()) {
      addLog("not running in the native app — skipping");
      return;
    }
    addLog("running natively, starting setup…");

    let cancelled = false;

    (async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        addLog("plugin module loaded");

        const perm = await PushNotifications.checkPermissions();
        addLog(`permission state: ${perm.receive}`);

        let granted = perm.receive === "granted";
        if (!granted && perm.receive !== "denied") {
          addLog("requesting permission…");
          const req = await PushNotifications.requestPermissions();
          addLog(`permission request result: ${req.receive}`);
          granted = req.receive === "granted";
        }

        if (!granted) {
          addLog("permission not granted — stopping");
          return;
        }
        if (cancelled) return;

        await PushNotifications.register();
        addLog("register() called, waiting for token…");

        PushNotifications.addListener("registration", async (token) => {
          addLog(`got token (${token.value.slice(0, 12)}…), saving`);
          const result = await registerPushToken(token.value, "android");
          addLog(`save result: ${JSON.stringify(result)}`);
        });

        PushNotifications.addListener("registrationError", (err) => {
          addLog(`registration error: ${JSON.stringify(err)}`);
        });
      } catch (err: any) {
        addLog(`threw: ${err?.message ?? String(err)}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    // ---- DEBUG PANEL: delete this block once push is confirmed working ----
    <pre
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        maxHeight: "40vh",
        overflowY: "auto",
        margin: 0,
        padding: "8px",
        fontSize: "10px",
        lineHeight: 1.4,
        background: "rgba(0,0,0,0.85)",
        color: "#6f6",
        whiteSpace: "pre-wrap",
      }}
    >
      {"[push debug]\n" + (log.length ? log.join("\n") : "(no log lines yet)")}
    </pre>
    // ---- end debug panel ----
  );
}
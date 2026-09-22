"use client";

import { useEffect, useState } from "react";
import { registerPushToken, unregisterPushToken } from "@/lib/actions/push";

type Status =
  | "checking"
  | "unsupported" // not running in the native Android app
  | "off"
  | "denied" // OS-level denial; can't be re-prompted from JS
  | "on"
  | "working";

export default function PushNotificationSettings() {
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // On mount: figure out where things currently stand, without
  // prompting for anything yet.
  useEffect(() => {
    const capacitor = (window as any).Capacitor;
    if (!capacitor?.isNativePlatform?.()) {
      setStatus("unsupported");
      return;
    }

    (async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        const perm = await PushNotifications.checkPermissions();
        setStatus(perm.receive === "granted" ? "on" : perm.receive === "denied" ? "denied" : "off");
      } catch {
        setStatus("off");
      }
    })();
  }, []);

  async function handleEnable() {
    setError(null);
    setStatus("working");
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      const req = await PushNotifications.requestPermissions();

      if (req.receive !== "granted") {
        setStatus(req.receive === "denied" ? "denied" : "off");
        return;
      }

      await PushNotifications.register();

      const gotToken = await new Promise<string>((resolve, reject) => {
        const to = setTimeout(() => reject(new Error("Timed out waiting for a device token")), 15000);
        PushNotifications.addListener("registration", (t) => {
          clearTimeout(to);
          resolve(t.value);
        });
        PushNotifications.addListener("registrationError", (err) => {
          clearTimeout(to);
          reject(new Error(JSON.stringify(err)));
        });
      });

      const result = await registerPushToken(gotToken, "android");
      if (!result.ok) throw new Error("Couldn't save this device — try again");

      setToken(gotToken);
      setStatus("on");
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setStatus("off");
    }
  }

  async function handleDisable() {
    setError(null);
    setStatus("working");
    try {
      if (token) {
        await unregisterPushToken(token);
      }
      setStatus("off");
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setStatus("on");
    }
  }

  return (
    <div className="flex justify-between items-center">
      <div>
        <div className="text-sm font-medium">Push notifications</div>
        <div className="text-xs text-ink/50">
          {status === "checking" && "Checking…"}
          {status === "unsupported" && "Available in the Daska Android app."}
          {status === "off" && "Get notified on your phone about invites, tasks and more."}
          {status === "working" && "Working…"}
          {status === "on" && "Enabled — you'll get notified about invites, tasks and more."}
          {status === "denied" &&
            "Blocked in your phone's system settings. Enable notifications for Daska there, then reopen the app."}
        </div>
        {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
      </div>

      {status === "off" && (
        <button
          onClick={handleEnable}
          className="text-xs bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] px-3 py-1.5 font-medium shrink-0"
        >
          Enable
        </button>
      )}
      {status === "on" && (
        <button
          onClick={handleDisable}
          className="text-xs border border-line rounded-lg px-3 py-1.5 shrink-0"
        >
          Disable
        </button>
      )}
      {status === "working" && (
        <button
          disabled
          className="text-xs border border-line rounded-lg px-3 py-1.5 shrink-0 opacity-50"
        >
          Working…
        </button>
      )}
    </div>
  );
}
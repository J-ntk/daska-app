"use client";

import { useState } from "react";

export default function CopyReferralLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function invite() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: "Join me on Daska",
          text: "Plan your days, weeks, and projects with me on Daska — sign up with my link and we both get 20% off:",
          url: link,
        });
      } catch {
        // user canceled the share sheet — no-op
      }
    } else {
      // No Web Share API support (most desktop browsers) — fall back to copy
      copy();
    }
  }

  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={link}
        onFocus={(e) => e.target.select()}
        className="flex-1 min-w-0 border border-line rounded-lg px-3 py-2 text-xs bg-bg text-ink/70"
      />
      <button
        onClick={copy}
        className="text-xs border border-line rounded-lg px-3 py-2 hover:border-accent transition-colors shrink-0"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <button
        onClick={invite}
        className="text-xs bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] px-3 py-2 shrink-0"
      >
        Invite
      </button>
    </div>
  );
}
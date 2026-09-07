"use client";

import { useState } from "react";

export default function CopyReferralLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    </div>
  );
}
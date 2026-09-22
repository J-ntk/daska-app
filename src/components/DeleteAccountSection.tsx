"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteAccount } from "@/lib/actions/account";

export default function DeleteAccountSection() {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // The account (and its auth session) no longer exists server-side —
      // sign out locally to clear the client's own cookies/state, then
      // leave.
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm font-medium text-red-400">Delete account</div>
          <div className="text-xs text-ink/50">
            Permanently deletes your account. This can&apos;t be undone.
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-xs border border-red-500/40 text-red-400 rounded-lg corner-fix px-3 py-1.5 hover:bg-red-500/10 transition-colors shrink-0"
        >
          Delete
        </button>
      </div>

      {open && (
        <div
          onClick={() => !isPending && setOpen(false)}
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-surface border border-line rounded-lg corner-fix p-5"
          >
            <h3 className="text-sm font-semibold text-red-400 mb-1">Delete your account?</h3>
            <p className="text-xs text-ink/60 mb-4">
              This permanently deletes your account, your personal tasks, and everything tied to
              it. Projects you own must be deleted or transferred first. This can&apos;t be
              undone.
            </p>

            <label className="block text-xs font-medium mb-1">
              Type <span className="font-semibold">DELETE</span> to confirm
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isPending}
              className="w-full border border-line rounded-lg corner-fix px-3 py-2 text-sm mb-3 disabled:opacity-50"
              placeholder="DELETE"
            />

            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 border border-line rounded-lg corner-fix py-2 text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending || confirmText !== "DELETE"}
                className="flex-1 bg-red-500/90 hover:bg-red-500 text-white rounded-lg corner-fix py-2 text-sm font-medium disabled:opacity-40 transition-colors"
              >
                {isPending ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
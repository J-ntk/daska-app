"use client";

import { useState, useTransition } from "react";
import { inviteMember, removeMember } from "@/lib/actions/projects";
import type { ProjectMember, Role } from "@/lib/types";

export default function InviteModal({
  projectId,
  members,
}: {
  projectId: string;
  members: ProjectMember[];
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [isPending, startTransition] = useTransition();

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await inviteMember({ projectId, email, role });
      setEmail("");
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] px-4 py-2 text-sm font-medium"
      >
        + Invite
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-surface border border-line rounded-lg p-5">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold">Invite members</h3>
              <button onClick={() => setOpen(false)} className="text-ink/40 text-sm">
                ✕
              </button>
            </div>
            <p className="text-xs text-ink/50 mb-4">Add someone to this project</p>

            <form onSubmit={handleInvite} className="mb-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-2"
              />
              <div className="flex gap-1.5 mb-3">
                {(["viewer", "editor", "admin"] as Role[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`text-xs px-2.5 py-1 rounded-lg border capitalize ${
                      role === r
                        ? "border-ink font-semibold"
                        : "border-line text-ink/50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] py-2 text-sm font-medium disabled:opacity-50"
              >
                {isPending ? "Sending…" : "Send invite"}
              </button>
            </form>

            <div className="text-xs font-medium uppercase text-ink/40 mb-2">
              Members
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1.5">
              {members.map((m) => (
                <div key={m.id} className="flex justify-between items-center text-xs">
                  <span>
                    {m.profile?.email ?? m.invited_email} — {m.role}
                    {m.status === "pending" && (
                      <span className="text-ink/40"> (pending)</span>
                    )}
                  </span>
                  {m.role !== "owner" && (
                    <button
                      onClick={() =>
                        startTransition(() => removeMember(projectId, m.id))
                      }
                      className="text-ink/40 hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
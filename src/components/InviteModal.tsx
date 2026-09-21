"use client";

import { useState, useTransition } from "react";
import { inviteMember, removeMember } from "@/lib/actions/projects";
import { lookupInvitee } from "@/lib/actions/invites";
import type { LookupResult, ProjectMember, Role } from "@/lib/types";

type Feedback = { tone: "ok" | "error"; text: string } | null;

const ROLES: Role[] = ["viewer", "editor", "admin"];

const INVITE_ERRORS: Record<string, string> = {
  not_authenticated: "You need to be signed in to invite people.",
  invalid_email: "Enter a valid email address.",
  already_member: "This person is already a member of this project.",
  already_invited: "This person already has a pending invite.",
  failed: "Couldn't send the invite. Try again.",
};

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-accent/20 text-accentLight flex items-center justify-center text-sm font-semibold shrink-0">
      {(name.trim()[0] ?? "?").toUpperCase()}
    </div>
  );
}

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
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isSearching, startSearch] = useTransition();
  const [isInviting, startInvite] = useTransition();
  const [, startTransition] = useTransition();

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setLookup(null);
    startSearch(async () => {
      const result = await lookupInvitee(projectId, email);
      setLookup(result);
    });
  }

  function handleSend() {
    setFeedback(null);
    startInvite(async () => {
      const res = await inviteMember({ projectId, email, role });
      if (res.ok) {
        setFeedback({
          tone: "ok",
          text:
            res.kind === "existing"
              ? "Invite sent. They'll see it in their notifications."
              : res.emailSent === false
              ? "Invite saved, but the email couldn't be sent. Ask them to sign up with this address."
              : "Invite email sent.",
        });
        setEmail("");
        setLookup(null);
      } else {
        setFeedback({
          tone: "error",
          text: INVITE_ERRORS[res.error] ?? INVITE_ERRORS.failed,
        });
      }
    });
  }

  const canInvite =
    lookup?.status === "found" ||
    lookup?.status === "not_found" ||
    lookup?.status === "not_allowed" ||
    lookup?.status === "error";

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
            <p className="text-xs text-ink/50 mb-4">
              Enter an email to find their Daska account
            </p>

            <form onSubmit={handleLookup} className="flex gap-2 mb-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLookup(null);
                  setFeedback(null);
                }}
                placeholder="name@company.com"
                className="flex-1 min-w-0 border border-line rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={isSearching || !email}
                className="border border-line rounded-lg px-3 py-2 text-sm hover:border-accent transition-colors disabled:opacity-50"
              >
                {isSearching ? "Searching…" : "Find"}
              </button>
            </form>

            {feedback && (
              <p
                className={`text-xs mb-3 ${
                  feedback.tone === "ok" ? "text-accentLight" : "text-red-400"
                }`}
              >
                {feedback.text}
              </p>
            )}

            {lookup?.status === "already_member" && (
              <p className="text-xs text-ink/60 mb-3">
                This person is already a member of this project.
              </p>
            )}
            {lookup?.status === "already_invited" && (
              <p className="text-xs text-ink/60 mb-3">
                This person already has a pending invite.
              </p>
            )}
            {lookup?.status === "invalid_email" && (
              <p className="text-xs text-red-400 mb-3">Enter a valid email address.</p>
            )}

            {canInvite && (
              <div className="border border-line rounded-lg p-3 mb-4">
                {lookup?.status === "found" ? (
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar
                      name={lookup.profile.full_name ?? lookup.profile.email}
                      url={lookup.profile.avatar_url}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {lookup.profile.full_name ?? lookup.profile.email}
                      </div>
                      {lookup.profile.full_name && (
                        <div className="text-xs text-ink/50 truncate">
                          {lookup.profile.email}
                        </div>
                      )}
                    </div>
                  </div>
                ) : lookup?.status === "not_found" ? (
                  <p className="text-xs text-ink/60 mb-3">
                    {"No Daska account uses this email. We'll send them an invite email."}
                  </p>
                ) : null}

                <div className="flex gap-1.5 mb-3">
                  {ROLES.map((r) => (
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
                  type="button"
                  onClick={handleSend}
                  disabled={isInviting}
                  className="w-full bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] py-2 text-sm font-medium disabled:opacity-50"
                >
                  {isInviting
                    ? "Sending…"
                    : lookup?.status === "not_found"
                    ? "Send email invite"
                    : "Send invite"}
                </button>
              </div>
            )}

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
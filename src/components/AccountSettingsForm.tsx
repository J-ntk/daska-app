"use client";

import { useState, useTransition } from "react";
import { changeEmail, changePassword } from "@/lib/actions/profile";

export default function AccountSettingsForm({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isEmailPending, startEmailTransition] = useTransition();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordPending, startPasswordTransition] = useTransition();

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailMsg(null);
    setEmailError(null);
    startEmailTransition(async () => {
      try {
        await changeEmail(email);
        setEmailMsg("Check both your old and new email for confirmation links.");
      } catch (err) {
        setEmailError(err instanceof Error ? err.message : "Couldn't update email");
      }
    });
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    startPasswordTransition(async () => {
      try {
        await changePassword(password);
        setPasswordMsg("Password updated.");
        setPassword("");
        setConfirmPassword("");
      } catch (err) {
        setPasswordError(err instanceof Error ? err.message : "Couldn't update password");
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleEmailSubmit}>
        <label className="block text-xs font-medium mb-1">Email</label>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-line rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isEmailPending || email === currentEmail}
            className="border border-line rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40 hover:border-accent transition-colors"
          >
            {isEmailPending ? "Updating…" : "Update"}
          </button>
        </div>
        {emailMsg && <p className="text-xs text-green-400 mt-2">{emailMsg}</p>}
        {emailError && <p className="text-xs text-red-400 mt-2">{emailError}</p>}
      </form>

      <form onSubmit={handlePasswordSubmit}>
        <label className="block text-xs font-medium mb-1">New password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-2"
        />
        <label className="block text-xs font-medium mb-1">Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 text-sm mb-3"
        />
        <button
          type="submit"
          disabled={isPasswordPending || !password}
          className="border border-line rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40 hover:border-accent transition-colors"
        >
          {isPasswordPending ? "Updating…" : "Update password"}
        </button>
        {passwordMsg && <p className="text-xs text-green-400 mt-2">{passwordMsg}</p>}
        {passwordError && <p className="text-xs text-red-400 mt-2">{passwordError}</p>}
      </form>
    </div>
  );
}
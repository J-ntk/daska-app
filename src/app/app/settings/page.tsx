import { createClient } from "@/lib/supabase/server";
import { disconnectGoogleCalendar } from "@/lib/actions/calendar";
import AiSettingsForm from "@/components/AiSettingsForm";
import ProfileSettingsForm from "@/components/ProfileSettingsForm";
import AccountSettingsForm from "@/components/AccountSettingsForm";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { google?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, job_title, timezone, default_view, week_start")
    .eq("id", user.id)
    .maybeSingle();

  const { data: integration } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "google")
    .maybeSingle();

  const { data: aiSettings } = await supabase
    .from("user_ai_settings")
    .select("provider, model, base_url")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-display font-semibold mb-6 border-b border-line pb-4">
        Settings
      </h1>

      {searchParams.google === "connected" && (
        <div className="mb-4 text-sm text-green-300 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
          Google Calendar connected.
        </div>
      )}
      {searchParams.google === "error" && (
        <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          Couldn&apos;t connect Google Calendar. Try again.
        </div>
      )}

      <div className="mb-3 text-xs font-medium uppercase text-ink/40">Profile</div>
      <div className="border border-line rounded-lg p-4 bg-surface mb-6">
        <ProfileSettingsForm
          initial={{
            fullName: profile?.full_name ?? "",
            jobTitle: profile?.job_title ?? "",
            timezone: profile?.timezone ?? "",
            defaultView: profile?.default_view ?? "daily",
            weekStart: profile?.week_start ?? "monday",
          }}
        />
      </div>

      <div className="mb-3 text-xs font-medium uppercase text-ink/40">Account</div>
      <div className="border border-line rounded-lg p-4 bg-surface mb-6">
        <AccountSettingsForm currentEmail={user.email ?? ""} />
      </div>

      <div className="mb-3 text-xs font-medium uppercase text-ink/40">Calendar</div>
      <div className="border border-line rounded-lg p-4 bg-surface mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm font-medium">Google Calendar</div>
            <div className="text-xs text-ink/50">
              {integration
                ? "Connected — tasks with a due date can sync as calendar events."
                : "Not connected."}
            </div>
          </div>
          {integration ? (
            <form action={disconnectGoogleCalendar}>
              <button className="text-xs border border-line rounded-lg px-3 py-1.5">Disconnect</button>
            </form>
          ) : (
            <a
              href="/api/auth/google"
              className="text-xs bg-gradient-to-b from-accentLight to-accent text-white rounded-lg shadow-glow hover:brightness-110 transition-[filter] px-3 py-1.5 font-medium"
            >
              Connect
            </a>
          )}
        </div>
      </div>

      <div className="mb-3 text-xs font-medium uppercase text-ink/40">AI Task Breakdown</div>
      <div className="border border-line rounded-lg p-4 bg-surface">
        <p className="text-xs text-ink/50 mb-3">
          Connect any AI provider you like — OpenAI, Anthropic, OpenRouter, Groq, or a local
          Ollama server. Nothing is added on our side, so this stays free and it&apos;s your choice.
        </p>
        <AiSettingsForm connected={aiSettings ?? null} />
      </div>
    </div>
  );
}
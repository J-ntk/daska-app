import Link from "next/link";

export const metadata = { title: "Privacy Policy — Planning App" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-accentLight underline mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="text-2xl font-display font-semibold mb-2">Privacy Policy</h1>
        <p className="text-xs text-ink/40 mb-8">Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <div className="space-y-6 text-sm text-ink/80 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-ink mb-2">What we collect</h2>
            <p>
              When you create an account, we store your email address, name, and a securely
              hashed password (we never see or store your actual password). If you add optional
              profile details — job title, timezone — those are stored too, only to personalize
              the app for you.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Your tasks and projects</h2>
            <p>
              Everything you create in the app — tasks, projects, comments, time entries — is
              stored to provide the service. Project data is visible only to you and anyone
              you&apos;ve explicitly invited to that project.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Payments</h2>
            <p>
              If you subscribe to a paid plan, payment is processed entirely by Stripe. We never
              see or store your card details — only your subscription status and plan, sent to
              us by Stripe after a successful payment.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Optional integrations</h2>
            <p>
              Google Calendar sync and AI task breakdown are both entirely optional and only
              activate if you connect them yourself in Settings. If you connect Google Calendar,
              we store an access token used solely to create calendar events for tasks you choose
              to sync. If you connect an AI provider, your API key is stored so the app can call
              that provider on your behalf — we never see your prompts or results ourselves.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Who can see your data</h2>
            <p>
              We don&apos;t sell your data or share it with advertisers. Your data is stored with
              our database provider (Supabase) and, if applicable, our payment processor (Stripe)
              and calendar/AI providers you&apos;ve personally connected — solely to operate the
              app for you.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Deleting your data</h2>
            <p>
              You can disconnect Google Calendar or your AI provider at any time from Settings.
              To delete your account and all associated data, contact us using the details below.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Contact</h2>
            <p>Questions about this policy? Reach out at the contact details in the app store listing.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
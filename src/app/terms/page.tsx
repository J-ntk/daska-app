import Link from "next/link";

export const metadata = { title: "Terms of Service — Planning App" };

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-accentLight underline mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="text-2xl font-display font-semibold mb-2">Terms of Service</h1>
        <p className="text-xs text-ink/40 mb-8">Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <div className="space-y-6 text-sm text-ink/80 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Using the app</h2>
            <p>
              By creating an account, you agree to use the app for lawful purposes and to keep
              your login credentials secure. You&apos;re responsible for the content you and
              anyone you invite to your projects add.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Plans and billing</h2>
            <p>
              The free plan includes one owned project; paid plans (Monthly, Yearly, or Lifetime)
              unlock unlimited projects. Being invited to someone else&apos;s project is always
              free, regardless of your own plan. Subscriptions renew automatically until
              cancelled; you can manage or cancel your subscription anytime from Billing, which
              opens Stripe&apos;s secure customer portal.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Referrals</h2>
            <p>
              Referral discounts apply when a referred user completes a paid subscription, and
              remain active for as long as that subscription continues. Referral rewards may be
              adjusted or discontinued for abuse (e.g. self-referral, fake accounts).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Third-party integrations</h2>
            <p>
              Google Calendar sync and AI task breakdown are optional and require you to connect
              your own accounts/API keys. We&apos;re not responsible for the availability,
              accuracy, or cost of those third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">No warranty</h2>
            <p>
              The app is provided as-is, without warranty of any kind. We&apos;ll do our best to
              keep it running reliably, but we&apos;re not liable for data loss, downtime, or
              damages arising from use of the app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Changes</h2>
            <p>
              We may update these terms as the app evolves. Continued use after changes means you
              accept the updated terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
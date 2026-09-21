import { Link } from "@/i18n/navigation";

export const metadata = { title: "Terms of Service — Daska" };

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
              free, regardless of your own plan. Monthly and Yearly subscriptions renew
              automatically until cancelled; the Lifetime plan is a one-time payment with no
              recurring charge. You can manage or cancel your subscription anytime from Billing,
              which opens Stripe&apos;s secure customer portal.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Cancelling</h2>
            <p>
              Cancelling a Monthly or Yearly subscription stops future renewals. You keep access
              to paid features until the end of the period you&apos;ve already paid for, after
              which your account reverts to the free plan. Cancelling doesn&apos;t delete your
              projects or tasks.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Refunds</h2>
            <p>
              Refunds aren&apos;t automatic, but we&apos;ll look at requests case by case,
              particularly for accidental or duplicate charges. Contact us using the details
              below and we&apos;ll get back to you.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Referrals</h2>
            <p>
              Signing up through another user&apos;s referral link earns you a coupon worth 20%
              off your first payment on the Monthly or Yearly plan. Each time someone you&apos;ve
              referred completes their first paid subscription, you earn another 20%-off coupon
              for your own next payment. Coupons apply automatically, one per payment, don&apos;t
              expire, and don&apos;t apply to the Lifetime plan. Referral rewards may be adjusted
              or withheld in cases of abuse (e.g. self-referral, fake accounts).
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

          <section>
            <h2 className="text-base font-semibold text-ink mb-2">Contact</h2>
            <p>
              Questions about billing, refunds, or anything else — email us at{" "}
              <a href="mailto:support@daska.site" className="text-accentLight underline">
                support@daska.site
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
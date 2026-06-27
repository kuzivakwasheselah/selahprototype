import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Selah" },
      {
        name: "description",
        content: "How Selah collects, uses and protects your information when you use the app.",
      },
      { property: "og:title", content: "Privacy Policy — Selah" },
      { property: "og:url", content: "https://selah.website/privacy-policy" },
    ],
    links: [{ rel: "canonical", href: "https://selah.website/privacy-policy" }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 27, 2026">
      <p>
        Selah (“we”, “us”, “our”) is committed to protecting your privacy. This Privacy Policy explains what
        information we collect, how we use it, and the choices you have. By using Selah at selah.website, you
        agree to the practices described here.
      </p>

      <h2>Information we collect</h2>
      <p>
        When you create an account we collect your name, email address, and authentication details. If you sign
        in with Google, we receive basic profile information from Google. We also store content you create in the
        app, such as saved verses, prayers, and preferences.
      </p>

      <h2>How we use your information</h2>
      <ul>
        <li>To provide and maintain your account and the features of Selah.</li>
        <li>To sync your saved content and preferences across your devices.</li>
        <li>To improve the app and respond to support requests.</li>
        <li>To keep Selah secure and prevent abuse.</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We do not sell your personal information. We share data only with service providers that help us operate
        Selah (such as authentication, hosting, and AI features), and only as needed to provide the service or
        when required by law.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain your information for as long as your account is active. You may delete your account at any time,
        after which we will remove your personal data, except where retention is required by law.
      </p>

      <h2>Your rights</h2>
      <p>
        You may access, correct, or delete your personal information from within the app or by contacting us. You
        can also continue to use much of Selah as a guest without an account.
      </p>

      <h2>Children</h2>
      <p>
        Selah is not directed to children under 13, and we do not knowingly collect personal information from
        them.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post any changes on this page and update the
        date above.
      </p>

      <h2>Contact</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us at privacy@selah.website.
      </p>
    </LegalLayout>
  );
}

function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-[100dvh] max-w-2xl px-5 pb-24 pt-20">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Selah
      </Link>
      <h1 className="mt-6 font-serif text-4xl text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
      <div className="legal-prose mt-8 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

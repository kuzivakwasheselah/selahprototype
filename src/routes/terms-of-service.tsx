import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Selah" },
      {
        name: "description",
        content: "The terms and conditions for using the Selah reflection app at selah.website.",
      },
      { property: "og:title", content: "Terms of Service — Selah" },
      { property: "og:url", content: "https://selah.website/terms-of-service" },
    ],
    links: [{ rel: "canonical", href: "https://selah.website/terms-of-service" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 27, 2026">
      <p>
        Welcome to Selah. These Terms of Service (“Terms”) govern your use of the Selah app and website at
        selah.website (the “Service”). By accessing or using the Service, you agree to be bound by these Terms.
      </p>

      <h2>Using Selah</h2>
      <p>
        Selah provides Scripture, prayers, reflective media, and related features for personal, devotional use.
        You may use the Service only in compliance with these Terms and all applicable laws.
      </p>

      <h2>Your account</h2>
      <p>
        You may use parts of Selah as a guest. To save content across devices you can create an account. You are
        responsible for safeguarding your login credentials and for all activity under your account.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not misuse, disrupt, or attempt to gain unauthorized access to the Service.</li>
        <li>Do not use Selah for unlawful, harmful, or abusive purposes.</li>
        <li>Do not copy, resell, or redistribute the Service without permission.</li>
      </ul>

      <h2>Content</h2>
      <p>
        Scripture text and media are provided for personal reflection. Content you create, such as prayers and
        saved items, remains yours; you grant us a limited license to store and display it so we can provide the
        Service to you.
      </p>

      <h2>AI features</h2>
      <p>
        Some features, such as the Assistant and generated prayers, use artificial intelligence. AI output may not
        always be accurate and should not be treated as professional, spiritual, or pastoral advice.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The Service is provided “as is” without warranties of any kind. We do not guarantee that the Service will
        be uninterrupted, error-free, or available at all times.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Selah shall not be liable for any indirect, incidental, or
        consequential damages arising from your use of the Service.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Service after changes take effect
        constitutes acceptance of the revised Terms.
      </p>

      <h2>Contact</h2>
      <p>If you have questions about these Terms, please contact us at support@selah.website.</p>
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

import { useRef, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Loader2, ArrowRight, ChevronUp, Download, Check } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import welcomeBg from "@/assets/welcome-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Selah — Pause, Reflect & Pray" },
      {
        name: "description",
        content:
          "Welcome to Selah, a calm reflection app for Scripture, prayer and Christian media. Sign in or continue as a guest to be still and know.",
      },
      { property: "og:title", content: "Selah — Pause, Reflect & Pray" },
      {
        property: "og:description",
        content: "A calm, reflective home for Scripture, prayer and Christian media — the opposite of doomscrolling.",
      },
      { property: "og:url", content: "https://selah.website/" },
    ],
    links: [{ rel: "canonical", href: "https://selah.website/" }],
  }),
  component: WelcomePage,
});

const FEATURES = [
  "Reflect — an ambient, scroll-paced feed of Scripture over calm imagery",
  "Bible — read all 66 books, online or offline",
  "Prayers — request AI-shaped prayers and keep your own",
  "Saved — your collection of verse wallpapers",
  "Media — gospel music, podcasts and calm visuals",
  "Assistant — a gentle guide to find verses and pray with you",
  "Donate — support Selah and causes you care about",
];

function WelcomePage() {
  const navigate = useNavigate();
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const { isInstalled, promptInstall } = usePwaInstall();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const touchStartY = useRef<number | null>(null);

  const proceed = () => navigate({ to: "/reflect" });

  const onTouchStart = (e: React.TouchEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (["INPUT", "TEXTAREA", "BUTTON", "A"].includes(tag)) {
      touchStartY.current = null;
      return;
    }
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (delta > 70) proceed();
    touchStartY.current = null;
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) return toast.error("Enter your email and password");
    setBusy(true);
    const res = await signInEmail(email.trim(), password);
    setBusy(false);
    if (res.error) return toast.error(res.error);
    toast.success("Welcome back");
    proceed();
  };

  const handleSignUp = async () => {
    if (!name.trim()) return toast.error("Add your full name");
    if (!email.trim() || !password.trim()) return toast.error("Enter your email and password");
    setBusy(true);
    const res = await signUpEmail(email.trim(), password, name.trim());

    // Graceful path: account already exists — quietly try signing in instead.
    if (res.alreadyExists) {
      const signin = await signInEmail(email.trim(), password);
      setBusy(false);
      if (signin.error) {
        toast("You already have an account — please sign in.", {
          description: "We've filled in your email for you.",
        });
        return;
      }
      toast.success("Welcome back");
      return proceed();
    }

    setBusy(false);
    if (res.error) return toast.error(res.error);
    toast.success("Welcome to Selah", { description: "Your space for reflection is ready." });
    proceed();
  };

  const handleGoogle = async () => {
    setBusy(true);
    const res = await signInGoogle();
    setBusy(false);
    if (res.error) return toast.error(res.error);
    proceed();
  };

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === "unavailable") {
      toast("Install Selah", {
        description: "Open your browser menu and choose “Add to Home Screen” or “Install app”.",
      });
    }
  };

  const InstallButton = () =>
    isInstalled ? (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md">
        <Check className="h-4 w-4" /> App installed
      </span>
    ) : (
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20"
      >
        <Download className="h-4 w-4" /> Install app
      </button>
    );

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative min-h-[100dvh] overflow-hidden"
    >
      <img src={welcomeBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/55 to-black/75" />

      <div className="relative z-10 grid min-h-[100dvh] md:grid-cols-2">
        {/* LEFT — story panel (desktop) */}
        <div className="hidden flex-col justify-between p-12 text-white md:flex">
          <div className="flex items-center gap-3">
            <img src="/icon-192x192.png" alt="Selah logo" className="h-12 w-12 rounded-2xl shadow-float" />
            <span className="font-serif text-3xl">Selah</span>
          </div>

          <div className="max-w-md">
            <h1 className="font-serif text-4xl leading-tight">Be still, and know.</h1>
            <p className="mt-4 text-white/80">
              Selah is a calm, reflective home for the Word of God — the opposite of doomscrolling.
              Everything here is made to help you slow down and draw near.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/75">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <InstallButton />
            <div className="flex items-center gap-4 text-sm text-white/70">
              <Link to="/privacy-policy" className="transition hover:text-white">
                Privacy Policy
              </Link>
              <span className="text-white/30">·</span>
              <Link to="/terms-of-service" className="transition hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT — auth panel */}
        <div className="flex flex-col items-center justify-center px-5 py-10">
          {/* Mobile logo */}
          <div className="mb-6 flex flex-col items-center text-center text-white md:hidden">
            <img src="/icon-192x192.png" alt="Selah logo" className="h-16 w-16 rounded-2xl shadow-float" />
            <h1 className="mt-3 font-serif text-3xl">Selah</h1>
            <p className="mt-1 text-sm text-white/80">Pause, reflect &amp; pray</p>
          </div>

          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-background/90 p-6 shadow-float backdrop-blur-xl">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium transition hover:border-primary/40 disabled:opacity-70"
            >
              <GoogleIcon /> Sign in with Google
            </button>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:border-primary/50"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:border-primary/50"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:border-primary/50"
              />

              <button
                type="button"
                onClick={handleSignIn}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:brightness-105 disabled:opacity-70"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Sign in
              </button>
            </div>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={busy}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-accent/40 py-3 text-sm font-medium text-foreground transition hover:bg-accent/70 disabled:opacity-70"
            >
              Create account
            </button>
          </div>

          {/* Install + proceed (mobile shows everything here) */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="md:hidden">
              <InstallButton />
            </div>

            <button
              type="button"
              onClick={proceed}
              className="flex items-center gap-1.5 text-sm font-medium text-white/85 transition hover:text-white"
            >
              Proceed without signing in <ArrowRight className="h-4 w-4" />
            </button>

            {/* Swipe-up hint (mobile) */}
            <button
              type="button"
              onClick={proceed}
              className="flex flex-col items-center text-white/60 md:hidden"
              aria-label="Swipe up to continue"
            >
              <ChevronUp className="h-5 w-5 animate-bounce" />
              <span className="text-xs">Swipe up to continue</span>
            </button>

            <div className="flex items-center gap-4 text-xs text-white/60 md:hidden">
              <Link to="/privacy-policy" className="transition hover:text-white">
                Privacy Policy
              </Link>
              <span className="text-white/30">·</span>
              <Link to="/terms-of-service" className="transition hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

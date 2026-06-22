import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Selah" },
      { name: "description", content: "Sign in to Selah to sync your saves, prayers and groups across devices." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password.trim()) return toast.error("Enter your email and password");
    if (mode === "signup" && !name.trim()) return toast.error("Add your name");
    setBusy(true);
    const res =
      mode === "signin"
        ? await signInEmail(email.trim(), password)
        : await signUpEmail(email.trim(), password, name.trim());
    setBusy(false);
    if (res.error) return toast.error(res.error);
    toast.success(mode === "signin" ? "Welcome back" : "Welcome to Selah");
    navigate({ to: "/reflect" });
  };

  const google = async () => {
    setBusy(true);
    const res = await signInGoogle();
    setBusy(false);
    if (res.error) toast.error(res.error);
  };

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-foreground">Selah</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? "Welcome back. Be still." : "Create your space for reflection."}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary/50"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary/50"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Password"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary/50"
          />

          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:brightness-105 disabled:opacity-70"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium transition hover:border-primary/40 disabled:opacity-70"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to Selah?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-medium text-primary"
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>

        <Link
          to="/reflect"
          className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          Continue without an account <ArrowRight className="h-4 w-4" />
        </Link>
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
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

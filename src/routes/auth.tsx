import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { SiteLayout } from "@/components/SiteLayout";
import { useSession } from "@/hooks/use-session";

type AuthSearch = { mode?: "signup" | "login" | undefined; redirect?: string | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search["mode"] === "signup" ? "signup" : undefined,
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Log in or sign up — GHUMOO self-drive rentals" },
      {
        name: "description",
        content: "Access your GHUMOO account to book self-drive cars and bikes and manage trips.",
      },
      { property: "og:title", content: "Log in to GHUMOO" },
      { property: "og:description", content: "Sign in to book self-drive cars and bikes in India." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useSession();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate({ to: redirect ?? "/dashboard", replace: true });
  }, [user, navigate, redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        setMessage("Account created. If confirmation is required, check your inbox.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setMessage(null);
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto flex max-w-md flex-col px-6 py-16">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignup
            ? "Sign up to book self-drive cars and bikes across 12 cities."
            : "Log in to manage your bookings and saved vehicles."}
        </p>

        <button
          onClick={google}
          className="mt-8 rounded-xl glass-strong px-5 py-3 text-sm font-semibold transition hover:bg-secondary"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or use email <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="grid gap-3">
          {isSignup ? (
            <label className="rounded-xl bg-secondary/60 px-4 py-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Full name
              </span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none"
              />
            </label>
          ) : null}
          <label className="rounded-xl bg-secondary/60 px-4 py-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none"
            />
          </label>
          <label className="rounded-xl bg-secondary/60 px-4 py-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60"
          >
            {busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        {message ? (
          <p className="mt-4 rounded-xl glass px-4 py-3 text-sm text-muted-foreground">{message}</p>
        ) : null}

        <button
          onClick={() => setIsSignup((v) => !v)}
          className="mt-6 text-sm text-primary transition hover:text-foreground"
        >
          {isSignup ? "Already have an account? Log in" : "New to GHUMOO? Create an account"}
        </button>

        <Link to="/" className="mt-2 text-xs text-muted-foreground transition hover:text-foreground">
          ← Back to home
        </Link>
      </section>
    </SiteLayout>
  );
}

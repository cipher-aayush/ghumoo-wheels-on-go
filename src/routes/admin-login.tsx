import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin sign-in — DriveEasy operations" },
      {
        name: "description",
        content: "Secure sign-in for the DriveEasy operations team to manage fleet, bookings and revenue.",
      },
      { property: "og:title", content: "Admin sign-in — DriveEasy" },
      { property: "og:description", content: "Operations access to the DriveEasy admin dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      const userId = data.user?.id;
      if (!userId) throw new Error("Sign-in did not return an account.");
      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (roleError) throw roleError;
      if (!isAdmin) {
        await supabase.auth.signOut();
        setError("This account doesn’t have admin access. Use the normal log in page instead.");
        return;
      }
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto flex max-w-md flex-col px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Operations</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Admin sign-in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Restricted to accounts with the admin role. Customers should use the regular log in page.
        </p>

        <form onSubmit={submit} className="mt-8 grid gap-3">
          <label className="rounded-xl bg-secondary/60 px-4 py-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Admin email
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
            {busy ? "Checking access…" : "Enter admin dashboard"}
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</p>
        ) : null}

        <Link to="/auth" className="mt-6 text-sm text-primary transition hover:text-foreground">
          Customer log in instead →
        </Link>
      </section>
    </SiteLayout>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useIsAdmin } from "@/hooks/use-session";
import { BrandLogo } from "@/components/BrandLogo";

export function Navbar() {
  const { user } = useSession();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const linkClass = "transition hover:text-primary";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <BrandLogo />
          <span className="font-display text-xl font-bold tracking-tight">DriveEasy</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/" className={linkClass} activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/vehicles" className={linkClass} activeProps={{ className: "text-foreground" }}>
            Vehicles
          </Link>
          <Link to="/about" className={linkClass} activeProps={{ className: "text-foreground" }}>
            About
          </Link>
          <Link to="/contact" className={linkClass} activeProps={{ className: "text-foreground" }}>
            Contact
          </Link>
          {isAdmin ? (
            <Link to="/admin" className={linkClass} activeProps={{ className: "text-foreground" }}>
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:block"
              >
                My bookings
              </Link>
              <button
                onClick={signOut}
                className="rounded-lg glass px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:block"
              >
                Log in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="rounded-lg gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:shadow-primary/40"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

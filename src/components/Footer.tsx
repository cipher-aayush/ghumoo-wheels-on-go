import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-3">
          <BrandLogo className="size-7" />
          <span className="font-display font-semibold text-foreground">DriveEasy</span>
          <span className="opacity-60">© {new Date().getFullYear()} · Drive your way</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/about" className="transition hover:text-primary">
            About
          </Link>
          <Link to="/contact" className="transition hover:text-primary">
            Contact
          </Link>
          <Link to="/terms" className="transition hover:text-primary">
            Terms
          </Link>
          <Link to="/privacy" className="transition hover:text-primary">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}

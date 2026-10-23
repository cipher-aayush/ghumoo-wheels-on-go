import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "driveeasy-theme";

export function ThemeToggle() {
  // Dark is the DriveEasy brand default; the value below only matters after
  // hydration, when the pre-paint script + this effect have read localStorage.
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(!document.documentElement.classList.contains("dark") === false || true ? document.documentElement.classList.contains("dark") : true);
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      // storage unavailable — theme still applies for this session
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="glass rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

import { useEffect, useState } from "react";
import driveEasyLogo from "@/assets/driveeasy-logo-road.png";

/**
 * Astra-style opening: drifting colour ribbons sweep in, implode into a
 * single glow, and the DriveEasy "D" mark forms with a star sparkle before
 * the site reveals. Plays on every page load.
 *
 * The dark backdrop itself is `html.astra-boot::before` (see styles.css) and
 * is applied by the pre-paint script in __root, so the page never flashes
 * before the intro. Blob animations are gated on `html.astra-boot` in CSS so
 * they start from the server HTML and stay invisible for repeat visitors.
 */

type Phase = "converge" | "form" | "reveal" | "done";

const BLOBS = [
  { color: "var(--color-primary)", sx: "-52vw", sy: "-44vh", ss: "1.5", sr: "-24deg", ex: "7vw", ey: "-5vh", delay: "0s" },
  { color: "var(--color-violet)", sx: "55vw", sy: "46vh", ss: "1.6", sr: "18deg", ex: "-8vw", ey: "6vh", delay: "0.1s" },
  { color: "var(--color-primary)", sx: "48vw", sy: "-50vh", ss: "1.3", sr: "12deg", ex: "-5vw", ey: "4vh", delay: "0.18s" },
  { color: "var(--color-violet)", sx: "-58vw", sy: "38vh", ss: "1.4", sr: "-14deg", ex: "6vw", ey: "-6vh", delay: "0.26s" },
  { color: "var(--color-accent)", sx: "-30vw", sy: "56vh", ss: "1.1", sr: "8deg", ex: "0vw", ey: "8vh", delay: "0.34s" },
  { color: "var(--color-violet)", sx: "26vw", sy: "-58vh", ss: "1.2", sr: "-10deg", ex: "-2vw", ey: "-7vh", delay: "0.4s" },
  { color: "var(--color-primary)", sx: "0vw", sy: "66vh", ss: "1.5", sr: "20deg", ex: "3vw", ey: "2vh", delay: "0.48s" },
] as const;

export function AuroraIntro() {
  const [phase, setPhase] = useState<Phase>("converge");

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("astra-boot")) {
      setPhase("done");
      return;
    }

    const timers = [
      window.setTimeout(() => setPhase("form"), 2000),
      window.setTimeout(() => {
        root.classList.add("astra-out");
        setPhase("reveal");
      }, 3100),
      window.setTimeout(() => {
        root.classList.remove("astra-boot", "astra-out");
        setPhase("done");
      }, 4000),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  if (phase === "done") return null;

  return (
    <div className={`astra-intro is-${phase}`} aria-hidden>
      <div className="astra-blob-field">
        {BLOBS.map((b, i) => (
          <div
            key={i}
            className="astra-blob"
            style={
              {
                "--astra-color": b.color,
                "--astra-sx": b.sx,
                "--astra-sy": b.sy,
                "--astra-ss": b.ss,
                "--astra-sr": b.sr,
                "--astra-ex": b.ex,
                "--astra-ey": b.ey,
                "--astra-delay": b.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="astra-core">
        <div className="astra-glow" />
        <img src={driveEasyLogo} alt="" width={734} height={699} className="astra-logo" />
        <svg viewBox="0 0 24 24" fill="currentColor" className="astra-star">
          <path d="M12 0l1.9 10.1L24 12l-10.1 1.9L12 24l-1.9-10.1L0 12l10.1-1.9z" />
        </svg>
      </div>
    </div>
  );
}

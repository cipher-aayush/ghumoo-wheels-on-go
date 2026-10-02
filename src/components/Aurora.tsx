import { useEffect, useRef } from "react";

export function Aurora() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      layer.style.setProperty("--aurora-scroll", `${window.scrollY}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="aurora-scroll pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="aurora-ribbon aurora-ribbon-primary absolute -left-[12%] -top-[18%] h-[62vh] w-[76vw] rotate-[-12deg] blur-[80px]"
        style={{
          background:
            "linear-gradient(105deg, transparent, color-mix(in oklab, var(--color-primary) 30%, transparent), transparent 72%)",
        }}
      />
      <div
        className="aurora-ribbon aurora-ribbon-violet absolute -bottom-[18%] -right-[16%] h-[70vh] w-[80vw] rotate-[14deg] blur-[90px]"
        style={{
          background:
            "linear-gradient(75deg, transparent, color-mix(in oklab, var(--color-violet) 28%, transparent), transparent 70%)",
        }}
      />
      <div
        className="aurora-ribbon aurora-ribbon-mid absolute right-[8%] top-[24%] h-[48vh] w-[58vw] rotate-[-20deg] blur-[85px]"
        style={{
          background:
            "linear-gradient(115deg, transparent, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 68%)",
        }}
      />
    </div>
  );
}

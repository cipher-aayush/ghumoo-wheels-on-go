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
      <div className="aurora-ribbon aurora-ribbon-primary absolute -left-[14%] -top-[22%] h-[72vh] w-[82vw]">
        <div className="aurora-blob aurora-blob-a h-full w-full blur-[110px]" />
      </div>
      <div className="aurora-ribbon aurora-ribbon-violet absolute -bottom-[24%] -right-[18%] h-[78vh] w-[86vw]">
        <div className="aurora-blob aurora-blob-b h-full w-full blur-[120px]" />
      </div>
      <div className="aurora-ribbon aurora-ribbon-mid absolute left-[26%] top-[28%] h-[56vh] w-[62vw]">
        <div className="aurora-blob aurora-blob-c h-full w-full blur-[100px]" />
      </div>
      <div className="absolute left-[4%] top-[50%] h-[42vh] w-[48vw]">
        <div className="aurora-blob aurora-blob-d h-full w-full blur-[105px]" />
      </div>
    </div>
  );
}

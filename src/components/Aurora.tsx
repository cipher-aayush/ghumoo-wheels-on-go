export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute -left-[5%] -top-[15%] size-[55vw] rounded-full blur-[80px]"
        style={{
          background:
            "radial-gradient(circle at center, color-mix(in oklab, var(--color-primary) 35%, transparent), transparent 62%)",
        }}
      />
      <div
        className="absolute -bottom-[20%] -right-[5%] size-[50vw] rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(circle at center, color-mix(in oklab, var(--color-violet) 32%, transparent), transparent 62%)",
        }}
      />
      <div
        className="absolute right-[15%] top-[30%] size-[35vw] rounded-full blur-[85px]"
        style={{
          background:
            "radial-gradient(circle at center, color-mix(in oklab, var(--color-primary) 20%, transparent), transparent 60%)",
        }}
      />
    </div>
  );
}

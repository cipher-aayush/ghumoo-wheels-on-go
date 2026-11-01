import type { ReactNode } from "react";
import { Aurora } from "./Aurora";
import { AuroraIntro } from "./AuroraIntro";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuroraIntro />
      <Aurora />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact GHUMOO — support for self-drive rentals" },
      {
        name: "description",
        content:
          "Reach the GHUMOO team for booking help, roadside assistance, corporate rentals or fleet partnerships.",
      },
      { property: "og:title", content: "Contact GHUMOO" },
      { property: "og:description", content: "Support, roadside assistance and partnership enquiries." },
    ],
  }),
  component: Contact,
});

const CHANNELS = [
  ["24/7 roadside", "1800-000-4826", "Breakdowns, accidents and lockouts."],
  ["Booking support", "support@ghumoo.in", "Changes, cancellations and refunds."],
  ["Partnerships", "fleet@ghumoo.in", "List your vehicles on GHUMOO."],
];

function Contact() {
  const [sent, setSent] = useState(false);

  const fieldClass = "rounded-xl bg-secondary/60 px-4 py-3";
  const labelClass = "text-[11px] font-medium uppercase tracking-wider text-muted-foreground";
  const inputClass = "mt-0.5 w-full bg-transparent text-sm font-semibold outline-none";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="font-display text-4xl font-bold tracking-tight">Talk to us</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Real humans, based in Bengaluru, answering every hour of every day. Most messages get a reply within
          two hours.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-4">
            {CHANNELS.map(([title, value, body]) => (
              <div key={title} className="rounded-2xl glass p-6">
                <h2 className="font-display text-lg font-semibold">{title}</h2>
                <p className="mt-1 text-sm font-semibold text-primary">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
            <div className="rounded-2xl glass p-6">
              <h2 className="font-display text-lg font-semibold">Head office</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                4th Floor, Indiranagar 100ft Road, Bengaluru 560038, Karnataka
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="h-fit rounded-3xl glass-strong p-6"
          >
            <h2 className="font-display text-xl font-semibold">Send a message</h2>
            <div className="mt-5 grid gap-3">
              <label className={fieldClass}>
                <span className={labelClass}>Your name</span>
                <input required className={inputClass} />
              </label>
              <label className={fieldClass}>
                <span className={labelClass}>Email</span>
                <input type="email" required className={inputClass} />
              </label>
              <label className={fieldClass}>
                <span className={labelClass}>Message</span>
                <textarea required rows={5} className={`${inputClass} resize-none`} />
              </label>
              <button
                type="submit"
                className="rounded-xl gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:shadow-lg hover:shadow-primary/30"
              >
                Send message
              </button>
              {sent ? (
                <p className="rounded-xl glass px-4 py-3 text-sm text-muted-foreground">
                  Thanks — we've got your message and will reply by email shortly.
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — DriveEasy self-drive rentals" },
      {
        name: "description",
        content:
          "How DriveEasy collects, uses, stores and protects your account, licence and booking data, and the rights you have over it.",
      },
      { property: "og:title", content: "Privacy Policy — DriveEasy" },
      {
        property: "og:description",
        content: "What data we collect, why we collect it, how long we keep it, and your rights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

const SECTIONS = [
  {
    title: "What we collect",
    body: "Account details (name, email, phone), driving licence number and image, booking history, and technical data such as device type and approximate location used to show nearby vehicles.",
  },
  {
    title: "Why we collect it",
    body: "To verify that you are legally allowed to drive, to fulfil and support your bookings, to process payments and deposits, to prevent fraud, and to meet transport and tax obligations in India.",
  },
  {
    title: "Who we share it with",
    body: "Only with parties who need it to deliver your trip: our payment processor, our insurance partner, and law-enforcement or transport authorities where legally required. We never sell your personal data.",
  },
  {
    title: "How long we keep it",
    body: "Booking and invoice records are retained for eight years as required by Indian tax law. Licence images are retained while your account is active and deleted within 30 days of account closure.",
  },
  {
    title: "How we protect it",
    body: "Data is encrypted in transit and at rest. Licence uploads are stored in access-controlled storage, and staff access is limited to the small support team that handles verification and disputes.",
  },
  {
    title: "Your rights",
    body: "You can view and edit your profile at any time from your dashboard, request a copy of your data, correct inaccuracies, or ask us to delete your account. We respond to requests within 30 days.",
  },
  {
    title: "Cookies",
    body: "We use strictly necessary cookies to keep you signed in and remember your city and search preferences. We do not run third-party advertising trackers.",
  },
];

function Privacy() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Legal</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Last updated 1 September 2026. We collect the least we can get away with, keep it only as long as
          the law requires, and never sell it.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <article key={s.title} className="rounded-3xl glass p-6">
              <h2 className="font-display text-lg font-semibold">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </article>
          ))}
        </div>

        <p className="mt-10 rounded-3xl glass-strong p-6 text-sm text-muted-foreground">
          To exercise any of your rights, write to us from the contact page using the email address on your
          account.
        </p>
      </section>
    </SiteLayout>
  );
}

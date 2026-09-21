import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — DriveEasy self-drive rentals" },
      {
        name: "description",
        content:
          "Rental terms for DriveEasy self-drive cars and bikes: eligibility, deposits, fuel, damage, cancellations and late returns.",
      },
      { property: "og:title", content: "Terms of Service — DriveEasy" },
      {
        property: "og:description",
        content: "Eligibility, deposits, fuel policy, damages, cancellations and late-return rules.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

const SECTIONS = [
  {
    title: "1. Eligibility",
    body: "You must be at least 21 years old and hold a valid Indian driving licence issued at least one year before the booking date. The licence uploaded to your profile must match the person collecting the vehicle. International visitors may drive with a valid International Driving Permit alongside their home-country licence.",
  },
  {
    title: "2. Bookings and pricing",
    body: "Prices are quoted per hour and per day and are calculated from the pickup and drop-off times you select. Applicable GST at 18% and a refundable security deposit are displayed before you confirm. The total shown at checkout is the total you pay — there are no counter-side charges.",
  },
  {
    title: "3. Security deposit",
    body: "The refundable deposit is collected at booking and released within 7 working days of the vehicle being returned undamaged, with no outstanding challans, fines or fuel shortfall.",
  },
  {
    title: "4. Fuel policy",
    body: "Vehicles are handed over with the fuel or charge level noted on your trip sheet and must be returned at the same level. Any shortfall is deducted from the deposit at prevailing local rates plus a refuelling service fee.",
  },
  {
    title: "5. Damage, fines and traffic offences",
    body: "Every trip includes comprehensive insurance. You remain responsible for the policy excess, for damage caused by rash or intoxicated driving, and for all traffic challans issued during your rental period.",
  },
  {
    title: "6. Cancellations",
    body: "Cancel more than 24 hours before pickup for a full refund of the rental amount. Between 24 and 6 hours, 50% of the rental amount is retained. Within 6 hours of pickup, the rental amount is non-refundable. Deposits are always refunded in full.",
  },
  {
    title: "7. Late returns and extensions",
    body: "Extensions can be requested from your dashboard subject to availability. Unapproved late returns are billed at 1.5× the hourly rate for each hour or part thereof.",
  },
  {
    title: "8. Prohibited use",
    body: "Vehicles may not be used for racing, off-roading, sub-letting, commercial passenger transport, transporting illegal goods, or driving outside India. Smoking inside a vehicle attracts a cleaning fee.",
  },
  {
    title: "9. Changes to these terms",
    body: "We may update these terms as our service evolves. Material changes will be notified by email to the address on your account before they take effect.",
  },
];

function Terms() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Legal</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated 1 September 2026. These terms govern every DriveEasy self-drive rental.
        </p>

        <div className="mt-10 space-y-4">
          {SECTIONS.map((s) => (
            <article key={s.title} className="rounded-3xl glass p-6">
              <h2 className="font-display text-xl font-semibold">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </article>
          ))}
        </div>

        <p className="mt-10 rounded-3xl glass-strong p-6 text-sm text-muted-foreground">
          Questions about these terms? Reach us through the contact page and we will respond within one
          business day.
        </p>
      </section>
    </SiteLayout>
  );
}

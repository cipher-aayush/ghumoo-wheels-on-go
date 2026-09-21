import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About DriveEasy — self-drive mobility for India" },
      {
        name: "description",
        content:
          "DriveEasy puts keyless, insured self-drive cars and bikes in 12 Indian cities, with transparent hourly and daily pricing.",
      },
      { property: "og:title", content: "About DriveEasy" },
      {
        property: "og:description",
        content: "Why we built a keyless, insured self-drive rental network across India.",
      },
    ],
  }),
  component: About,
});

const STATS = [
  ["12", "Cities live"],
  ["214", "Vehicles ready now"],
  ["48k+", "Trips completed"],
  ["4.8", "Average rating"],
];

const VALUES = [
  {
    title: "Transparent pricing",
    body: "The price you see is the price you pay — taxes and refundable deposit shown before checkout, never after.",
  },
  {
    title: "Insured by default",
    body: "Every trip includes comprehensive cover and 24/7 roadside assistance at no extra cost.",
  },
  {
    title: "Keyless and quick",
    body: "Unlock with your phone. Most customers are on the road within ten minutes of arriving at the pickup point.",
  },
];

function About() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="font-display text-5xl font-bold tracking-tight">
          Mobility that belongs
          <br />
          <span className="bg-gradient-to-r from-primary via-foreground to-violet bg-clip-text text-transparent">
            to the driver.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
          DriveEasy started with a simple frustration: renting a car in India meant paperwork, deposits nobody
          explained, and a counter queue at the worst possible hour. We rebuilt the whole thing around the
          phone in your pocket — browse, book, unlock, drive.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-4">
          {STATS.map(([value, label]) => (
            <div key={label} className="rounded-2xl glass p-6">
              <p className="font-display text-3xl font-bold text-primary">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-3xl glass-strong p-6">
              <h2 className="font-display text-lg font-semibold">{v.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl glass p-8">
          <h2 className="font-display text-2xl font-bold">Where we're headed</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Electric vehicles now make up a growing share of the fleet, and we're expanding airport and metro
            pickup points city by city. The goal is simple — a DriveEasy vehicle within a ten-minute walk of
            wherever you happen to be.
          </p>
          <Link
            to="/vehicles"
            className="mt-6 inline-block rounded-xl gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Browse vehicles
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

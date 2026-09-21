import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { VehicleCard } from "@/components/VehicleCard";
import { CITIES, inr, type Vehicle } from "@/lib/vehicles";
import heroImage from "@/assets/hero-suv.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DriveEasy — Self-drive car & bike rental in India" },
      {
        name: "description",
        content:
          "Book self-drive cars and bikes by the hour or day in 12 Indian cities. Insurance included, 24/7 support, no hidden fees.",
      },
      { property: "og:title", content: "DriveEasy — Drive your way. Rent in minutes." },
      {
        property: "og:description",
        content: "Hatchbacks, sedans, SUVs and bikes ready when you are.",
      },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { n: "01", title: "Choose a location", body: "Pick from 12 cities and hundreds of pickup points." },
  { n: "02", title: "Pick your ride", body: "Filter by type, fuel, transmission and price." },
  { n: "03", title: "Book & pay", body: "Add-ons, quick KYC and secure checkout." },
  { n: "04", title: "Just drive", body: "Unlock with your phone and hit the road." },
];

const TESTIMONIALS = [
  {
    quote:
      "Booked a Harrier for a weekend trip to Ooty. Unlocking felt effortless and the app tracked everything.",
    name: "Arjun Mehta",
    meta: "Bengaluru · 27 trips",
  },
  {
    quote: "Grabbed a Classic 350 in Goa for two days. Keys in hand within ten minutes of landing.",
    name: "Farhan Khan",
    meta: "Goa · 12 trips",
  },
];

function defaultDate(offsetHours: number) {
  const d = new Date(Date.now() + offsetHours * 3_600_000);
  d.setMinutes(0, 0, 0);
  return d.toISOString().slice(0, 16);
}

function Landing() {
  const navigate = useNavigate();
  const [city, setCity] = useState(CITIES[0]!);
  const [pickup, setPickup] = useState(defaultDate(24));
  const [dropoff, setDropoff] = useState(defaultDate(48));

  const { data: featured } = useQuery({
    queryKey: ["featured-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("available", true)
        .order("trips", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as Vehicle[];
    },
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-16 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium tracking-wide text-primary">
              <span className="size-1.5 rounded-full bg-primary" /> Self-drive rentals across 12 cities
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight lg:text-6xl">
              Drive your way.
              <br />
              <span className="bg-gradient-to-r from-primary via-foreground to-violet bg-clip-text text-transparent">
                Rent in minutes.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Crisp hatchbacks, silky sedans and rugged SUVs — unlocked with your phone, insured by
              default, ready when you are.
            </p>

            <form
              className="mt-8 rounded-2xl glass-strong p-3 shadow-2xl shadow-black/40"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/vehicles", search: { city, pickup, dropoff } });
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="rounded-xl bg-secondary/60 px-4 py-3">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Pick up
                  </span>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none"
                  >
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="rounded-xl bg-secondary/60 px-4 py-3">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Date &amp; time
                  </span>
                  <input
                    type="datetime-local"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none"
                  />
                </label>
                <label className="rounded-xl bg-secondary/60 px-4 py-3">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Drop off
                  </span>
                  <input
                    type="datetime-local"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none"
                  />
                </label>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:shadow-lg hover:shadow-primary/30"
                >
                  Search vehicles
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span>✓ Insurance included</span>
              <span>✓ 24/7 roadside support</span>
              <span>✓ Fuel included</span>
              <span>✓ No hidden fees</span>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Silver SUV parked under teal and violet aurora lights on wet asphalt"
              width={1080}
              height={1350}
              className="aspect-[4/5] w-full rounded-3xl object-cover outline outline-1 -outline-offset-1 outline-border"
            />
            <div className="absolute -bottom-5 -left-5 rounded-2xl glass-strong px-5 py-4 shadow-xl">
              <p className="text-xs text-muted-foreground">Avg. per day</p>
              <p className="font-display text-2xl font-bold text-primary">{inr(1499)}</p>
            </div>
            <div className="absolute -right-3 top-6 rounded-2xl glass-strong px-4 py-3 shadow-xl">
              <p className="text-xs text-muted-foreground">Vehicles ready now</p>
              <p className="font-display text-lg font-bold">214</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl glass p-6 transition hover:bg-secondary/40">
              <span className="font-display text-3xl font-bold text-primary/80">{s.n}</span>
              <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Popular this week</h2>
            <p className="mt-1 text-sm text-muted-foreground">Most-loved rides on DriveEasy right now.</p>
          </div>
          <Link to="/vehicles" className="text-sm font-medium text-primary transition hover:text-foreground">
            View all →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(featured ?? []).map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl glass p-6 lg:col-span-2">
            <h2 className="font-display text-xl font-semibold">Available in 12 cities</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <Link
                  key={c}
                  to="/vehicles"
                  search={{ city: c }}
                  className="rounded-full bg-secondary/60 px-4 py-2 text-sm text-muted-foreground transition hover:text-primary"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-3xl glass-strong p-6">
                <blockquote className="text-sm text-muted-foreground">“{t.quote}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full gradient-brand font-display font-bold text-primary-foreground">
                    {t.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.meta}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

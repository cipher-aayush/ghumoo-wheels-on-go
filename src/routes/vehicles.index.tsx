import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { VehicleCard } from "@/components/VehicleCard";
import { CITIES, FUELS, TRANSMISSIONS, VEHICLE_TYPES, inr, type Vehicle } from "@/lib/vehicles";

type Search = {
  city?: string | undefined;
  pickup?: string | undefined;
  dropoff?: string | undefined;
  type?: string | undefined;
  fuel?: string | undefined;
  transmission?: string | undefined;
  seats?: number | undefined;
  maxPrice?: number | undefined;
  sort?: string | undefined;
};

const str = (v: unknown) => (typeof v === "string" && v.length > 0 ? v : undefined);
const num = (v: unknown) => (v === undefined || v === "" ? undefined : Number(v) || undefined);

export const Route = createFileRoute("/vehicles/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    city: str(s["city"]),
    pickup: str(s["pickup"]),
    dropoff: str(s["dropoff"]),
    type: str(s["type"]),
    fuel: str(s["fuel"]),
    transmission: str(s["transmission"]),
    seats: num(s["seats"]),
    maxPrice: num(s["maxPrice"]),
    sort: str(s["sort"]),
  }),
  head: () => ({
    meta: [
      { title: "Browse self-drive cars & bikes — DriveEasy" },
      {
        name: "description",
        content:
          "Filter self-drive rentals by city, type, fuel, transmission, seats and price. Hourly and daily rates with insurance included.",
      },
      { property: "og:title", content: "Browse self-drive cars & bikes — DriveEasy" },
      {
        property: "og:description",
        content: "Hundreds of hatchbacks, sedans, SUVs and bikes across 12 Indian cities.",
      },
    ],
  }),
  component: VehiclesPage,
});

function VehiclesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/vehicles/" });

  const setSearch = (patch: Partial<Search>) =>
    navigate({
      search: (prev: Search): Search => {
        const next: Record<string, unknown> = { ...prev };
        for (const [key, value] of Object.entries(patch)) {
          if (value === undefined) delete next[key];
          else next[key] = value;
        }
        return next as Search;
      },
      replace: true,
    });

  const { data, isLoading, error } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").eq("available", true);
      if (error) throw error;
      return data as Vehicle[];
    },
  });

  const results = useMemo(() => {
    let list = [...(data ?? [])];
    if (search.city) list = list.filter((v) => v.city === search.city);
    if (search.type) list = list.filter((v) => v.type === search.type);
    if (search.fuel) list = list.filter((v) => v.fuel === search.fuel);
    if (search.transmission) list = list.filter((v) => v.transmission === search.transmission);
    if (search.seats) list = list.filter((v) => v.seats >= search.seats!);
    if (search.maxPrice) list = list.filter((v) => Number(v.price_per_hour) <= search.maxPrice!);
    switch (search.sort) {
      case "price-asc":
        list.sort((a, b) => Number(a.price_per_hour) - Number(b.price_per_hour));
        break;
      case "price-desc":
        list.sort((a, b) => Number(b.price_per_hour) - Number(a.price_per_hour));
        break;
      case "rating":
        list.sort((a, b) => Number(b.rating) - Number(a.rating));
        break;
      default:
        list.sort((a, b) => b.trips - a.trips);
    }
    return list;
  }, [data, search]);

  const selectClass = "mt-0.5 w-full bg-transparent text-sm font-semibold outline-none";
  const fieldClass = "rounded-xl bg-secondary/60 px-4 py-3";
  const labelClass = "text-[11px] font-medium uppercase tracking-wider text-muted-foreground";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl font-bold tracking-tight">Find your ride</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {search.pickup && search.dropoff
            ? `${new Date(search.pickup).toLocaleString("en-IN")} → ${new Date(search.dropoff).toLocaleString("en-IN")}`
            : "Insurance and fuel included on every booking."}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-3xl glass-strong p-5 lg:sticky lg:top-24">
            <div className="grid gap-3">
              <label className={fieldClass}>
                <span className={labelClass}>City</span>
                <select
                  value={search.city ?? ""}
                  onChange={(e) => setSearch({ city: e.target.value || undefined })}
                  className={selectClass}
                >
                  <option value="">All cities</option>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className={fieldClass}>
                <span className={labelClass}>Type</span>
                <select
                  value={search.type ?? ""}
                  onChange={(e) => setSearch({ type: e.target.value || undefined })}
                  className={selectClass}
                >
                  <option value="">Any type</option>
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className={fieldClass}>
                <span className={labelClass}>Fuel</span>
                <select
                  value={search.fuel ?? ""}
                  onChange={(e) => setSearch({ fuel: e.target.value || undefined })}
                  className={selectClass}
                >
                  <option value="">Any fuel</option>
                  {FUELS.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </label>
              <label className={fieldClass}>
                <span className={labelClass}>Transmission</span>
                <select
                  value={search.transmission ?? ""}
                  onChange={(e) => setSearch({ transmission: e.target.value || undefined })}
                  className={selectClass}
                >
                  <option value="">Any</option>
                  {TRANSMISSIONS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className={fieldClass}>
                <span className={labelClass}>Minimum seats</span>
                <select
                  value={search.seats ?? ""}
                  onChange={(e) => setSearch({ seats: Number(e.target.value) || undefined })}
                  className={selectClass}
                >
                  <option value="">Any</option>
                  {[2, 4, 5, 7].map((n) => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </select>
              </label>
              <label className={fieldClass}>
                <span className={labelClass}>
                  Max price / hour · {search.maxPrice ? inr(search.maxPrice) : "any"}
                </span>
                <input
                  type="range"
                  min={50}
                  max={800}
                  step={25}
                  value={search.maxPrice ?? 800}
                  onChange={(e) => setSearch({ maxPrice: Number(e.target.value) })}
                  className="mt-2 w-full accent-primary"
                />
              </label>
              <label className={fieldClass}>
                <span className={labelClass}>Sort by</span>
                <select
                  value={search.sort ?? "popular"}
                  onChange={(e) => setSearch({ sort: e.target.value })}
                  className={selectClass}
                >
                  <option value="popular">Popularity</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="rating">Rating</option>
                </select>
              </label>
              <button
                onClick={() =>
                  navigate({
                    search: (prev: Search): Search => ({ pickup: prev.pickup, dropoff: prev.dropoff }),
                    replace: true,
                  })
                }
                className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary/70"
              >
                Reset filters
              </button>
            </div>
          </aside>

          <div>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading vehicles…" : `${results.length} vehicles available`}
            </p>
            {error ? (
              <p className="mt-4 rounded-2xl glass p-6 text-sm text-muted-foreground">
                Couldn't load vehicles right now. Please try again.
              </p>
            ) : null}
            <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
            {!isLoading && results.length === 0 ? (
              <p className="mt-6 rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
                No vehicles match these filters. Try widening your search.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

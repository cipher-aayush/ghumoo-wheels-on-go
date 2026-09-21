import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { inr, vehicleImage, type Vehicle } from "@/lib/vehicles";

export const Route = createFileRoute("/vehicles/$vehicleId")({
  head: () => ({
    meta: [
      { title: "Vehicle details — DriveEasy self-drive rental" },
      {
        name: "description",
        content:
          "Full specs, hourly and daily pricing, deposit, taxes and reviews for this self-drive rental vehicle.",
      },
      { property: "og:title", content: "Vehicle details — DriveEasy" },
      {
        property: "og:description",
        content: "Specs, pricing breakdown and availability for your next self-drive trip.",
      },
    ],
  }),
  component: VehicleDetail,
});

const REVIEWS = [
  { name: "Ritika S.", rating: 5, body: "Spotless interiors and pickup took under five minutes." },
  { name: "Karan D.", rating: 4, body: "Great mileage on the highway. Support answered instantly." },
  { name: "Nikhil P.", rating: 5, body: "Booked twice this month — the pricing is honestly hard to beat." },
];

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => new Date(Date.now() + i * 86_400_000));
}

function VehicleDetail() {
  const { vehicleId } = Route.useParams();
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").eq("id", vehicleId).maybeSingle();
      if (error) throw error;
      return data as Vehicle | null;
    },
  });

  const { data: favorite } = useQuery({
    queryKey: ["favorite", vehicleId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("vehicle_id", vehicleId)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function toggleFavorite() {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: `/vehicles/${vehicleId}` } });
      return;
    }
    if (favorite) {
      await supabase.from("favorites").delete().eq("id", favorite.id);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, vehicle_id: vehicleId });
    }
    queryClient.invalidateQueries({ queryKey: ["favorite", vehicleId, user.id] });
    queryClient.invalidateQueries({ queryKey: ["favorites", user.id] });
  }

  if (isLoading) {
    return (
      <SiteLayout>
        <p className="mx-auto max-w-7xl px-6 py-20 text-sm text-muted-foreground">Loading vehicle…</p>
      </SiteLayout>
    );
  }

  if (!vehicle) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h1 className="font-display text-3xl font-bold">Vehicle not found</h1>
          <Link to="/vehicles" className="mt-4 inline-block text-sm text-primary">
            ← Back to all vehicles
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const image = vehicleImage(vehicle.image_key);
  const taxes = Math.round(Number(vehicle.price_per_day) * 0.18);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Link to="/vehicles" className="text-sm text-muted-foreground transition hover:text-primary">
          ← All vehicles
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <img
              src={image}
              alt={`${vehicle.brand} ${vehicle.name} self-drive rental in ${vehicle.city}`}
              width={1024}
              height={768}
              className="aspect-[4/3] w-full rounded-3xl object-cover outline outline-1 -outline-offset-1 outline-border"
            />
            <div className="mt-4 grid grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <img
                  key={i}
                  src={image}
                  alt={`${vehicle.brand} ${vehicle.name} view ${i + 2}`}
                  loading="lazy"
                  width={400}
                  height={300}
                  className="aspect-[4/3] w-full rounded-2xl object-cover opacity-80 transition hover:opacity-100"
                />
              ))}
            </div>

            <h1 className="mt-8 font-display text-4xl font-bold tracking-tight">
              {vehicle.brand} {vehicle.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="text-primary">★</span> {Number(vehicle.rating).toFixed(1)} · {vehicle.trips}{" "}
              trips · {vehicle.city}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {vehicle.description ??
                "A well-maintained ride, sanitised before every trip and covered by comprehensive insurance."}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                ["Type", vehicle.type],
                ["Transmission", vehicle.transmission],
                ["Fuel", vehicle.fuel],
                ["Seats", String(vehicle.seats)],
                ["Mileage", vehicle.mileage ?? "—"],
                ["Luggage", vehicle.luggage ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl glass p-4">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</p>
                  <p className="mt-1 font-display text-base font-semibold">{v}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-10 font-display text-2xl font-bold">Availability</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {nextDays(14).map((d, i) => (
                <div
                  key={d.toISOString()}
                  className={`rounded-xl px-3 py-2 text-center text-xs ${
                    i % 7 === 5 ? "bg-secondary/40 text-muted-foreground line-through" : "glass text-foreground"
                  }`}
                >
                  <span className="block font-semibold">{d.getDate()}</span>
                  <span className="block opacity-70">
                    {d.toLocaleDateString("en-IN", { month: "short" })}
                  </span>
                </div>
              ))}
            </div>

            <h2 className="mt-10 font-display text-2xl font-bold">Reviews</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {REVIEWS.map((r) => (
                <figure key={r.name} className="rounded-2xl glass p-5">
                  <p className="text-primary">{"★".repeat(r.rating)}</p>
                  <blockquote className="mt-2 text-sm text-muted-foreground">{r.body}</blockquote>
                  <figcaption className="mt-3 text-xs font-semibold">{r.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-3xl glass-strong p-6 lg:sticky lg:top-24">
            <p className="font-display text-3xl font-bold">
              {inr(Number(vehicle.price_per_hour))}
              <span className="text-sm font-normal text-muted-foreground">/hour</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or {inr(Number(vehicle.price_per_day))} per day
            </p>

            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Daily rate</dt>
                <dd>{inr(Number(vehicle.price_per_day))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST (18%)</dt>
                <dd>{inr(taxes)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Refundable deposit</dt>
                <dd>{inr(Number(vehicle.security_deposit))}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <dt>Day one total</dt>
                <dd>{inr(Number(vehicle.price_per_day) + taxes + Number(vehicle.security_deposit))}</dd>
              </div>
            </dl>

            <Link
              to="/book/$vehicleId"
              params={{ vehicleId: vehicle.id }}
              className="mt-6 block rounded-xl gradient-brand px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:shadow-lg hover:shadow-primary/30"
            >
              Book now
            </Link>
            <button
              onClick={toggleFavorite}
              className="mt-3 w-full rounded-xl bg-secondary px-5 py-3 text-sm font-semibold transition hover:bg-secondary/70"
            >
              {favorite ? "♥ Saved" : "♡ Save for later"}
            </button>
            <p className="mt-4 text-xs text-muted-foreground">
              Insurance, fuel and 24/7 roadside support included.
            </p>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

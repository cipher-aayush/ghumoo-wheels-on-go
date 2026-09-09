import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { inr, vehicleImage, type Vehicle } from "@/lib/vehicles";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My bookings — GHUMOO dashboard" },
      {
        name: "description",
        content: "Track upcoming, ongoing and past self-drive trips, update your profile and licence, and revisit saved vehicles.",
      },
      { property: "og:title", content: "My bookings — GHUMOO" },
      { property: "og:description", content: "Your trips, profile and saved vehicles in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type BookingRow = {
  id: string;
  reference: string;
  status: string;
  pickup_at: string;
  dropoff_at: string;
  pickup_city: string;
  total_amount: number;
  vehicle_id: string;
  vehicles: Vehicle | null;
};

const TABS = ["Upcoming", "Ongoing", "Past", "Profile", "Saved"] as const;

function bucketOf(b: BookingRow) {
  const now = Date.now();
  if (b.status === "cancelled") return "Past";
  if (new Date(b.dropoff_at).getTime() < now) return "Past";
  if (new Date(b.pickup_at).getTime() <= now) return "Ongoing";
  return "Upcoming";
}

function statusClass(status: string) {
  if (status === "cancelled") return "bg-destructive/15 text-destructive";
  if (status === "completed") return "bg-secondary/60 text-muted-foreground";
  return "bg-primary/15 text-primary";
}

function Dashboard() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Upcoming");

  const { data: bookings = [] } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, vehicles(*)")
        .eq("user_id", user!.id)
        .order("pickup_at", { ascending: false });
      if (error) throw error;
      return data as unknown as BookingRow[];
    },
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("id, vehicles(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data as unknown as { id: string; vehicles: Vehicle | null }[];
    },
  });

  async function cancelBooking(id: string) {
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["my-bookings", user?.id] });
  }

  async function removeFavorite(id: string) {
    await supabase.from("favorites").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
  }

  const visible = bookings.filter((b) => bucketOf(b) === tab);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl font-bold tracking-tight">My dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                tab === t ? "gradient-brand text-primary-foreground" : "bg-secondary/40 hover:bg-secondary/70"
              }`}
            >
              {t}
              {t === "Saved" ? ` (${favorites.length})` : ""}
            </button>
          ))}
        </div>

        {tab === "Profile" ? (
          <ProfileEditor userId={user?.id} />
        ) : tab === "Saved" ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.length === 0 ? (
              <Empty text="Nothing saved yet." />
            ) : (
              favorites.map((f) =>
                f.vehicles ? (
                  <article key={f.id} className="overflow-hidden rounded-3xl glass">
                    <img
                      src={vehicleImage(f.vehicles.image_key)}
                      alt={`${f.vehicles.brand} ${f.vehicles.name}`}
                      loading="lazy"
                      width={400}
                      height={300}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-5">
                      <h2 className="font-display text-lg font-semibold">
                        {f.vehicles.brand} {f.vehicles.name}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {f.vehicles.city} · {inr(Number(f.vehicles.price_per_day))}/day
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Link
                          to="/vehicles/$vehicleId"
                          params={{ vehicleId: f.vehicles.id }}
                          className="rounded-xl gradient-brand px-4 py-2 text-xs font-semibold text-primary-foreground"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => removeFavorite(f.id)}
                          className="rounded-xl bg-secondary px-4 py-2 text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ) : null,
              )
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {visible.length === 0 ? (
              <Empty text={`No ${tab.toLowerCase()} trips.`} />
            ) : (
              visible.map((b) => (
                <article
                  key={b.id}
                  className="flex flex-col gap-5 rounded-3xl glass p-5 sm:flex-row sm:items-center"
                >
                  {b.vehicles ? (
                    <img
                      src={vehicleImage(b.vehicles.image_key)}
                      alt={`${b.vehicles.brand} ${b.vehicles.name}`}
                      loading="lazy"
                      width={200}
                      height={150}
                      className="h-28 w-full rounded-2xl object-cover sm:w-44"
                    />
                  ) : null}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-lg font-semibold">
                        {b.vehicles ? `${b.vehicles.brand} ${b.vehicles.name}` : "Vehicle"}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${statusClass(b.status)}`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Booking {b.reference}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {new Date(b.pickup_at).toLocaleString("en-IN")} →{" "}
                      {new Date(b.dropoff_at).toLocaleString("en-IN")} · {b.pickup_city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold">{inr(Number(b.total_amount))}</p>
                    {bucketOf(b) === "Upcoming" && b.status !== "cancelled" ? (
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="mt-2 rounded-xl bg-secondary px-4 py-2 text-xs font-semibold transition hover:bg-secondary/70"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-3xl glass p-10 text-center text-sm text-muted-foreground">{text}</p>
  );
}

function ProfileEditor({ userId }: { userId: string | undefined }) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseFile, setLicenseFile] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setLicenseNumber(profile.license_number ?? "");
  }, [profile]);

  async function save() {
    if (!userId) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, license_number: licenseNumber })
      .eq("id", userId);
    setMessage(error ? error.message : "Profile saved.");
    queryClient.invalidateQueries({ queryKey: ["profile", userId] });
  }

  return (
    <div className="mt-8 max-w-2xl rounded-3xl glass p-6">
      <h2 className="font-display text-xl font-semibold">Profile & licence</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Full name</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="field w-full rounded-xl px-4 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Mobile</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="field w-full rounded-xl px-4 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Licence number
          </span>
          <input
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            className="field w-full rounded-xl px-4 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Licence photo
          </span>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setLicenseFile(e.target.files?.[0]?.name ?? null)}
            className="field w-full rounded-xl px-4 py-2.5 text-sm text-muted-foreground"
          />
          {licenseFile ? <p className="mt-2 text-xs text-primary">Attached: {licenseFile}</p> : null}
        </label>
      </div>
      {message ? <p className="mt-4 text-sm text-primary">{message}</p> : null}
      <button
        onClick={save}
        className="mt-5 rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground"
      >
        Save profile
      </button>
    </div>
  );
}

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { useSession, useIsAdmin } from "@/hooks/use-session";
import {
  CITIES,
  FUELS,
  IMAGE_KEYS,
  TRANSMISSIONS,
  VEHICLE_TYPES,
  inr,
  vehicleImage,
  type Vehicle,
} from "@/lib/vehicles";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — GHUMOO fleet & bookings" },
      {
        name: "description",
        content: "Manage the GHUMOO fleet, add or retire vehicles, and review every booking with its status.",
      },
      { property: "og:title", content: "Admin panel — GHUMOO" },
      { property: "og:description", content: "Fleet CRUD, booking oversight and live stats." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admin,
});

type Draft = {
  id?: string;
  name: string;
  brand: string;
  type: string;
  city: string;
  transmission: string;
  fuel: string;
  seats: number;
  mileage: string;
  luggage: string;
  price_per_hour: number;
  price_per_day: number;
  security_deposit: number;
  description: string;
  image_key: string;
  available: boolean;
};

const EMPTY: Draft = {
  name: "",
  brand: "",
  type: VEHICLE_TYPES[0],
  city: CITIES[0],
  transmission: TRANSMISSIONS[0],
  fuel: FUELS[0],
  seats: 5,
  mileage: "",
  luggage: "",
  price_per_hour: 180,
  price_per_day: 2400,
  security_deposit: 3000,
  description: "",
  image_key: IMAGE_KEYS[0],
  available: true,
};

const STATUSES = ["confirmed", "ongoing", "completed", "cancelled"];

function Admin() {
  const { user } = useSession();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"fleet" | "bookings">("fleet");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["admin-vehicles"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error: err } = await supabase.from("vehicles").select("*").order("brand");
      if (err) throw err;
      return data as Vehicle[];
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["admin-bookings"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("bookings")
        .select("*, vehicles(brand, name)")
        .order("created_at", { ascending: false });
      if (err) throw err;
      return data as unknown as {
        id: string;
        reference: string;
        status: string;
        pickup_at: string;
        dropoff_at: string;
        pickup_city: string;
        customer_name: string | null;
        customer_email: string | null;
        total_amount: number;
        vehicles: { brand: string; name: string } | null;
      }[];
    },
  });

  async function saveDraft() {
    if (!draft) return;
    setError(null);
    const payload = {
      name: draft.name,
      brand: draft.brand,
      type: draft.type,
      city: draft.city,
      transmission: draft.transmission,
      fuel: draft.fuel,
      seats: Number(draft.seats),
      mileage: draft.mileage || null,
      luggage: draft.luggage || null,
      price_per_hour: Number(draft.price_per_hour),
      price_per_day: Number(draft.price_per_day),
      security_deposit: Number(draft.security_deposit),
      description: draft.description || null,
      image_key: draft.image_key,
      available: draft.available,
    };
    const res = draft.id
      ? await supabase.from("vehicles").update(payload).eq("id", draft.id)
      : await supabase.from("vehicles").insert(payload);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setDraft(null);
    queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
  }

  async function removeVehicle(id: string) {
    const { error: err } = await supabase.from("vehicles").delete().eq("id", id);
    if (err) setError(err.message);
    queryClient.invalidateQueries({ queryKey: ["admin-vehicles"] });
  }

  async function setStatus(id: string, status: string) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
  }

  if (roleLoading) {
    return (
      <SiteLayout>
        <p className="mx-auto max-w-7xl px-6 py-20 text-sm text-muted-foreground">Checking access…</p>
      </SiteLayout>
    );
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h1 className="font-display text-3xl font-bold">Admin access only</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This account does not have the admin role. Ask an existing admin to grant it.
          </p>
        </div>
      </SiteLayout>
    );
  }

  const revenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + Number(b.total_amount), 0);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl font-bold tracking-tight">Admin panel</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            ["Vehicles", String(vehicles.length)],
            ["Available now", String(vehicles.filter((v) => v.available).length)],
            ["Bookings", String(bookings.length)],
            ["Gross revenue", inr(revenue)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-3xl glass p-5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</p>
              <p className="mt-1 font-display text-2xl font-bold">{v}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {(["fleet", "bookings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium capitalize transition ${
                tab === t ? "gradient-brand text-primary-foreground" : "bg-secondary/40 hover:bg-secondary/70"
              }`}
            >
              {t}
            </button>
          ))}
          {tab === "fleet" ? (
            <button
              onClick={() => setDraft({ ...EMPTY })}
              className="ml-auto rounded-xl glass px-5 py-2.5 text-sm font-semibold text-primary"
            >
              + Add vehicle
            </button>
          ) : null}
        </div>

        {error ? (
          <p className="mt-4 rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</p>
        ) : null}

        {draft ? (
          <div className="mt-6 rounded-3xl glass-strong p-6">
            <h2 className="font-display text-xl font-semibold">
              {draft.id ? "Edit vehicle" : "New vehicle"}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Text label="Brand" value={draft.brand} onChange={(v) => setDraft({ ...draft, brand: v })} />
              <Text label="Model name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
              <Select
                label="Type"
                value={draft.type}
                options={VEHICLE_TYPES}
                onChange={(v) => setDraft({ ...draft, type: v })}
              />
              <Select
                label="City"
                value={draft.city}
                options={CITIES}
                onChange={(v) => setDraft({ ...draft, city: v })}
              />
              <Select
                label="Transmission"
                value={draft.transmission}
                options={TRANSMISSIONS}
                onChange={(v) => setDraft({ ...draft, transmission: v })}
              />
              <Select
                label="Fuel"
                value={draft.fuel}
                options={FUELS}
                onChange={(v) => setDraft({ ...draft, fuel: v })}
              />
              <Text
                label="Seats"
                value={String(draft.seats)}
                onChange={(v) => setDraft({ ...draft, seats: Number(v) || 0 })}
              />
              <Text
                label="Mileage"
                value={draft.mileage}
                onChange={(v) => setDraft({ ...draft, mileage: v })}
              />
              <Text
                label="Luggage"
                value={draft.luggage}
                onChange={(v) => setDraft({ ...draft, luggage: v })}
              />
              <Text
                label="Price / hour"
                value={String(draft.price_per_hour)}
                onChange={(v) => setDraft({ ...draft, price_per_hour: Number(v) || 0 })}
              />
              <Text
                label="Price / day"
                value={String(draft.price_per_day)}
                onChange={(v) => setDraft({ ...draft, price_per_day: Number(v) || 0 })}
              />
              <Text
                label="Deposit"
                value={String(draft.security_deposit)}
                onChange={(v) => setDraft({ ...draft, security_deposit: Number(v) || 0 })}
              />
              <Select
                label="Image"
                value={draft.image_key}
                options={IMAGE_KEYS}
                onChange={(v) => setDraft({ ...draft, image_key: v })}
              />
              <label className="flex items-end gap-2 pb-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.available}
                  onChange={(e) => setDraft({ ...draft, available: e.target.checked })}
                />
                Available for booking
              </label>
              <label className="block sm:col-span-3">
                <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                  Description
                </span>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={3}
                  className="field w-full rounded-xl px-4 py-3 text-sm"
                />
              </label>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={saveDraft}
                className="rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                Save vehicle
              </button>
              <button
                onClick={() => setDraft(null)}
                className="rounded-xl bg-secondary px-6 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {tab === "fleet" ? (
          <div className="mt-6 grid gap-4">
            {vehicles.map((v) => (
              <article key={v.id} className="flex flex-col gap-5 rounded-3xl glass p-5 sm:flex-row sm:items-center">
                <img
                  src={vehicleImage(v.image_key)}
                  alt={`${v.brand} ${v.name}`}
                  loading="lazy"
                  width={180}
                  height={135}
                  className="h-24 w-full rounded-2xl object-cover sm:w-36"
                />
                <div className="flex-1">
                  <h2 className="font-display text-lg font-semibold">
                    {v.brand} {v.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {v.city} · {v.type} · {v.transmission} · {v.fuel} · {v.seats} seats
                  </p>
                  <p className="mt-1 text-sm">
                    {inr(Number(v.price_per_hour))}/hr · {inr(Number(v.price_per_day))}/day
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${
                      v.available ? "bg-primary/15 text-primary" : "bg-secondary/60 text-muted-foreground"
                    }`}
                  >
                    {v.available ? "Live" : "Hidden"}
                  </span>
                  <button
                    onClick={() =>
                      setDraft({
                        id: v.id,
                        name: v.name,
                        brand: v.brand,
                        type: v.type,
                        city: v.city,
                        transmission: v.transmission,
                        fuel: v.fuel,
                        seats: v.seats,
                        mileage: v.mileage ?? "",
                        luggage: v.luggage ?? "",
                        price_per_hour: Number(v.price_per_hour),
                        price_per_day: Number(v.price_per_day),
                        security_deposit: Number(v.security_deposit),
                        description: v.description ?? "",
                        image_key: v.image_key,
                        available: v.available,
                      })
                    }
                    className="rounded-xl bg-secondary px-4 py-2 text-xs font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeVehicle(v.id)}
                    className="rounded-xl bg-destructive/15 px-4 py-2 text-xs font-semibold text-destructive"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {bookings.length === 0 ? (
              <p className="rounded-3xl glass p-10 text-center text-sm text-muted-foreground">
                No bookings yet.
              </p>
            ) : (
              bookings.map((b) => (
                <article key={b.id} className="flex flex-col gap-4 rounded-3xl glass p-5 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <p className="font-display text-base font-semibold">
                      {b.reference} · {b.vehicles ? `${b.vehicles.brand} ${b.vehicles.name}` : "Vehicle"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {b.customer_name ?? "—"} · {b.customer_email ?? "—"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(b.pickup_at).toLocaleString("en-IN")} →{" "}
                      {new Date(b.dropoff_at).toLocaleString("en-IN")} · {b.pickup_city}
                    </p>
                  </div>
                  <p className="font-display text-lg font-bold">{inr(Number(b.total_amount))}</p>
                  <select
                    value={b.status}
                    onChange={(e) => setStatus(b.id, e.target.value)}
                    className="field rounded-xl px-4 py-2.5 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field w-full rounded-xl px-4 py-3 text-sm"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field w-full rounded-xl px-4 py-3 text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

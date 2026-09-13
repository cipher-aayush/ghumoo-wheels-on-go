import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { ADDONS, CITIES, inr, quote, vehicleImage, type Vehicle } from "@/lib/vehicles";

export const Route = createFileRoute("/_authenticated/book/$vehicleId")({
  head: () => ({
    meta: [
      { title: "Book your ride — GHUMOO" },
      {
        name: "description",
        content: "Pick your dates, add extras, confirm your details and pay for your GHUMOO self-drive trip.",
      },
      { property: "og:title", content: "Book your ride — GHUMOO" },
      { property: "og:description", content: "Four quick steps from dates to confirmation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookingFlow,
});

const STEPS = ["Dates", "Add-ons", "Details", "Payment"];

function defaultPickup() {
  const d = new Date(Date.now() + 3_600_000);
  d.setMinutes(0, 0, 0);
  return toLocalInput(d);
}
function defaultDropoff() {
  const d = new Date(Date.now() + 25 * 3_600_000);
  d.setMinutes(0, 0, 0);
  return toLocalInput(d);
}
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function BookingFlow() {
  const { vehicleId } = Route.useParams();
  const { user } = useSession();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [pickupAt, setPickupAt] = useState(defaultPickup);
  const [dropoffAt, setDropoffAt] = useState(defaultDropoff);
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [licenseFile, setLicenseFile] = useState<string | null>(null);
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState("");
  const [upi, setUpi] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .maybeSingle();
      if (err) throw err;
      return data as Vehicle | null;
    },
  });

  useEffect(() => {
    if (vehicle && !city) setCity(vehicle.city);
  }, [vehicle, city]);

  const priced = vehicle ? quote(vehicle, pickupAt, dropoffAt, addonIds) : null;

  function toggleAddon(id: string) {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function validate(current: number): string | null {
    if (current === 0) {
      if (!pickupAt || !dropoffAt) return "Choose both a pickup and a drop-off time.";
      if (new Date(dropoffAt) <= new Date(pickupAt)) return "Drop-off must be after pickup.";
      if (!city) return "Choose a pickup city.";
    }
    if (current === 2) {
      if (name.trim().length < 3) return "Enter the full name on your driving licence.";
      if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
      if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) return "Enter a 10-digit mobile number.";
      if (license.trim().length < 6) return "Enter your driving licence number.";
      if (!licenseFile) return "Upload a photo of your driving licence.";
    }
    if (current === 3) {
      if (method === "card" && card.replace(/\D/g, "").length < 16) return "Enter a 16-digit card number.";
      if (method === "upi" && !/^\S+@\S+$/.test(upi)) return "Enter a valid UPI ID like name@bank.";
    }
    return null;
  }

  function next() {
    const problem = validate(step);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep((s) => s + 1);
  }

  async function pay() {
    const problem = validate(3);
    if (problem) {
      setError(problem);
      return;
    }
    if (!vehicle || !priced || !user) return;
    setError(null);
    setSaving(true);
    const { data, error: err } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        vehicle_id: vehicle.id,
        pickup_at: new Date(pickupAt).toISOString(),
        dropoff_at: new Date(dropoffAt).toISOString(),
        pickup_city: city,
        pickup_location: location || null,
        addons: addonIds,
        addons_amount: priced.addons,
        base_amount: priced.base,
        taxes: priced.taxes,
        deposit: priced.deposit,
        total_amount: priced.total,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        license_number: license,
        payment_method: method,
        status: "confirmed",
      })
      .select("reference")
      .single();
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setReference(data.reference);
    setStep(4);
  }

  if (isLoading) {
    return (
      <SiteLayout>
        <p className="mx-auto max-w-7xl px-6 py-20 text-sm text-muted-foreground">Loading…</p>
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

  if (step === 4 && reference) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-2xl px-6 py-20 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl gradient-brand text-2xl font-bold text-primary-foreground">
            ✓
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight">Booking confirmed</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your {vehicle.brand} {vehicle.name} is reserved. A copy of these details is in your dashboard.
          </p>
          <div className="mt-8 rounded-3xl glass-strong p-6 text-left">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Booking ID</p>
            <p className="font-display text-2xl font-bold text-primary">{reference}</p>
            <dl className="mt-6 space-y-2 text-sm">
              <Row label="Pickup" value={new Date(pickupAt).toLocaleString("en-IN")} />
              <Row label="Drop-off" value={new Date(dropoffAt).toLocaleString("en-IN")} />
              <Row label="City" value={city} />
              <Row label="Paid with" value={method.toUpperCase()} />
              <Row label="Total paid" value={inr(priced!.total)} />
            </dl>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/dashboard"
              className="rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              View my bookings
            </Link>
            <Link to="/vehicles" className="rounded-xl bg-secondary px-6 py-3 text-sm font-semibold">
              Browse more
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <Link
          to="/vehicles/$vehicleId"
          params={{ vehicleId }}
          className="text-sm text-muted-foreground transition hover:text-primary"
        >
          ← Back to vehicle
        </Link>

        <ol className="mt-6 flex flex-wrap gap-3">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                i === step
                  ? "gradient-brand text-primary-foreground"
                  : i < step
                    ? "glass text-primary"
                    : "bg-secondary/40 text-muted-foreground"
              }`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl glass p-6">
            {step === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pickup date & time">
                  <input
                    type="datetime-local"
                    value={pickupAt}
                    onChange={(e) => setPickupAt(e.target.value)}
                    className="field w-full rounded-xl px-4 py-3 text-sm"
                  />
                </Field>
                <Field label="Drop-off date & time">
                  <input
                    type="datetime-local"
                    value={dropoffAt}
                    onChange={(e) => setDropoffAt(e.target.value)}
                    className="field w-full rounded-xl px-4 py-3 text-sm"
                  />
                </Field>
                <Field label="Pickup city">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="field w-full rounded-xl px-4 py-3 text-sm"
                  >
                    <option value="">Select a city</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Pickup point (optional)">
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Airport T2, Indiranagar hub…"
                    className="field w-full rounded-xl px-4 py-3 text-sm"
                  />
                </Field>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-3">
                {ADDONS.map((a) => {
                  const on = addonIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAddon(a.id)}
                      className={`flex items-center justify-between rounded-2xl px-5 py-4 text-left text-sm transition ${
                        on ? "glass-strong outline outline-1 outline-primary" : "bg-secondary/40"
                      }`}
                    >
                      <span className="font-medium">{a.label}</span>
                      <span className="text-muted-foreground">
                        {inr(a.price)} {on ? "· added" : ""}
                      </span>
                    </button>
                  );
                })}
                <p className="mt-2 text-xs text-muted-foreground">
                  Add-ons are charged once per booking, not per day.
                </p>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name (as on licence)">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field w-full rounded-xl px-4 py-3 text-sm"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field w-full rounded-xl px-4 py-3 text-sm"
                  />
                </Field>
                <Field label="Mobile number">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10 digits"
                    className="field w-full rounded-xl px-4 py-3 text-sm"
                  />
                </Field>
                <Field label="Driving licence number">
                  <input
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="field w-full rounded-xl px-4 py-3 text-sm"
                  />
                </Field>
                <Field label="Licence photo">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setLicenseFile(e.target.files?.[0]?.name ?? null)}
                    className="field w-full rounded-xl px-4 py-2.5 text-sm text-muted-foreground"
                  />
                  {licenseFile ? (
                    <p className="mt-2 text-xs text-primary">Attached: {licenseFile}</p>
                  ) : null}
                </Field>
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["card", "Card"],
                    ["upi", "UPI"],
                    ["wallet", "Wallet"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMethod(id)}
                      className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                        method === id ? "gradient-brand text-primary-foreground" : "bg-secondary/40"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {method === "card" ? (
                    <>
                      <Field label="Card number">
                        <input
                          value={card}
                          onChange={(e) => setCard(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="field w-full rounded-xl px-4 py-3 text-sm"
                        />
                      </Field>
                      <Field label="Expiry / CVV">
                        <input
                          placeholder="12/29 · 123"
                          className="field w-full rounded-xl px-4 py-3 text-sm"
                        />
                      </Field>
                    </>
                  ) : null}
                  {method === "upi" ? (
                    <Field label="UPI ID">
                      <input
                        value={upi}
                        onChange={(e) => setUpi(e.target.value)}
                        placeholder="yourname@bank"
                        className="field w-full rounded-xl px-4 py-3 text-sm"
                      />
                    </Field>
                  ) : null}
                  {method === "wallet" ? (
                    <p className="text-sm text-muted-foreground">
                      Your GHUMOO wallet balance covers this trip. Nothing else to enter.
                    </p>
                  ) : null}
                </div>

                <p className="mt-5 rounded-2xl bg-secondary/40 p-4 text-xs text-muted-foreground">
                  This is a demo checkout. No real payment is taken and no card details are stored.
                </p>
              </div>
            ) : null}

            {error ? (
              <p className="mt-5 rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</p>
            ) : null}

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => (step === 0 ? navigate({ to: "/vehicles" }) : setStep((s) => s - 1))}
                className="rounded-xl bg-secondary px-5 py-3 text-sm font-semibold transition hover:bg-secondary/70"
              >
                Back
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={next}
                  className="rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pay}
                  disabled={saving}
                  className="rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {saving ? "Processing…" : `Pay ${inr(priced?.total ?? 0)}`}
                </button>
              )}
            </div>
          </div>

          <aside className="h-fit rounded-3xl glass-strong p-6 lg:sticky lg:top-24">
            <img
              src={vehicleImage(vehicle.image_key)}
              alt={`${vehicle.brand} ${vehicle.name}`}
              width={400}
              height={300}
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
            <h2 className="mt-4 font-display text-xl font-bold">
              {vehicle.brand} {vehicle.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {vehicle.type} · {vehicle.transmission} · {vehicle.fuel} · {vehicle.seats} seats
            </p>
            {priced ? (
              <dl className="mt-5 space-y-2 text-sm">
                <Row
                  label={`Rental (${priced.days}d ${priced.restHours}h)`}
                  value={inr(priced.base)}
                />
                <Row label="Add-ons" value={inr(priced.addons)} />
                <Row label="GST (18%)" value={inr(priced.taxes)} />
                <Row label="Refundable deposit" value={inr(priced.deposit)} />
                <div className="flex justify-between border-t border-border pt-2 font-semibold">
                  <dt>Total</dt>
                  <dd>{inr(priced.total)}</dd>
                </div>
              </dl>
            ) : null}
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

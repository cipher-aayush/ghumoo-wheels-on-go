import { useRef, useState } from "react";
import { Download, Loader2, Ticket, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADDONS, PACKAGES, inr, vehiclePhotos, type Vehicle } from "@/lib/vehicles";
import type { Database } from "@/integrations/supabase/types";

export type TicketBooking = Database["public"]["Tables"]["bookings"]["Row"] & { vehicles: Vehicle | null };

const date = (value: string) => new Date(value).toLocaleString("en-IN", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
});

export function BookingTicket({ booking }: { booking: TicketBooking }) {
  const ticketRef = useRef<HTMLElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const vehicle = booking.vehicles;
  const ids = Array.isArray(booking.addons) ? booking.addons.filter((id): id is string => typeof id === "string") : [];
  const pkg = PACKAGES.find((p) => ids.includes(p.id));
  const extras = ADDONS.filter((a) => ids.includes(a.id)).map((a) => a.label);

  async function download() {
    const node = ticketRef.current;
    if (!node || downloading) return;
    setDownloading(true);
    setError("");
    try {
      await document.fonts.ready;
      await Promise.all(Array.from(node.querySelectorAll("img")).map(async (img) => {
        await img.decode();
      }));
      const [{ toJpeg }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
      const image = await toJpeg(node, { pixelRatio: 2, quality: 0.95, skipFonts: true, cacheBust: false });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const props = pdf.getImageProperties(image);
      const width = Math.min(190, 277 * props.width / props.height);
      const height = width * props.height / props.width;
      pdf.addImage(image, "JPEG", (210 - width) / 2, 10, width, height);
      pdf.setProperties({ title: `DriveEasy booking ${booking.reference}`, subject: "Self-drive booking ticket" });
      pdf.save(`DriveEasy-Ticket-${booking.reference.replace(/[^a-zA-Z0-9-]/g, "")}.pdf`);
    } catch {
      setError("The ticket could not be downloaded. Please check your connection and try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full text-left">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Ticket className="size-5 text-primary" /> Booking ticket</h2>
        <Button onClick={download} disabled={downloading}>
          {downloading ? <Loader2 className="animate-spin" /> : <Download />}
          {downloading ? "Preparing PDF…" : "Download PDF"}
        </Button>
      </div>
      {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
      <article ref={ticketRef} aria-label="DriveEasy booking ticket" className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-primary px-6 py-5 text-primary-foreground">
          <div><p className="font-display text-2xl font-bold">DriveEasy</p><p className="text-xs">SELF-DRIVE · BOOKING TICKET</p></div>
          <div className="text-right"><p className="text-xs uppercase">Booking reference</p><p className="break-all font-mono text-lg font-bold">{booking.reference}</p></div>
        </header>
        <div className="p-6">
          <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
            {vehicle && <img crossOrigin="anonymous" src={vehiclePhotos(vehicle)[0]} alt={`${vehicle.brand} ${vehicle.name}`} className="h-36 w-full rounded-md object-cover" />}
            <div className="min-w-0">
              <span className={`inline-block rounded-md px-3 py-1 text-xs font-semibold uppercase ${booking.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>{booking.status}</span>
              <h3 className="mt-3 break-words font-display text-2xl font-bold">{vehicle ? `${vehicle.brand} ${vehicle.name}` : "Booked vehicle"}</h3>
              {vehicle && <p className="mt-1 text-sm text-muted-foreground">{vehicle.type} · {vehicle.transmission} · {vehicle.fuel} · {vehicle.seats} seats</p>}
              <p className="mt-3 flex items-center gap-1 text-sm"><MapPin className="size-4 shrink-0 text-primary" />{booking.pickup_city}</p>
            </div>
          </div>
          <div className="my-6 grid gap-4 border-y border-dashed border-border py-5 sm:grid-cols-[1fr_auto_1fr]">
            <Detail label="Pickup · IST" value={date(booking.pickup_at)} />
            <ArrowRight className="hidden size-5 self-center text-primary sm:block" />
            <Detail label="Drop-off · IST" value={date(booking.dropoff_at)} />
          </div>
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <Detail label="Pickup point" value={booking.pickup_location || `${booking.pickup_city} · Not specified`} />
            <Detail label="Customer" value={booking.customer_name || "Not provided"} />
            <Detail label="Email" value={booking.customer_email || "Not provided"} />
            <Detail label="Mobile" value={booking.customer_phone || "Not provided"} />
            <Detail label="Driving licence" value={booking.license_number || "Not provided"} />
            <Detail label="Payment method" value={(booking.payment_method || "Not recorded").toUpperCase()} />
            <Detail label="Kilometre package" value={pkg?.label || "Not recorded"} />
            <Detail label="Extras" value={extras.join(", ") || "None"} />
          </div>
          <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
            <Price label="Rental" amount={booking.base_amount} />
            <Price label="Add-ons" amount={booking.addons_amount} />
            <Price label="GST" amount={booking.taxes} />
            <Price label="Refundable deposit" amount={booking.deposit} />
            <div className="flex items-center justify-between gap-4 pt-3 font-display text-xl font-bold"><dt className="whitespace-nowrap">Booking total</dt><dd className="whitespace-nowrap text-primary">{inr(Number(booking.total_amount))}</dd></div>
          </dl>
        </div>
        <footer className="border-t border-dashed border-border px-6 py-4 text-xs leading-relaxed text-muted-foreground">
          <p>Demo checkout · No real payment was collected. This is a booking ticket, not a tax invoice.</p>
          <p className="mt-1">Fuel not included · Return at the same fuel level. Bring your original driving licence at pickup.</p>
          <p className="mt-1">Issued {date(booking.created_at)} · Vehicle ID: {booking.vehicle_id}</p>
        </footer>
      </article>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-[11px] uppercase text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div>;
}

function Price({ label, amount }: { label: string; amount: number }) {
  return <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{label}</dt><dd>{inr(Number(amount))}</dd></div>;
}
import { Link } from "@tanstack/react-router";
import { inr, vehicleImage, vehiclePhotos, type Vehicle } from "@/lib/vehicles";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <article className="group overflow-hidden rounded-3xl glass-strong transition hover:bg-secondary/40">
      <div className="aspect-[4/3] w-full overflow-hidden bg-card">
        <img
          src={vehiclePhotos(vehicle)[0] ?? vehicleImage(vehicle.image_key)}
          alt={`${vehicle.brand} ${vehicle.name} available for self-drive rental`}
          loading="lazy"
          width={1024}
          height={768}
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-semibold">
            {vehicle.brand} {vehicle.name}
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
            <span className="text-primary">★</span> {Number(vehicle.rating).toFixed(1)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {vehicle.seats} seats · {vehicle.fuel} · {vehicle.transmission} · {vehicle.city}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <p className="font-display text-lg font-bold">
            {inr(Number(vehicle.price_per_hour))}
            <span className="text-xs font-normal text-muted-foreground">/hr</span>
          </p>
          <Link
            to="/vehicles/$vehicleId"
            params={{ vehicleId: vehicle.id }}
            className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold transition group-hover:gradient-brand group-hover:text-primary-foreground"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

import hatchback from "@/assets/vehicle-hatchback.jpg";
import sedan from "@/assets/vehicle-sedan.jpg";
import suv from "@/assets/vehicle-suv.jpg";
import ev from "@/assets/vehicle-ev.jpg";
import bike from "@/assets/vehicle-bike.jpg";

export type Vehicle = {
  id: string;
  name: string;
  brand: string;
  type: string;
  city: string;
  transmission: string;
  fuel: string;
  seats: number;
  mileage: string | null;
  luggage: string | null;
  price_per_hour: number;
  price_per_day: number;
  security_deposit: number;
  rating: number;
  trips: number;
  description: string | null;
  image_key: string;
  images?: string[] | null;
  available: boolean;
};

const IMAGES: Record<string, string> = { hatchback, sedan, suv, ev, bike };

export function vehicleImage(key: string): string {
  return IMAGES[key] ?? hatchback;
}

export function vehiclePhotos(v: Pick<Vehicle, "image_key" | "images">): string[] {
  const own = (v.images ?? []).filter(Boolean);
  return own.length ? own : [vehicleImage(v.image_key)];
}

export const IMAGE_KEYS = Object.keys(IMAGES);

export const CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kochi",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Indore",
  "Goa",
];

export const VEHICLE_TYPES = ["Hatchback", "Sedan", "SUV", "Scooty", "Bike"];
export const FUELS = ["Petrol", "Diesel", "Electric"];
export const TRANSMISSIONS = ["Manual", "Automatic"];

export const ADDONS = [
  { id: "gps", label: "GPS navigation", price: 149 },
  { id: "child-seat", label: "Child seat", price: 249 },
  { id: "extra-driver", label: "Extra driver", price: 399 },
  { id: "insurance", label: "Zero-depreciation cover", price: 499 },
];

export function inr(value: number): string {
  return "₹" + Math.round(value).toLocaleString("en-IN");
}

export function hoursBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.ceil(ms / 3_600_000));
}

export const PACKAGES = [
  { id: "pkg-140", label: "140 km / day", note: "Best for city trips", multiplier: 1, kmPerDay: 140, extraKm: 9 },
  { id: "pkg-300", label: "300 km / day", note: "Weekend getaways", multiplier: 1.25, kmPerDay: 300, extraKm: 8 },
  { id: "pkg-unlimited", label: "Unlimited km", note: "Long highway drives", multiplier: 1.5, kmPerDay: null, extraKm: 0 },
] as const;

export const RENTAL_POLICIES = [
  { title: "Fuel not included", body: "Get it with a fuel level, return it at the same level. Shortfall billed at pump price + ₹50." },
  { title: "Free cancellation", body: "Full refund up to 24 hours before pickup. 50% refund within 24 hours." },
  { title: "Deposit back in 3–5 days", body: "Refundable deposit returns to your original payment method after inspection." },
  { title: "Late return", body: "30-minute grace period, then hourly rate × 1.5 for every late hour." },
  { title: "Documents at pickup", body: "Original driving licence + Aadhaar. Licence must be at least 1 year old." },
  { title: "FASTag & tolls", body: "Cars come with FASTag. Tolls used are added to your final bill." },
];

export function quote(vehicle: Vehicle, from: string, to: string, addonIds: string[], packageId = "pkg-140") {
  const hours = hoursBetween(from, to);
  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  const pkg = PACKAGES.find((p) => p.id === packageId) ?? PACKAGES[0];
  const raw = days * Number(vehicle.price_per_day) + restHours * Number(vehicle.price_per_hour);
  const base = Math.round(raw * pkg.multiplier);
  const kmLimit = pkg.kmPerDay ? Math.ceil((pkg.kmPerDay * hours) / 24) : null;
  const addons = ADDONS.filter((a) => addonIds.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const taxes = Math.round((base + addons) * 0.18);
  const deposit = Number(vehicle.security_deposit);
  return { hours, days, restHours, base, addons, taxes, deposit, pkg, kmLimit, total: base + addons + taxes + deposit };
}

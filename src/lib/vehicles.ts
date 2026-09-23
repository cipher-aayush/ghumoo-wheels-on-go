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

export const VEHICLE_TYPES = ["Hatchback", "Sedan", "SUV", "Bike"];
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

export function quote(vehicle: Vehicle, from: string, to: string, addonIds: string[]) {
  const hours = hoursBetween(from, to);
  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  const base = days * Number(vehicle.price_per_day) + restHours * Number(vehicle.price_per_hour);
  const addons = ADDONS.filter((a) => addonIds.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const taxes = Math.round((base + addons) * 0.18);
  const deposit = Number(vehicle.security_deposit);
  return { hours, days, restHours, base, addons, taxes, deposit, total: base + addons + taxes + deposit };
}

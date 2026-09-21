import { supabase } from "@/integrations/supabase/client";

export type BookedRange = { pickup_at: string; dropoff_at: string };

export async function fetchBookedRanges(vehicleId: string): Promise<BookedRange[]> {
  const { data, error } = await supabase.rpc("vehicle_booked_ranges", { _vehicle_id: vehicleId });
  if (error) throw error;
  return (data ?? []) as BookedRange[];
}

export function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Every calendar day touched by an existing confirmed/ongoing booking. */
export function bookedDays(ranges: BookedRange[]): Set<string> {
  const days = new Set<string>();
  for (const r of ranges) {
    const start = new Date(r.pickup_at);
    const end = new Date(r.dropoff_at);
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    while (cursor.getTime() <= end.getTime()) {
      days.add(dayKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return days;
}

export function overlapsBooking(from: string, to: string, ranges: BookedRange[]): boolean {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return ranges.some((r) => {
    const s = new Date(r.pickup_at).getTime();
    const e = new Date(r.dropoff_at).getTime();
    return a < e && b > s;
  });
}

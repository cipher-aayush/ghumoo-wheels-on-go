import { useMemo, useState } from "react";
import { bookedDays, dayKey, type BookedRange } from "@/lib/availability";

type Props = {
  ranges: BookedRange[];
  /** ISO day strings (yyyy-mm-dd) of the currently chosen trip, for highlighting. */
  selectedFrom?: string | undefined;
  selectedTo?: string | undefined;
  onPickDay?: ((day: string) => void) | undefined;
  loading?: boolean | undefined;
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function AvailabilityCalendar({ ranges, selectedFrom, selectedTo, onPickDay, loading }: Props) {
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const busy = useMemo(() => bookedDays(ranges), [ranges]);

  const view = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const leading = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
  const todayKey = dayKey(today);

  const cells: (Date | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1)),
  ];

  return (
    <div className="rounded-3xl glass p-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
          disabled={monthOffset === 0}
          className="rounded-lg bg-secondary/60 px-3 py-1.5 text-sm transition hover:bg-secondary disabled:opacity-40"
          aria-label="Previous month"
        >
          ←
        </button>
        <p className="font-display text-base font-semibold">
          {view.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => setMonthOffset((m) => Math.min(5, m + 1))}
          className="rounded-lg bg-secondary/60 px-3 py-1.5 text-sm transition hover:bg-secondary"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] uppercase text-muted-foreground">
        {WEEKDAYS.map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`pad-${i}`} />;
          const key = dayKey(d);
          const past = key < todayKey;
          const taken = busy.has(key);
          const inTrip =
            !!selectedFrom && !!selectedTo && key >= selectedFrom && key <= selectedTo;
          const disabled = past || taken;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled || !onPickDay}
              onClick={() => onPickDay?.(key)}
              title={taken ? "Already booked" : past ? "Past date" : "Available"}
              className={`rounded-xl py-2 text-xs transition ${
                taken
                  ? "bg-destructive/15 text-destructive line-through"
                  : past
                    ? "text-muted-foreground/40"
                    : inTrip
                      ? "gradient-brand font-semibold text-primary-foreground"
                      : "bg-secondary/40 hover:bg-secondary"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-secondary" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive/60" /> Booked
        </span>
        {loading ? <span>Checking live bookings…</span> : null}
      </div>
    </div>
  );
}

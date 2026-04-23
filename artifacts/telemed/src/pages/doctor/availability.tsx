import { useEffect, useState } from "react";
import {
  useGetMyAvailability,
  useUpdateMyAvailability,
  getGetMyAvailabilityQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

type Day = {
  weekday: number;
  enabled: boolean;
  startHour: number;
  endHour: number;
};

function hourLabel(h: number) {
  const hh = ((h + 11) % 12) + 1;
  const suffix = h < 12 || h === 24 ? (h === 24 ? "AM" : "AM") : "PM";
  const real = h === 24 ? 12 : hh;
  return `${real}:00 ${h < 12 ? "AM" : "PM"}`.replace("12:00 AM", "12:00 AM");
}

const START_HOURS = Array.from({ length: 24 }, (_, i) => i);
const END_HOURS = Array.from({ length: 24 }, (_, i) => i + 1);

export default function DoctorAvailability() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data, isLoading } = useGetMyAvailability({
    query: { queryKey: getGetMyAvailabilityQueryKey() },
  });
  const update = useUpdateMyAvailability();
  const [days, setDays] = useState<Day[]>([]);

  useEffect(() => {
    if (data?.days) {
      const byDay = new Map(data.days.map((d) => [d.weekday, d]));
      const full: Day[] = Array.from({ length: 7 }, (_, i) => {
        const d = byDay.get(i);
        return d
          ? {
              weekday: i,
              enabled: d.enabled,
              startHour: d.startHour,
              endHour: d.endHour,
            }
          : { weekday: i, enabled: false, startHour: 9, endHour: 17 };
      });
      setDays(full);
    }
  }, [data]);

  function updateDay(weekday: number, patch: Partial<Day>) {
    setDays((prev) =>
      prev.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)),
    );
  }

  async function save() {
    for (const d of days) {
      if (d.enabled && d.startHour >= d.endHour) {
        toast.error(t("avail.invalid"));
        return;
      }
    }
    try {
      await update.mutateAsync({ data: { days } });
      await qc.invalidateQueries({ queryKey: getGetMyAvailabilityQueryKey() });
      toast.success(t("avail.saved"));
    } catch {
      toast.error(t("common.error"));
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        …
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("avail.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("avail.sub")}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {days.map((d) => (
          <div
            key={d.weekday}
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4"
          >
            <div className="flex items-center gap-3 sm:w-48">
              <Switch
                checked={d.enabled}
                onCheckedChange={(v) => updateDay(d.weekday, { enabled: v })}
                aria-label={t("avail.enabled")}
              />
              <span className="font-medium">
                {t(`avail.day.${d.weekday}` as never)}
              </span>
            </div>
            <div
              className={`flex flex-wrap items-center gap-3 ${
                d.enabled ? "" : "opacity-50 pointer-events-none"
              }`}
            >
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                {t("avail.from")}
                <select
                  className="bg-background border border-border rounded-md px-2 py-1 text-foreground"
                  value={d.startHour}
                  onChange={(e) =>
                    updateDay(d.weekday, {
                      startHour: parseInt(e.target.value, 10),
                    })
                  }
                >
                  {START_HOURS.map((h) => (
                    <option key={h} value={h}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                {t("avail.to")}
                <select
                  className="bg-background border border-border rounded-md px-2 py-1 text-foreground"
                  value={d.endHour}
                  onChange={(e) =>
                    updateDay(d.weekday, {
                      endHour: parseInt(e.target.value, 10),
                    })
                  }
                >
                  {END_HOURS.map((h) => (
                    <option key={h} value={h}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={update.isPending} size="lg">
          {t("avail.save")}
        </Button>
      </div>
    </div>
  );
}

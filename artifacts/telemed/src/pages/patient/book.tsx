import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListDoctors,
  useListDoctorSlots,
  useCreateAppointment,
  getListAppointmentsQueryKey,
  getGetAppointmentSummaryQueryKey,
  getListDoctorSlotsQueryKey,
  type Doctor,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import { format, isSameDay } from "date-fns";
import { Stethoscope, ChevronLeft } from "lucide-react";

export default function BookAppointment() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { data: doctors = [], isLoading } = useListDoctors();
  const [selected, setSelected] = useState<Doctor | null>(null);

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  if (selected) {
    return (
      <SlotPicker
        doctor={selected}
        onBack={() => setSelected(null)}
        onBooked={() => setLocation("/patient/appointments")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("patient.book.title")}
      </h1>
      {doctors.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          {t("patient.book.none")}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {doctors.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className="text-left rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Dr. {d.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {d.specialty}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SlotPicker({
  doctor,
  onBack,
  onBooked,
}: {
  doctor: Doctor;
  onBack: () => void;
  onBooked: () => void;
}) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data: slots = [], isLoading } = useListDoctorSlots(doctor.id);
  const [picked, setPicked] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const create = useCreateAppointment();

  const byDay = new Map<string, typeof slots>();
  for (const s of slots) {
    const key = format(new Date(s.startsAt), "yyyy-MM-dd");
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(s);
  }
  const days = Array.from(byDay.entries()).slice(0, 7);

  async function submit() {
    if (!picked || !reason.trim()) {
      toast.error(t("patient.book.fillAll"));
      return;
    }
    try {
      await create.mutateAsync({
        data: {
          doctorId: doctor.id,
          startsAt: picked.toISOString(),
          reason: reason.trim(),
        },
      });
      await Promise.all([
        qc.invalidateQueries({ queryKey: getListAppointmentsQueryKey() }),
        qc.invalidateQueries({
          queryKey: getGetAppointmentSummaryQueryKey(),
        }),
        qc.invalidateQueries({
          queryKey: getListDoctorSlotsQueryKey(doctor.id),
        }),
      ]);
      toast.success(t("patient.book.booked"));
      onBooked();
    } catch (err) {
      toast.error(t("common.error"));
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground min-h-0"
      >
        <ChevronLeft className="w-4 h-4" />
        {t("common.back")}
      </button>
      <div>
        <h1 className="text-2xl font-semibold">Dr. {doctor.name}</h1>
        <p className="text-muted-foreground">{doctor.specialty}</p>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <Label className="text-base">{t("patient.book.pickSlot")}</Label>
          <div className="space-y-3">
            {days.map(([day, daySlots]) => (
              <div key={day} className="rounded-2xl border border-border bg-card p-4">
                <div className="font-medium mb-3">
                  {format(new Date(day), "EEEE, MMM d")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((s) => {
                    const start = new Date(s.startsAt);
                    const isPicked =
                      picked && isSameDay(start, picked) && start.getTime() === picked.getTime();
                    return (
                      <button
                        key={s.startsAt.toString()}
                        disabled={!s.available}
                        onClick={() => setPicked(start)}
                        className={`px-3 py-2 rounded-full border text-sm min-h-0 ${
                          !s.available
                            ? "border-border bg-muted text-muted-foreground line-through"
                            : isPicked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:border-primary/50"
                        }`}
                      >
                        {format(start, "h:mm a")}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-3">
            <Label htmlFor="reason" className="text-base">
              {t("patient.book.reason")}
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder={t("patient.book.reasonPh")}
            />
          </div>
          <Button
            size="lg"
            className="w-full text-base py-6"
            onClick={submit}
            disabled={!picked || !reason.trim() || create.isPending}
          >
            {create.isPending ? t("common.loading") : t("patient.book.submit")}
          </Button>
        </div>
      )}
    </div>
  );
}

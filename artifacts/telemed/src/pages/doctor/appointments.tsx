import {
  useListAppointments,
  useUpdateAppointmentStatus,
  getListAppointmentsQueryKey,
  getGetAppointmentSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../patient/dashboard";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";

export default function DoctorAppointments() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data: appointments = [] } = useListAppointments();
  const update = useUpdateAppointmentStatus();

  async function act(
    id: string,
    status: "accepted" | "rejected" | "completed",
  ) {
    try {
      await update.mutateAsync({ appointmentId: id, data: { status } });
      await Promise.all([
        qc.invalidateQueries({ queryKey: getListAppointmentsQueryKey() }),
        qc.invalidateQueries({
          queryKey: getGetAppointmentSummaryQueryKey(),
        }),
      ]);
      toast.success(t("doc.updated"));
    } catch {
      toast.error(t("common.error"));
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("nav.appointments")}
      </h1>
      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          {t("doc.noAppointments")}
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{a.patientName}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(a.startsAt), "EEE, MMM d · h:mm a")}
                  </div>
                  <div className="text-sm mt-1 text-foreground/80">
                    {a.reason}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/chat/${a.patientId}`}>
                  <Button size="sm" variant="outline">
                    {t("doc.chat")}
                  </Button>
                </Link>
                <Link href={`/doctor/patients/${a.patientId}/records`}>
                  <Button size="sm" variant="outline">
                    {t("doc.records")}
                  </Button>
                </Link>
                {a.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => act(a.id, "accepted")}>
                      {t("doc.accept")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => act(a.id, "rejected")}
                    >
                      {t("doc.reject")}
                    </Button>
                  </>
                )}
                {a.status === "accepted" && (
                  <Button size="sm" onClick={() => act(a.id, "completed")}>
                    {t("doc.complete")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

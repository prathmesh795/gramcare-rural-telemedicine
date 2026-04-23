import {
  useGetAppointmentSummary,
  useListAppointments,
  useListActiveEmergencies,
  useResolveEmergency,
  useUpdateAppointmentStatus,
  getListAppointmentsQueryKey,
  getGetAppointmentSummaryQueryKey,
  getListActiveEmergenciesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../patient/dashboard";
import { Siren, Check, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data: summary } = useGetAppointmentSummary();
  const { data: appointments = [] } = useListAppointments();
  const { data: emergencies = [] } = useListActiveEmergencies({
    query: {
      refetchInterval: 10_000,
      queryKey: getListActiveEmergenciesQueryKey(),
    },
  });
  const update = useUpdateAppointmentStatus();
  const resolve = useResolveEmergency();

  const pending = appointments.filter((a) => a.status === "pending");
  const now = new Date();
  const todays = appointments.filter(
    (a) =>
      a.status === "accepted" &&
      new Date(a.startsAt).toDateString() === now.toDateString(),
  );

  async function act(id: string, status: "accepted" | "rejected") {
    try {
      await update.mutateAsync({ appointmentId: id, data: { status } });
      await Promise.all([
        qc.invalidateQueries({ queryKey: getListAppointmentsQueryKey() }),
        qc.invalidateQueries({
          queryKey: getGetAppointmentSummaryQueryKey(),
        }),
      ]);
      toast.success(status === "accepted" ? t("doc.accepted") : t("doc.rejected"));
    } catch {
      toast.error(t("common.error"));
    }
  }

  async function doResolve(id: string) {
    try {
      await resolve.mutateAsync({ emergencyId: id });
      await qc.invalidateQueries({
        queryKey: getListActiveEmergenciesQueryKey(),
      });
      toast.success(t("doc.emerResolved"));
    } catch {
      toast.error(t("common.error"));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("doc.dash.welcome")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("doc.dash.sub")}</p>
      </div>

      {emergencies.length > 0 && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
          <div className="flex items-center gap-2 text-destructive font-semibold mb-3">
            <Siren className="w-5 h-5" />
            {t("doc.activeEmer")} ({emergencies.length})
          </div>
          <div className="space-y-2">
            {emergencies.map((e) => (
              <div
                key={e.id}
                className="rounded-xl bg-background border border-border p-4 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="font-medium">{e.patientName}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.village ? `${e.village} · ` : ""}
                    {formatDistanceToNow(new Date(e.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                  {e.note && (
                    <div className="text-sm mt-1 text-foreground/80">
                      {e.note}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/chat/${e.patientId}`}>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {t("doc.chat")}
                    </Button>
                  </Link>
                  <Button size="sm" onClick={() => doResolve(e.id)}>
                    {t("doc.resolve")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label={t("summary.upcoming")} value={summary?.upcoming ?? 0} />
        <Stat label={t("summary.pending")} value={summary?.pending ?? 0} />
        <Stat label={t("summary.completed")} value={summary?.completed ?? 0} />
        <Stat label={t("summary.total")} value={summary?.total ?? 0} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">{t("doc.dash.pending")}</h2>
        {pending.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            {t("doc.dash.noPending")}
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="font-medium">{a.patientName}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(a.startsAt), "EEE, MMM d · h:mm a")}
                  </div>
                  <div className="text-sm mt-1 text-foreground/80">
                    {a.reason}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => act(a.id, "rejected")}
                  >
                    <X className="w-4 h-4 mr-1" />
                    {t("doc.reject")}
                  </Button>
                  <Button size="sm" onClick={() => act(a.id, "accepted")}>
                    <Check className="w-4 h-4 mr-1" />
                    {t("doc.accept")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">{t("doc.dash.today")}</h2>
        {todays.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            {t("doc.dash.noToday")}
          </div>
        ) : (
          <div className="space-y-2">
            {todays.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium">{a.patientName}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(a.startsAt), "h:mm a")} · {a.reason}
                  </div>
                </div>
                <div className="flex gap-2">
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
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-5">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

import { Link } from "wouter";
import {
  useGetAppointmentSummary,
  useListAppointments,
} from "@workspace/api-client-react";
import { Calendar, FileText, MessageCircle, Siren, Stethoscope, PlusCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";

export default function PatientDashboard() {
  const { t } = useTranslation();
  const { data: summary } = useGetAppointmentSummary();
  const { data: appointments = [] } = useListAppointments();

  const upcoming = appointments
    .filter(
      (a) =>
        a.status !== "rejected" &&
        a.status !== "cancelled" &&
        new Date(a.startsAt).getTime() > Date.now(),
    )
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("patient.dash.welcome")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("patient.dash.sub")}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label={t("summary.upcoming")}
          value={summary?.upcoming ?? 0}
        />
        <Stat label={t("summary.pending")} value={summary?.pending ?? 0} />
        <Stat label={t("summary.completed")} value={summary?.completed ?? 0} />
        <Stat label={t("summary.total")} value={summary?.total ?? 0} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <QuickAction
          to="/patient/book"
          icon={<PlusCircle className="w-5 h-5" />}
          title={t("patient.dash.book")}
          desc={t("patient.dash.bookSub")}
        />
        <QuickAction
          to="/patient/symptoms"
          icon={<Stethoscope className="w-5 h-5" />}
          title={t("patient.dash.symp")}
          desc={t("patient.dash.sympSub")}
        />
        <QuickAction
          to="/patient/documents"
          icon={<FileText className="w-5 h-5" />}
          title={t("patient.dash.docs")}
          desc={t("patient.dash.docsSub")}
        />
        <QuickAction
          to="/chat"
          icon={<MessageCircle className="w-5 h-5" />}
          title={t("nav.chat")}
          desc={t("patient.dash.chatSub")}
        />
        <QuickAction
          to="/patient/appointments"
          icon={<Calendar className="w-5 h-5" />}
          title={t("nav.appointments")}
          desc={t("patient.dash.appointmentsSub")}
        />
        <QuickAction
          to="/patient/emergency"
          icon={<Siren className="w-5 h-5" />}
          title={t("patient.dash.emer")}
          desc={t("patient.dash.emerSub")}
          destructive
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">
          {t("patient.dash.upcoming")}
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            {t("patient.dash.noUpcoming")}
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-border bg-card p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    Dr. {a.doctorName}
                    {a.doctorSpecialty ? (
                      <span className="text-muted-foreground font-normal">
                        {" · "}
                        {a.doctorSpecialty}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(a.startsAt), "EEE, MMM d · h:mm a")}
                  </div>
                </div>
                <StatusBadge status={a.status} />
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

function QuickAction({
  to,
  icon,
  title,
  desc,
  destructive,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  destructive?: boolean;
}) {
  return (
    <Link
      href={to}
      className={`block rounded-2xl border p-5 transition hover:border-primary/50 ${
        destructive
          ? "border-destructive/30 bg-destructive/5 hover:border-destructive"
          : "border-border bg-card"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg inline-flex items-center justify-center ${
          destructive
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="text-sm text-muted-foreground mt-1 leading-snug">{desc}</p>
    </Link>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900 border-amber-200",
    accepted: "bg-emerald-100 text-emerald-900 border-emerald-200",
    rejected: "bg-rose-100 text-rose-900 border-rose-200",
    completed: "bg-sky-100 text-sky-900 border-sky-200",
    cancelled: "bg-stone-100 text-stone-700 border-stone-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium capitalize ${
        colors[status] || colors.pending
      }`}
    >
      {status}
    </span>
  );
}

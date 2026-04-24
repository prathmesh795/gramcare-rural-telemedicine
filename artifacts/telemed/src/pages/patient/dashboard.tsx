import { Link } from "wouter";
import {
  useGetAppointmentSummary,
  useListAppointments,
} from "@workspace/api-client-react";
import {
  Calendar,
  FileText,
  MessageCircle,
  Siren,
  Stethoscope,
  PlusCircle,
  Clock,
  CheckCircle2,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";
import { DashboardSkeleton } from "@/components/layout/dashboard-skeleton";

export default function PatientDashboard() {
  const { t } = useTranslation();
  const { data: summary, isLoading: loadingSummary } = useGetAppointmentSummary();
  const { data: appointments = [], isLoading: loadingAppts } = useListAppointments();

  if (loadingSummary || loadingAppts) {
    return <DashboardSkeleton />;
  }

  const upcoming = appointments
    .filter(
      (a) =>
        a.status !== "rejected" &&
        a.status !== "cancelled" &&
        new Date(a.startsAt).getTime() > Date.now(),
    )
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 text-white p-7 md:p-9 shadow-xl shadow-primary/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-24 bottom-0 w-72 h-72 rounded-full bg-secondary/30 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Patient dashboard
          </span>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
            {t("patient.dash.welcome")}
          </h1>
          <p className="text-white/85 mt-2 max-w-xl leading-relaxed">
            {t("patient.dash.sub")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/patient/book"
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-white text-primary font-semibold text-sm shadow-sm hover:shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              {t("patient.dash.book")}
            </Link>
            <Link
              href="/patient/symptoms"
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-white/15 backdrop-blur text-white font-semibold text-sm border border-white/20 hover:bg-white/25 transition"
            >
              <Stethoscope className="w-4 h-4" />
              {t("patient.dash.symp")}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label={t("summary.upcoming")}
          value={summary?.upcoming ?? 0}
          icon={<Calendar className="w-4 h-4" />}
          tone="blue"
        />
        <Stat
          label={t("summary.pending")}
          value={summary?.pending ?? 0}
          icon={<Clock className="w-4 h-4" />}
          tone="amber"
        />
        <Stat
          label={t("summary.completed")}
          value={summary?.completed ?? 0}
          icon={<CheckCircle2 className="w-4 h-4" />}
          tone="emerald"
        />
        <Stat
          label={t("summary.total")}
          value={summary?.total ?? 0}
          icon={<Activity className="w-4 h-4" />}
          tone="violet"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-foreground/80">
          Quick actions
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <QuickAction
            to="/patient/book"
            icon={<PlusCircle className="w-5 h-5" />}
            title={t("patient.dash.book")}
            desc={t("patient.dash.bookSub")}
            tone="blue"
          />
          <QuickAction
            to="/patient/symptoms"
            icon={<Stethoscope className="w-5 h-5" />}
            title={t("patient.dash.symp")}
            desc={t("patient.dash.sympSub")}
            tone="emerald"
          />
          <QuickAction
            to="/patient/documents"
            icon={<FileText className="w-5 h-5" />}
            title={t("patient.dash.docs")}
            desc={t("patient.dash.docsSub")}
            tone="violet"
          />
          <QuickAction
            to="/chat"
            icon={<MessageCircle className="w-5 h-5" />}
            title={t("nav.chat")}
            desc={t("patient.dash.chatSub")}
            tone="sky"
          />
          <QuickAction
            to="/patient/appointments"
            icon={<Calendar className="w-5 h-5" />}
            title={t("nav.appointments")}
            desc={t("patient.dash.appointmentsSub")}
            tone="amber"
          />
          <QuickAction
            to="/patient/emergency"
            icon={<Siren className="w-5 h-5" />}
            title={t("patient.dash.emer")}
            desc={t("patient.dash.emerSub")}
            destructive
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground/80">
            {t("patient.dash.upcoming")}
          </h2>
          <Link
            href="/patient/appointments"
            className="text-sm text-primary font-medium hover:underline inline-flex items-center"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 inline-flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="mt-3 text-muted-foreground">
              {t("patient.dash.noUpcoming")}
            </p>
            <Link
              href="/patient/book"
              className="mt-4 inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
            >
              <PlusCircle className="w-4 h-4" />
              {t("patient.dash.book")}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((a) => (
              <Link
                key={a.id}
                href="/patient/appointments"
                className="group rounded-2xl border border-border bg-white p-4 flex items-center gap-4 hover:shadow-md hover:border-primary/40 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary inline-flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-semibold uppercase leading-none">
                    {format(new Date(a.startsAt), "MMM")}
                  </span>
                  <span className="text-base font-bold leading-none mt-0.5">
                    {format(new Date(a.startsAt), "d")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">
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
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const STAT_TONES: Record<string, { bg: string; text: string; bar: string }> = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    bar: "from-blue-500 to-blue-400",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    bar: "from-amber-500 to-amber-400",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    bar: "from-emerald-500 to-emerald-400",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    bar: "from-violet-500 to-violet-400",
  },
  sky: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    bar: "from-sky-500 to-sky-400",
  },
};

function Stat({
  label,
  value,
  icon,
  tone = "blue",
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  tone?: keyof typeof STAT_TONES;
}) {
  const c = STAT_TONES[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-white px-4 py-4 shadow-sm hover:shadow-md transition">
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.bar}`}
      />
      <div className="flex items-center justify-between">
        <div
          className={`w-9 h-9 rounded-xl inline-flex items-center justify-center ${c.bg} ${c.text}`}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold mt-3 tracking-tight">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wide font-medium">
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
  tone = "blue",
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  destructive?: boolean;
  tone?: keyof typeof STAT_TONES;
}) {
  if (destructive) {
    return (
      <Link
        href={to}
        className="group relative overflow-hidden block rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100/40 p-5 hover:shadow-lg hover:border-rose-300 transition"
      >
        <div className="w-11 h-11 rounded-xl inline-flex items-center justify-center bg-rose-500 text-white shadow-md shadow-rose-500/30 group-hover:scale-105 transition">
          {icon}
        </div>
        <div className="mt-4 font-semibold text-rose-900">{title}</div>
        <p className="text-sm text-rose-800/70 mt-1 leading-snug">{desc}</p>
        <ChevronRight className="absolute top-5 right-5 w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition" />
      </Link>
    );
  }
  const c = STAT_TONES[tone];
  return (
    <Link
      href={to}
      className="group relative block rounded-2xl border border-border bg-white p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition"
    >
      <div
        className={`w-11 h-11 rounded-xl inline-flex items-center justify-center ${c.bg} ${c.text} group-hover:scale-105 transition`}
      >
        {icon}
      </div>
      <div className="mt-4 font-semibold">{title}</div>
      <p className="text-sm text-muted-foreground mt-1 leading-snug">{desc}</p>
      <ChevronRight className="absolute top-5 right-5 w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition" />
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

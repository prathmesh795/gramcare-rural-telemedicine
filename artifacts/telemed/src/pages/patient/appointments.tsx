import {
  useListAppointments,
  type Appointment,
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { StatusBadge } from "./dashboard";
import { Calendar } from "lucide-react";

export default function PatientAppointments() {
  const { t } = useTranslation();
  const { data: appointments = [] } = useListAppointments();
  const now = Date.now();
  const upcoming = appointments.filter(
    (a) =>
      new Date(a.startsAt).getTime() > now &&
      a.status !== "cancelled" &&
      a.status !== "rejected",
  );
  const past = appointments.filter(
    (a) =>
      new Date(a.startsAt).getTime() <= now ||
      a.status === "cancelled" ||
      a.status === "rejected",
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("nav.appointments")}
        </h1>
      </div>
      <Section title={t("appointments.upcoming")} list={upcoming} />
      <Section title={t("appointments.past")} list={past} />
    </div>
  );
}

function Section({
  title,
  list,
}: {
  title: string;
  list: Appointment[];
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground text-sm">
          <Calendar className="w-5 h-5 mx-auto mb-2 opacity-60" />
          None
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
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
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {format(new Date(a.startsAt), "EEE, MMM d · h:mm a")}
                  </div>
                  {a.reason && (
                    <div className="text-sm mt-2 text-foreground/80">
                      {a.reason}
                    </div>
                  )}
                </div>
                <StatusBadge status={a.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Link, useLocation } from "wouter";
import {
  useGetMyProfile,
  getGetMyProfileQueryKey,
} from "@workspace/api-client-react";
import { useDemo } from "@/lib/demo";
import { useTranslation } from "@/lib/i18n";
import {
  Home,
  Calendar,
  MessageCircle,
  User,
  type LucideIcon,
  Stethoscope,
  CalendarClock,
} from "lucide-react";

type Item = { to: string; label: string; icon: LucideIcon };

export function BottomNav() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const demo = useDemo();
  const { data: profile } = useGetMyProfile({
    query: { enabled: true, queryKey: getGetMyProfileQueryKey() },
  });

  const role = demo.active ? demo.role : profile?.role;

  let items: Item[] | null = null;
  if (role === "patient") {
    items = [
      { to: "/patient", label: t("nav.dashboard"), icon: Home },
      { to: "/patient/appointments", label: t("nav.appointments"), icon: Calendar },
      { to: "/chat", label: t("nav.chat"), icon: MessageCircle },
      { to: "/patient/documents", label: "Profile", icon: User },
    ];
  } else if (role === "doctor") {
    items = [
      { to: "/doctor", label: t("nav.dashboard"), icon: Home },
      { to: "/doctor/appointments", label: t("nav.appointments"), icon: Calendar },
      { to: "/doctor/availability", label: t("nav.availability"), icon: CalendarClock },
      { to: "/chat", label: t("nav.chat"), icon: MessageCircle },
    ];
  }

  if (!items) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-4">
        {items.map((it) => {
          const active =
            location === it.to || location.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                href={it.to}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
                  active
                    ? "text-primary"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="truncate max-w-[80px]">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {/* Decorative spacer when no items match — keeps types happy */}
      <Stethoscope className="hidden" />
    </nav>
  );
}

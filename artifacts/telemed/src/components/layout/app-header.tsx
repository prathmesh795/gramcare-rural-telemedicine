import { Link, useLocation } from "wouter";
import { Show, useClerk, useUser } from "@clerk/react";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "./brand-logo";
import { LangToggle } from "./lang-toggle";
import { NotificationBell } from "./notification-bell";
import { useTranslation } from "@/lib/i18n";
import {
  useGetMyProfile,
  getGetMyProfileQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function NavLink({
  to,
  label,
  active,
  onClick,
}: {
  to: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        active ? "text-primary" : "text-foreground/70 hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

export function AppHeader() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: profile } = useGetMyProfile({
    query: { enabled: !!user, queryKey: getGetMyProfileQueryKey() },
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDoctor = profile?.role === "doctor";
  const isPatient = profile?.role === "patient";

  const links = isPatient
    ? [
        { to: "/patient", label: t("nav.dashboard") },
        { to: "/patient/book", label: t("nav.book") },
        { to: "/patient/appointments", label: t("nav.appointments") },
        { to: "/patient/documents", label: t("nav.documents") },
        { to: "/patient/symptoms", label: t("nav.symptoms") },
        { to: "/chat", label: t("nav.chat") },
      ]
    : isDoctor
      ? [
          { to: "/doctor", label: t("nav.dashboard") },
          { to: "/doctor/appointments", label: t("nav.appointments") },
          { to: "/chat", label: t("nav.chat") },
        ]
      : [];

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <BrandLogo size={32} />
          <span className="font-semibold text-lg tracking-tight">
            {t("app.name")}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-6 flex-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              label={l.label}
              active={location === l.to || location.startsWith(l.to + "/")}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle />
          <Show when="signed-in">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                  {(profile?.name || user?.firstName || "U")
                    .slice(0, 1)
                    .toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 text-sm">
                  <div className="font-medium">
                    {profile?.name || user?.firstName || "Welcome"}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {profile?.role === "unset" ? "Set up profile" : profile?.role}
                  </div>
                </div>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("auth.signout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                {t("auth.signin")}
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">{t("auth.signup")}</Button>
            </Link>
          </Show>
          {links.length > 0 && (
            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10"
              aria-label="Menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
      {mobileOpen && links.length > 0 && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-4 py-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                label={l.label}
                active={location === l.to}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

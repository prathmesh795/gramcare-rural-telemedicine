import { useState, useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMyProfile,
  useUpdateMyProfile,
  getGetMyProfileQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useTranslation } from "@/lib/i18n";
import { Stethoscope, User } from "lucide-react";
import { SignedInOnly } from "@/components/layout/role-gate";

export default function RoleSelect() {
  return (
    <SignedInOnly>
      <RoleSelectInner />
    </SignedInOnly>
  );
}

function RoleSelectInner() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { data: profile } = useGetMyProfile();
  const update = useUpdateMyProfile();

  const [role, setRole] = useState<"patient" | "doctor" | null>(null);
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [specialty, setSpecialty] = useState("");

  useEffect(() => {
    if (profile?.name) setName(profile.name);
    if (profile?.village) setVillage(profile.village);
    if (profile?.specialty) setSpecialty(profile.specialty);
  }, [profile]);

  if (profile && profile.role !== "unset") {
    return <Redirect to={profile.role === "doctor" ? "/doctor" : "/patient"} />;
  }

  async function submit() {
    if (!role || !name.trim()) return;
    await update.mutateAsync({
      data: {
        role,
        name: name.trim(),
        village: role === "patient" ? village.trim() || null : null,
        specialty: role === "doctor" ? specialty.trim() || null : null,
      },
    });
    await qc.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
    setLocation(role === "doctor" ? "/doctor" : "/patient");
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 text-primary mb-6">
          <BrandLogo size={32} />
          <span className="font-semibold text-lg">{t("app.name")}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("role.welcome")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("role.select")}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <RoleCard
            selected={role === "patient"}
            onClick={() => setRole("patient")}
            icon={<User className="w-5 h-5" />}
            title={t("role.patient")}
            body={t("role.patientBody")}
          />
          <RoleCard
            selected={role === "doctor"}
            onClick={() => setRole("doctor")}
            icon={<Stethoscope className="w-5 h-5" />}
            title={t("role.doctor")}
            body={t("role.doctorBody")}
          />
        </div>

        {role && (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("role.name")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("role.namePh")}
              />
            </div>
            {role === "patient" && (
              <div className="space-y-2">
                <Label htmlFor="village">{t("role.village")}</Label>
                <Input
                  id="village"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder={t("role.villagePh")}
                />
              </div>
            )}
            {role === "doctor" && (
              <div className="space-y-2">
                <Label htmlFor="specialty">{t("role.specialty")}</Label>
                <Input
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder={t("role.specialtyPh")}
                />
              </div>
            )}
            <Button
              className="w-full text-base py-6"
              onClick={submit}
              disabled={!name.trim() || update.isPending}
            >
              {update.isPending ? t("common.loading") : t("role.continue")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function RoleCard({
  selected,
  onClick,
  icon,
  title,
  body,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl border p-5 transition ${
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center">
        {icon}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="text-sm text-muted-foreground mt-1 leading-snug">{body}</p>
    </button>
  );
}

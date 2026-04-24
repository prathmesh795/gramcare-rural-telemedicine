import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useTranslation } from "@/lib/i18n";
import {
  Heart,
  Stethoscope,
  Languages,
  WifiOff,
  Shield,
  Sparkles,
  CheckCircle2,
  Star,
  Phone,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/lib/demo";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { hasOnboarded } from "./onboarding";

export default function Landing() {
  const { t } = useTranslation();
  const demo = useDemo();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState<"patient" | "doctor" | null>(null);

  async function startDemo(role: "patient" | "doctor") {
    try {
      setLoading(role);
      await demo.start(role);
      qc.clear();
      if (!hasOnboarded()) {
        setLocation("/onboarding");
      } else {
        setLocation(role === "doctor" ? "/doctor" : "/patient");
      }
    } catch {
      toast.error("Could not start demo");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-32 w-[560px] h-[560px] rounded-full bg-[radial-gradient(closest-side,hsl(221_83%_53%/0.18),transparent)]" />
          <div className="absolute top-40 -left-32 w-[460px] h-[460px] rounded-full bg-[radial-gradient(closest-side,hsl(160_84%_39%/0.16),transparent)]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(hsl(220 14% 88%) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "linear-gradient(to bottom, black 30%, transparent 90%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 30%, transparent 90%)",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-14 pb-16 md:pt-20 md:pb-24 grid lg:grid-cols-12 gap-10 items-center">
          {/* Left column */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border shadow-sm text-xs font-semibold text-foreground/80">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Trusted by 1,200+ rural families
            </span>

            <div className="flex items-center gap-3 text-primary mt-6">
              <BrandLogo size={36} />
              <span className="text-sm font-bold tracking-[0.18em] uppercase">
                {t("app.name")}
              </span>
            </div>

            <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] max-w-2xl">
              <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t("landing.hero")}
              </span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              {t("landing.sub")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="text-base px-7 h-14 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition"
                onClick={() => startDemo("patient")}
                disabled={loading !== null}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {loading === "patient" ? t("demo.starting") : t("demo.tryButton")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-6 h-14 rounded-xl"
                >
                  {t("auth.signup")}
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-base px-4 h-14 rounded-xl"
                >
                  {t("auth.signin")}
                </Button>
              </Link>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {t("demo.subline")}{" "}
              <button
                type="button"
                onClick={() => startDemo("doctor")}
                disabled={loading !== null}
                className="text-primary hover:underline font-semibold disabled:opacity-50"
              >
                {loading === "doctor"
                  ? t("demo.starting")
                  : t("demo.asDoctorLink")}
              </button>
            </div>

            {/* Trust pills */}
            <div className="mt-10 grid grid-cols-3 gap-3 max-w-lg">
              <TrustStat value="50+" label="Verified doctors" />
              <TrustStat value="24/7" label="Emergency support" />
              <TrustStat value="2 langs" label="हिन्दी · English" />
            </div>
          </div>

          {/* Right column — visual card stack */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative h-[480px]">
              {/* Background glow card */}
              <div className="absolute inset-x-4 top-4 bottom-0 rounded-3xl bg-gradient-to-br from-primary to-primary/60 opacity-90 shadow-2xl shadow-primary/30" />

              {/* Doctor profile card */}
              <div className="absolute top-4 left-2 right-2 rounded-3xl bg-white/95 backdrop-blur p-5 shadow-xl border border-white/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white inline-flex items-center justify-center font-bold text-lg">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      Dr. Anjali Sharma
                    </div>
                    <div className="text-xs text-muted-foreground">
                      General Medicine · 12 yrs
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                    4.9
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Today · 4:30 PM
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                    Available
                  </span>
                </div>
              </div>

              {/* Floating chat card */}
              <div className="absolute top-44 left-8 right-12 rounded-2xl bg-white p-4 shadow-lg border border-border/60">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary inline-flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">
                      "Drink warm fluids and rest. Send me your temperature
                      tonight."
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Dr. Sharma · 2 min ago
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation card */}
              <div className="absolute bottom-4 left-2 right-6 rounded-2xl bg-white p-5 shadow-xl border border-border/60">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary inline-flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      Appointment confirmed
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      You'll get a reminder by SMS
                    </div>
                  </div>
                  <Phone className="w-4 h-4 text-primary self-center" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.18em]">
              Simple. Fast. Free.
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              {t("landing.howItWorks")}
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              t("landing.step1"),
              t("landing.step2"),
              t("landing.step3"),
            ].map((s, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-border bg-white p-6 hover:shadow-lg transition group"
              >
                <div className="absolute -top-4 left-6 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white inline-flex items-center justify-center text-base font-bold shadow-lg shadow-primary/25">
                  {i + 1}
                </div>
                <p className="mt-6 text-base leading-relaxed text-foreground/80">
                  {s}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<Stethoscope className="w-5 h-5" />}
            tone="primary"
            title={t("feat.doctors.title")}
            body={t("feat.doctors.body")}
          />
          <Feature
            icon={<Heart className="w-5 h-5" />}
            tone="rose"
            title={t("feat.emergency.title")}
            body={t("feat.emergency.body")}
          />
          <Feature
            icon={<Languages className="w-5 h-5" />}
            tone="violet"
            title={t("feat.language.title")}
            body={t("feat.language.body")}
          />
          <Feature
            icon={<WifiOff className="w-5 h-5" />}
            tone="secondary"
            title={t("feat.lowband.title")}
            body={t("feat.lowband.body")}
          />
        </div>
        <div className="mt-12 rounded-3xl overflow-hidden relative bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 text-white shadow-xl shadow-primary/20">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-secondary/40 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 inline-flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold">
                Your health, your privacy.
              </h3>
              <p className="mt-2 text-white/85 leading-relaxed max-w-2xl">
                {t("landing.privacy")}
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-6 bg-white text-primary hover:bg-white/90 rounded-xl"
                onClick={() => startDemo("patient")}
                disabled={loading !== null}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t("demo.tryButton")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TrustStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center px-3 py-3 rounded-xl bg-white/70 border border-border">
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
        {label}
      </div>
    </div>
  );
}

const TONES: Record<
  string,
  { bg: string; text: string; ring: string }
> = {
  primary: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    ring: "ring-blue-100",
  },
  secondary: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    ring: "ring-emerald-100",
  },
  rose: { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    ring: "ring-violet-100",
  },
};

function Feature({
  icon,
  title,
  body,
  tone = "primary",
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tone?: keyof typeof TONES;
}) {
  const c = TONES[tone];
  return (
    <div className="rounded-2xl border border-border bg-white p-6 hover:-translate-y-0.5 hover:shadow-lg transition">
      <div
        className={`w-12 h-12 rounded-2xl inline-flex items-center justify-center ring-8 ${c.bg} ${c.text} ${c.ring}`}
      >
        {icon}
      </div>
      <h3 className="mt-5 font-semibold text-base">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {body}
      </p>
    </div>
  );
}

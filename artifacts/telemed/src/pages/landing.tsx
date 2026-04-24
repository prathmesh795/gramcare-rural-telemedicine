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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08),transparent_50%),radial-gradient(circle_at_bottom_left,hsl(var(--primary)/0.06),transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="flex items-center gap-3 text-primary">
            <BrandLogo size={36} />
            <span className="text-sm font-medium tracking-wide uppercase">
              {t("app.name")}
            </span>
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1] max-w-3xl">
            {t("landing.hero")}
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {t("landing.sub")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="text-base px-6 py-6"
              onClick={() => startDemo("patient")}
              disabled={loading !== null}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading === "patient" ? t("demo.starting") : t("demo.tryButton")}
            </Button>
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-6 py-6"
              >
                {t("auth.signup")}
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                size="lg"
                variant="ghost"
                className="text-base px-6 py-6"
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
              className="text-primary hover:underline font-medium disabled:opacity-50"
            >
              {loading === "doctor"
                ? t("demo.starting")
                : t("demo.asDoctorLink")}
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {t("landing.howItWorks")}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              t("landing.step1"),
              t("landing.step2"),
              t("landing.step3"),
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center text-lg font-semibold">
                  {i + 1}
                </div>
                <p className="mt-4 text-base leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<Stethoscope className="w-5 h-5" />}
            title={t("feat.doctors.title")}
            body={t("feat.doctors.body")}
          />
          <Feature
            icon={<Heart className="w-5 h-5" />}
            title={t("feat.emergency.title")}
            body={t("feat.emergency.body")}
          />
          <Feature
            icon={<Languages className="w-5 h-5" />}
            title={t("feat.language.title")}
            body={t("feat.language.body")}
          />
          <Feature
            icon={<WifiOff className="w-5 h-5" />}
            title={t("feat.lowband.title")}
            body={t("feat.lowband.body")}
          />
        </div>
        <div className="mt-10 rounded-2xl bg-primary/5 border border-primary/15 p-6 flex items-start gap-4">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t("landing.privacy")}
          </p>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

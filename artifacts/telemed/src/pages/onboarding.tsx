import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import { LangToggle } from "@/components/layout/lang-toggle";
import { useTranslation } from "@/lib/i18n";
import { Stethoscope, MessageCircle, Heart, ArrowRight } from "lucide-react";

const ONBOARDED_KEY = "telemed-onboarded";

export function markOnboarded() {
  try {
    localStorage.setItem(ONBOARDED_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === "1";
  } catch {
    return false;
  }
}

export default function Onboarding() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Stethoscope className="w-7 h-7 text-primary" />,
      title: t("onb.step1.title"),
      body: t("onb.step1.body"),
    },
    {
      icon: <MessageCircle className="w-7 h-7 text-primary" />,
      title: t("onb.step2.title"),
      body: t("onb.step2.body"),
    },
    {
      icon: <Heart className="w-7 h-7 text-primary" />,
      title: t("onb.step3.title"),
      body: t("onb.step3.body"),
    },
  ];

  const last = step === steps.length - 1;
  const cur = steps[step]!;

  function next() {
    if (last) {
      markOnboarded();
      setLocation("/");
    } else {
      setStep((s) => s + 1);
    }
  }

  function skip() {
    markOnboarded();
    setLocation("/");
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="px-4 py-4 flex items-center justify-between max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 text-primary">
          <BrandLogo size={28} />
          <span className="font-semibold tracking-tight">{t("app.name")}</span>
        </div>
        <LangToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          {cur.icon}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          {cur.title}
        </h1>
        <p className="mt-3 text-base text-muted-foreground text-center leading-relaxed">
          {cur.body}
        </p>

        <div className="mt-10 flex items-center gap-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
      </main>

      <footer className="px-6 pb-8 pt-4 max-w-md mx-auto w-full space-y-2">
        <Button onClick={next} size="lg" className="w-full text-base">
          {last ? t("onb.start") : t("onb.next")}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
        {!last && (
          <Button
            onClick={skip}
            size="lg"
            variant="ghost"
            className="w-full text-base"
          >
            {t("onb.skip")}
          </Button>
        )}
      </footer>
    </div>
  );
}

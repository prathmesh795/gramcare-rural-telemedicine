import { useState } from "react";
import { useCheckSymptoms } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import { AlertCircle, AlertTriangle } from "lucide-react";

const ALL_SYMPTOMS = [
  "fever",
  "cough",
  "headache",
  "sore throat",
  "body ache",
  "fatigue",
  "diarrhea",
  "vomiting",
  "shortness of breath",
  "chest pain",
  "dizziness",
  "rash",
];

export default function SymptomChecker() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [ageBand, setAgeBand] = useState<"child" | "adult" | "senior">("adult");
  const check = useCheckSymptoms();
  const [result, setResult] = useState<
    Awaited<ReturnType<typeof check.mutateAsync>> | null
  >(null);

  function toggle(s: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  async function submit() {
    if (selected.size === 0) {
      toast.error(t("symp.pickAtLeast"));
      return;
    }
    try {
      const res = await check.mutateAsync({
        data: { symptoms: Array.from(selected), ageBand },
      });
      setResult(res);
    } catch (e) {
      toast.error(t("common.error"));
    }
  }

  const urgencyColors: Record<string, string> = {
    low: "bg-emerald-100 text-emerald-900 border-emerald-200",
    moderate: "bg-amber-100 text-amber-900 border-amber-200",
    high: "bg-orange-100 text-orange-900 border-orange-200",
    emergency: "bg-rose-100 text-rose-900 border-rose-300",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("symp.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("symp.sub")}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
        <div>
          <Label className="text-base mb-3 block">{t("symp.pick")}</Label>
          <div className="flex flex-wrap gap-2">
            {ALL_SYMPTOMS.map((s) => (
              <button
                key={s}
                onClick={() => toggle(s)}
                className={`px-3 py-2 rounded-full border text-sm capitalize min-h-0 ${
                  selected.has(s)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                {t(`symptom.${s}` as never) || s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-base mb-3 block">{t("symp.age")}</Label>
          <div className="flex gap-2">
            {(["child", "adult", "senior"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAgeBand(a)}
                className={`px-4 py-2 rounded-full border text-sm min-h-0 ${
                  ageBand === a
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                }`}
              >
                {t(`age.${a}` as never) || a}
              </button>
            ))}
          </div>
        </div>
        <Button
          size="lg"
          className="w-full text-base py-6"
          onClick={submit}
          disabled={check.isPending}
        >
          {check.isPending ? t("common.loading") : t("symp.check")}
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <div
            className={`rounded-2xl border p-5 ${urgencyColors[result.urgency]}`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {result.urgency === "emergency" ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="capitalize">
                {t(`urgency.${result.urgency}` as never) || result.urgency}
              </span>
            </div>
            <p className="text-sm mt-2">{t(`urgency.${result.urgency}.msg` as never)}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold">{t("symp.possible")}</h3>
            {result.conditions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("symp.none")}</p>
            ) : (
              <div className="space-y-3">
                {result.conditions.map((c) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.confidence}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${c.confidence}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5">
                      {c.advice}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}

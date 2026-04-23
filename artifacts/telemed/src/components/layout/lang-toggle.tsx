import { useSyncLanguageWithProfile, useI18nStore } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LangToggle({ compact = false }: { compact?: boolean }) {
  const { language } = useI18nStore();
  const { changeLanguage } = useSyncLanguageWithProfile();

  return (
    <div
      className="inline-flex rounded-full border border-border bg-background overflow-hidden text-sm"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1.5 font-medium min-h-0 ${language === "en" ? "bg-primary text-primary-foreground" : "text-foreground/70"}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => changeLanguage("hi")}
        className={`px-3 py-1.5 font-medium min-h-0 ${language === "hi" ? "bg-primary text-primary-foreground" : "text-foreground/70"}`}
      >
        हिं
      </button>
    </div>
  );
}

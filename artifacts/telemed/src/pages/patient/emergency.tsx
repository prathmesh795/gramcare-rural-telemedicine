import { useState } from "react";
import { useTriggerEmergency } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Siren } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

export default function EmergencyPage() {
  const { t } = useTranslation();
  const trigger = useTriggerEmergency();
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<Date | null>(null);

  async function confirm() {
    try {
      await trigger.mutateAsync({
        data: { note: note.trim() || null },
      });
      setSent(new Date());
      setNote("");
      setOpen(false);
      toast.success(t("emer.sent"));
    } catch (e) {
      toast.error(t("common.error"));
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("nav.emergency")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("emer.sub")}</p>
      </div>

      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive inline-flex items-center justify-center shrink-0">
            <Siren className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{t("emer.title")}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("emer.body")}
            </p>
          </div>
        </div>
        <Textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("emer.notePh")}
        />
        <Button
          size="lg"
          variant="destructive"
          className="w-full text-base py-7 text-lg"
          onClick={() => setOpen(true)}
          disabled={trigger.isPending}
        >
          <Siren className="w-5 h-5 mr-2" />
          {t("emer.trigger")}
        </Button>
      </div>

      {sent && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <div className="font-medium">{t("emer.confirmed")}</div>
          <div className="text-sm text-emerald-800/80 mt-1">
            {t("emer.confirmedBody")}
          </div>
        </div>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("emer.confirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("emer.confirmBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {t("emer.yes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

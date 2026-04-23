import { useParams, Link } from "wouter";
import { useListDocuments } from "@workspace/api-client-react";
import { format } from "date-fns";
import { FileText, ImageIcon, MessageCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function PatientRecords() {
  const { t } = useTranslation();
  const params = useParams<{ patientId: string }>();
  const patientId = params.patientId;
  const { data: docs = [], isLoading } = useListDocuments({ patientId });

  return (
    <div className="space-y-5 max-w-3xl">
      <Link
        href="/doctor/appointments"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-4 h-4" />
        {t("common.back")}
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          {docs[0]?.patientName || t("doc.records")}
        </h1>
        <Link href={`/chat/${patientId}`}>
          <Button variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("doc.chat")}
          </Button>
        </Link>
      </div>
      <h2 className="font-semibold">{t("doc.documents")}</h2>
      {isLoading ? null : docs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          {t("doc.noDocs")}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {docs.map((d) => (
            <a
              key={d.id}
              href={d.dataUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:border-primary/50"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center">
                {d.mimeType.startsWith("image/") ? (
                  <ImageIcon className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{d.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatBytes(d.sizeBytes)} ·{" "}
                  {format(new Date(d.createdAt), "MMM d, yyyy")}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

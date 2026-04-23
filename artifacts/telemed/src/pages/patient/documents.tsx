import { useRef, useState } from "react";
import {
  useListDocuments,
  useUploadDocument,
  getListDocumentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { compressImageToDataUrl } from "@/lib/compress-image";
import { format } from "date-fns";
import { FileText, Upload, ImageIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function PatientDocuments() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data: docs = [], isLoading } = useListDocuments();
  const upload = useUploadDocument();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { dataUrl, sizeBytes, mimeType } = await compressImageToDataUrl(
        file,
      );
      void sizeBytes;
      await upload.mutateAsync({
        data: {
          name: name.trim() || file.name,
          mimeType,
          dataUrl,
        },
      });
      await qc.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
      toast.success(t("docs.uploaded"));
      setName("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      toast.error(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("nav.documents")}
      </h1>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-semibold">{t("docs.upload")}</h2>
        <div className="space-y-2">
          <Label htmlFor="docname">{t("docs.name")}</Label>
          <Input
            id="docname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("docs.namePh")}
          />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={onFile}
          disabled={busy}
        />
        <Button
          type="button"
          size="lg"
          className="w-full text-base py-5"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          <Upload className="w-4 h-4 mr-2" />
          {busy ? t("docs.compressing") : t("docs.choose")}
        </Button>
        <p className="text-xs text-muted-foreground">{t("docs.hint")}</p>
      </div>

      <div>
        <h2 className="font-semibold mb-3">{t("docs.yours")}</h2>
        {isLoading ? (
          <Spinner />
        ) : docs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            {t("docs.empty")}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {docs.map((d) => (
              <a
                key={d.id}
                href={d.dataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:border-primary/50 transition"
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
    </div>
  );
}

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { AlertTriangle } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-orange-100 text-orange-900 px-4 py-2 flex items-center justify-center text-sm font-medium sticky top-0 z-50">
      <AlertTriangle className="w-4 h-4 mr-2" />
      {t("chat.offline")}
    </div>
  );
}

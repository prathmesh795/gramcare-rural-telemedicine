import { Link } from "wouter";
import {
  useListChatThreads,
  getListChatThreadsQueryKey,
} from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { MessageCircle } from "lucide-react";

export default function ChatList() {
  const { t } = useTranslation();
  const { data: threads = [], isLoading } = useListChatThreads({
    query: {
      refetchInterval: 8_000,
      queryKey: getListChatThreadsQueryKey(),
    },
  });

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">{t("nav.chat")}</h1>
      {isLoading ? null : threads.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <MessageCircle className="w-6 h-6 mx-auto text-muted-foreground opacity-60 mb-2" />
          <p className="text-muted-foreground">{t("chat.empty")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("chat.emptyHint")}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card divide-y overflow-hidden">
          {threads.map((th) => (
            <Link
              key={th.otherUserId}
              href={`/chat/${th.otherUserId}`}
              className="block px-4 py-4 hover:bg-accent/40 transition"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">
                      {th.otherUserRole === "doctor" ? "Dr. " : ""}
                      {th.otherUserName}
                    </span>
                    {th.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold">
                        {th.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate mt-0.5">
                    {th.lastMessage}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(th.lastMessageAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

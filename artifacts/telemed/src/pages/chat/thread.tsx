import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListChatMessages,
  useSendChatMessage,
  getListChatMessagesQueryKey,
  getListChatThreadsQueryKey,
} from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n";
import { ChevronLeft, Send, WifiOff } from "lucide-react";
import { format } from "date-fns";

interface QueuedMsg {
  id: string;
  otherUserId: string;
  body: string;
  createdAt: string;
}

const QUEUE_KEY = "telemed-chat-queue";

function readQueue(): QueuedMsg[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeQueue(q: QueuedMsg[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export default function ChatThread() {
  const { t } = useTranslation();
  const { user } = useUser();
  const qc = useQueryClient();
  const params = useParams<{ otherUserId: string }>();
  const otherUserId = params.otherUserId;
  const [text, setText] = useState("");
  const [offline, setOffline] = useState(!navigator.onLine);
  const [queued, setQueued] = useState<QueuedMsg[]>(() =>
    readQueue().filter((m) => m.otherUserId === otherUserId),
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useListChatMessages(otherUserId, {
    query: {
      refetchInterval: 4000,
      queryKey: getListChatMessagesQueryKey(otherUserId),
    },
  });
  const send = useSendChatMessage();

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Auto-flush queued on online
  useEffect(() => {
    if (offline) return;
    const all = readQueue();
    const mine = all.filter((m) => m.otherUserId === otherUserId);
    if (mine.length === 0) return;
    (async () => {
      for (const m of mine) {
        try {
          await send.mutateAsync({
            otherUserId: m.otherUserId,
            data: { body: m.body },
          });
        } catch {
          return;
        }
      }
      const remaining = readQueue().filter(
        (m) => m.otherUserId !== otherUserId,
      );
      writeQueue(remaining);
      setQueued([]);
      qc.invalidateQueries({
        queryKey: getListChatMessagesQueryKey(otherUserId),
      });
      qc.invalidateQueries({ queryKey: getListChatThreadsQueryKey() });
    })();
  }, [offline, otherUserId, qc, send]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, queued.length]);

  async function submit() {
    const body = text.trim();
    if (!body) return;
    setText("");
    if (offline) {
      const m: QueuedMsg = {
        id: `q-${Date.now()}`,
        otherUserId,
        body,
        createdAt: new Date().toISOString(),
      };
      const next = [...readQueue(), m];
      writeQueue(next);
      setQueued((q) => [...q, m]);
      return;
    }
    try {
      await send.mutateAsync({ otherUserId, data: { body } });
      qc.invalidateQueries({
        queryKey: getListChatMessagesQueryKey(otherUserId),
      });
      qc.invalidateQueries({ queryKey: getListChatThreadsQueryKey() });
    } catch {
      const m: QueuedMsg = {
        id: `q-${Date.now()}`,
        otherUserId,
        body,
        createdAt: new Date().toISOString(),
      };
      const next = [...readQueue(), m];
      writeQueue(next);
      setQueued((q) => [...q, m]);
    }
  }

  const myId = user?.id;
  const other = messages[0]
    ? messages[0].senderId === myId
      ? messages[0].recipientId
      : messages[0].senderId
    : otherUserId;
  void other;

  return (
    <div className="flex flex-col max-w-3xl h-[calc(100dvh-140px)]">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Link
          href="/chat"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("chat.back")}
        </Link>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-4 space-y-2"
      >
        {messages.map((m) => {
          const mine = m.senderId === myId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  mine
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-accent text-foreground rounded-bl-md"
                }`}
              >
                <div className="whitespace-pre-wrap break-words text-base">
                  {m.body}
                </div>
                <div
                  className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {format(new Date(m.createdAt), "h:mm a")}
                </div>
              </div>
            </div>
          );
        })}
        {queued.map((m) => (
          <div key={m.id} className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl px-4 py-2.5 bg-primary/50 text-primary-foreground rounded-br-md">
              <div className="whitespace-pre-wrap break-words text-base">
                {m.body}
              </div>
              <div className="text-[10px] mt-1 text-primary-foreground/80 flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                {t("chat.queued")}
              </div>
            </div>
          </div>
        ))}
      </div>
      {offline && (
        <div className="px-3 py-2 rounded-lg bg-amber-100 text-amber-900 text-sm mb-2 flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          {t("chat.offline")}
        </div>
      )}
      <div className="flex gap-2 items-end border-t border-border pt-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={t("chat.placeholder")}
          className="flex-1 min-h-12 resize-none"
        />
        <Button
          size="lg"
          onClick={submit}
          disabled={!text.trim() || send.isPending}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

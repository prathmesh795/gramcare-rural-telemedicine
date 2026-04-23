import { useState } from "react";
import { Bell } from "lucide-react";
import {
  useListNotifications,
  useClearNotifications,
  getListNotificationsQueryKey,
} from "@workspace/api-client-react";

import { useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useListNotifications({
    query: {
      refetchInterval: 10_000,
      queryKey: getListNotificationsQueryKey(),
    },
  });
  const clear = useClearNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative inline-flex items-center justify-center w-11 h-11 rounded-full hover:bg-accent"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 ? (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold inline-flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await clear.mutateAsync();
                qc.invalidateQueries({
                  queryKey: getListNotificationsQueryKey(),
                });
              }}
            >
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto divide-y">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 ${n.read ? "" : "bg-accent/30"}`}
              >
                <div className="flex justify-between gap-2">
                  <span className="font-medium text-sm">{n.title}</span>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

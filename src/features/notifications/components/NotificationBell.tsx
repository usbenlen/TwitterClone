import { Bell } from "lucide-react";

import { notificationsQueryApi } from "@/features/notifications/api/notificationQueries";
import { useAppSelector } from "@/shared/store/hooks";

const selectCount = notificationsQueryApi.endpoints.getUnreadNotificationsCount.select();

export function NotificationBell() {
  const count = useAppSelector(selectCount).data?.count ?? 0;
  return (
    <span className="relative flex size-6 shrink-0 items-center justify-center">
      <Bell className="size-6" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 min-w-4 rounded-full border-2 border-background bg-primary px-1 text-center text-[10px] font-bold leading-4 text-primary-foreground">
          <span aria-hidden="true">{count > 99 ? "99+" : count}</span>
          <span className="sr-only">Непрочитаних сповіщень: {count}</span>
        </span>
      )}
    </span>
  );
}

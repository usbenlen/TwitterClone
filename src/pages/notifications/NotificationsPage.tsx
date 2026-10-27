import { Bell, CheckCheck, Settings } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { PageHeader } from "@/components/layout/pageHeader";
import { NotificationRow } from "@/components/notifications/NotificationRow";

import { APP_ROUTES } from "@/constants/routes";

import { useNotifications } from "@/hooks/useNotifications";

import { errorMessage } from "@/store/api";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/store/notificationsApi";

import { Button, Spinner, Tab, Tooltip } from "@/ui";

export default function NotificationsPage() {
  const [params] = useSearchParams();
  const tab = params.get("tab") === "mentions" ? "mentions" : "all";
  const {
    items,
    readThrough,
    isLoading,
    isFetching,
    isLoadingMore,
    hasMore,
    error,
    loadMoreRef,
    loadMore,
    retry,
  } = useNotifications(tab);
  const [read, readState] = useMarkNotificationReadMutation({
    fixedCacheKey: "notifications:read",
  });
  const [readAll, allState] = useMarkAllNotificationsReadMutation({
    fixedCacheKey: "notifications:read-all",
  });
  const readError = readState.error || allState.error;

  return (
    <section className="min-h-screen w-full max-w-3xl border-r border-border bg-background">
      <PageHeader
        title="Сповіщення"
        actions={
          <>
            <Tooltip label="Позначити всі прочитаними">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Позначити всі прочитаними"
                disabled={!readThrough || allState.isLoading}
                onClick={() => void readAll(readThrough!)}
              >
                <CheckCheck className="size-5" aria-hidden="true" />
              </Button>
            </Tooltip>
            <Tooltip label="Налаштування сповіщень">
              <Link
                to={APP_ROUTES.SETTINGS_NOTIFICATIONS}
                aria-label="Налаштування сповіщень"
                className="rounded-full p-2.5 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Settings className="size-5" aria-hidden="true" />
              </Link>
            </Tooltip>
          </>
        }
        footer={
          <nav aria-label="Вкладки сповіщень" className="flex">
            {(
              [
                ["all", "Усі"],
                ["mentions", "Згадки"],
              ] as const
            ).map(([value, label]) => (
              <Link
                key={value}
                to={
                  value === "all"
                    ? APP_ROUTES.NOTIFICATIONS
                    : `${APP_ROUTES.NOTIFICATIONS}?tab=mentions`
                }
                aria-current={tab === value ? "page" : undefined}
                className="flex min-w-max flex-1 justify-center rounded-t-sm px-4 pt-3 transition-colors hover:bg-muted dark:hover:bg-surface-hover dark:active:bg-muted dark:focus-visible:focus-indicator focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <Tab active={tab === value}>{label}</Tab>
              </Link>
            ))}
          </nav>
        }
      />

      {readError && (
        <div
          role="alert"
          className="border-b border-border px-4 py-3 text-sm text-destructive"
        >
          Не вдалося позначити сповіщення прочитаними. {errorMessage(readError)}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              readState.reset();
              allState.reset();
            }}
          >
            Закрити
          </Button>
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          aria-label="Завантаження сповіщень"
          className="flex justify-center py-16"
        >
          <Spinner variant="inline" />
        </div>
      ) : items.length === 0 && !error ? (
        <div className="mx-auto max-w-sm px-6 py-14">
          <Bell className="mb-5 size-10 text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            {tab === "mentions"
              ? "Вас поки не згадували"
              : "Тут з’являться ваші сповіщення"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {tab === "mentions"
              ? "Коли хтось згадає вас у пості чи коментарі, ви побачите це тут."
              : "Вподобання, відповіді, репости та нові підписники — усе найважливіше в одному місці."}
          </p>
        </div>
      ) : (
        <div aria-label="Список сповіщень">
          {items.map(({ item, readThrough }) => (
            <NotificationRow
              key={item.id}
              notification={item}
              onRead={() => {
                if (!item.isRead) void read({ id: item.id, readThrough });
              }}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="px-4 py-8 text-center">
          <p role="alert" className="text-sm text-destructive">
            Не вдалося завантажити сповіщення. {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={isFetching}
            onClick={() => void retry()}
          >
            Спробувати ще раз
          </Button>
        </div>
      )}
      {hasMore && !error && (
        <div className="px-4 py-5 text-center">
          <div ref={loadMoreRef} aria-hidden="true" />
          <Button
            variant="ghost"
            size="sm"
            disabled={isFetching}
            isLoading={isLoadingMore}
            onClick={() => void loadMore()}
          >
            Показати ще
          </Button>
        </div>
      )}
    </section>
  );
}

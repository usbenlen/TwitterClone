import { useForm } from "react-hook-form";

import { PageHeader } from "@/widgets/navigation/pageHeader";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "@/features/notifications/api/notificationQueries";
import { NOTIFICATION_PREFERENCE_LABELS } from "@/features/notifications/constants/notification";
import { APP_ROUTES } from "@/shared/config/routes";
import { APP_NAME } from "@/shared/constants/app";
import { errorMessage } from "@/shared/store/appApi";
import { Button, Spinner } from "@/shared/ui";

import type { NotificationPreferences } from "@/features/notifications/types";

function PreferencesForm({ initial }: { initial: NotificationPreferences }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, dirtyFields },
  } = useForm<NotificationPreferences>({ defaultValues: initial });
  const [save, result] = useUpdateNotificationPreferencesMutation();
  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        const patch = Object.fromEntries(
          (Object.keys(initial) as (keyof NotificationPreferences)[])
            .filter((key) => dirtyFields[key])
            .map((key) => [key, values[key]]),
        );
        try {
          reset(await save(patch).unwrap());
        } catch {
          // Keep the edited values; the mutation result renders the server error.
        }
      })}
    >
      <fieldset
        disabled={result.isLoading}
        className="divide-y divide-border overflow-hidden rounded-2xl border border-border"
      >
        <legend className="sr-only">Типи сповіщень</legend>
        {(
          Object.keys(
            NOTIFICATION_PREFERENCE_LABELS,
          ) as (keyof NotificationPreferences)[]
        ).map((key) => (
          <label
            key={key}
            className="flex cursor-pointer items-center justify-between gap-4 p-5 transition hover:bg-muted"
          >
            <span>
              <span className="block font-semibold">
                {NOTIFICATION_PREFERENCE_LABELS[key].title}
              </span>
              <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                {NOTIFICATION_PREFERENCE_LABELS[key].description}
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              {...register(key, { onChange: () => result.reset() })}
              className="relative h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-muted-foreground/40 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-background after:shadow-sm after:transition-transform checked:bg-primary checked:after:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            />
          </label>
        ))}
      </fieldset>
      {result.error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          Не вдалося зберегти налаштування. {errorMessage(result.error)}
        </p>
      )}
      {result.isSuccess && !isDirty && (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          Налаштування збережено.
        </p>
      )}
      <div className="mt-5 flex justify-end">
        <Button type="submit" disabled={!isDirty} isLoading={result.isLoading}>
          Зберегти
        </Button>
      </div>
    </form>
  );
}

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const query = useGetNotificationPreferencesQuery();
  return (
    <section className="min-h-screen w-full max-w-3xl border-r border-border bg-background">
      <PageHeader
        title="Налаштування сповіщень"
        backTo={APP_ROUTES.NOTIFICATIONS}
      />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h2 className="text-xl font-bold">Про що вам повідомляти</h2>
        <p className="mb-6 mt-2 text-sm leading-6 text-muted-foreground">
          Оберіть події, які хочете бачити у сповіщеннях {APP_NAME}. Зміни
          діятимуть для нових подій. Попередні сповіщення залишаться у стрічці.
        </p>
        {query.error && (
          <div className="mb-4">
            <p role="alert" className="text-sm text-destructive">
              Не вдалося завантажити налаштування. {errorMessage(query.error)}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              Спробувати ще раз
            </Button>
          </div>
        )}
        {query.isLoading ? (
          <div
            role="status"
            aria-label="Завантаження налаштувань"
            className="flex justify-center py-12"
          >
            <Spinner variant="inline" />
          </div>
        ) : query.data ? (
          <PreferencesForm key={user?.id} initial={query.data} />
        ) : null}
      </div>
    </section>
  );
}

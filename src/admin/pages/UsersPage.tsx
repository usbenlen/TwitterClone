import { useAdminUsersQuery, useAdminUserActionMutation } from "@/admin/store";
import { ListX } from "lucide-react";
import {
  USERS_DEFAULTS,
  USER_ACTION_ICONS,
  USER_ACTION_LABELS,
} from "@/admin/constants";
import {
  useCorrectPage,
  useListParams,
  usePageSelection,
} from "@/admin/listState";
import { useActionConfirmation } from "@/admin/components/ActionConfirmation";
import {
  Pagination,
  QueryState,
  Select,
} from "@/admin/components/ListControls";
import { UserSummary } from "@/admin/components/Summaries";
import { UserActions } from "@/admin/components/UserActions";
import { useAuth } from "@/hooks/useAuth";
import SearchBox from "@/ui/SearchBox";
import { Button } from "@/ui/Button";
import type { UserAction } from "@/admin/types";

const choices = {
  status: ["all", "active", "blocked"],
  sort: ["newest", "oldest"],
};

export default function UsersPage() {
  const { user: viewer } = useAuth();
  const state = useListParams(USERS_DEFAULTS, choices);
  const query = useAdminUsersQuery(state.queryParams, {
    skip: state.isSearching,
  });
  const data = query.currentData;
  useCorrectPage(data?.pagination.page, state.params.page, state.correctPage);
  const users = data?.items ?? [];
  const selection = usePageSelection(
    users.filter((user) => user.id !== viewer?.id).map((user) => user.id),
    JSON.stringify(state.params),
  );
  const [mutate] = useAdminUserActionMutation();
  const confirmation = useActionConfirmation();

  const act = (ids: string[], action: UserAction) =>
    confirmation.ask({
      label: USER_ACTION_LABELS[action],
      tasks: ids.map((id) => ({
        id,
        run: () => mutate({ id, action }).unwrap(),
      })),
      onDone: selection.set,
    });

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold">Користувачі</h1>
        <p className="mt-1 text-muted-foreground">
          Керуйте акаунтами та їхнім доступом.
        </p>
      </header>
      <div className="flex flex-wrap items-end gap-3">
        <SearchBox
          value={state.params.search}
          onChange={(value) => state.update("search", value, true)}
          placeholder="Пошук користувачів"
          className="min-w-48 flex-1"
        />
        <Select
          label="Статус"
          value={state.params.status}
          options={{ all: "Усі", active: "Активні", blocked: "Заблоковані" }}
          onChange={(value) => state.update("status", value)}
        />
        <Select
          label="Сортування"
          value={state.params.sort}
          options={{ newest: "Спочатку нові", oldest: "Спочатку старі" }}
          onChange={(value) => state.update("sort", value)}
        />
      </div>
      <QueryState
        loading={state.isSearching || (query.isFetching && !data)}
        error={query.error}
        empty={users.length === 0}
        retry={query.refetch}
      >
        <div
          className="space-y-4"
          aria-busy={query.isFetching || confirmation.busy}
        >
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selection.all}
                disabled={confirmation.busy || query.isFetching}
                onChange={selection.toggleAll}
                className="accent-primary"
              />
              Вибрати сторінку
            </label>
            {selection.selected.length > 0 && (
              <>
                <span className="text-sm">
                  Вибрано: {selection.selected.length}
                </span>
                {(Object.keys(USER_ACTION_LABELS) as UserAction[]).map(
                  (action) => {
                    const Icon = USER_ACTION_ICONS[action];
                    return (
                      <Button
                        key={action}
                        size="comfortable"
                        shape="rounded"
                        variant={
                          action === "delete" ? "destructive" : "outline"
                        }
                        disabled={confirmation.busy || query.isFetching}
                        onClick={() => act(selection.selected, action)}
                      >
                        <Icon
                          className="size-4.5 shrink-0"
                          aria-hidden="true"
                        />
                        {USER_ACTION_LABELS[action]}
                      </Button>
                    );
                  },
                )}
                <Button
                  variant="ghost"
                  size="comfortable"
                  shape="rounded"
                  onClick={() => selection.set([])}
                >
                  <ListX className="size-4.5 shrink-0" aria-hidden="true" />
                  Зняти виділення
                </Button>
              </>
            )}
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
            {users.map((user) => (
              <article
                key={user.id}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-4 sm:p-5 xl:grid-cols-[auto_minmax(0,1fr)_auto]"
              >
                <input
                  type="checkbox"
                  aria-label={`Вибрати @${user.username}`}
                  disabled={
                    confirmation.busy ||
                    query.isFetching ||
                    user.id === viewer?.id
                  }
                  checked={selection.selected.includes(user.id)}
                  onChange={() => selection.toggle(user.id)}
                  className="accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <UserSummary user={user} />
                </div>
                <div className="col-span-2 xl:col-span-1">
                  <UserActions
                    user={user}
                    busy={confirmation.busy || query.isFetching}
                    onAction={(action) => act([user.id], action)}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </QueryState>
      {data && (
        <Pagination
          {...data.pagination}
          busy={query.isFetching || confirmation.busy}
          onChange={(page) => state.update("page", page)}
        />
      )}
      {confirmation.modal}
    </>
  );
}

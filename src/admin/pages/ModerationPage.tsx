import { useAdminReportsQuery, useResolveReportMutation } from "@/admin/store";
import { MODERATION_DEFAULTS } from "@/admin/constants";
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
import { ReportSummary, ReportPreview } from "@/admin/components/Summaries";
import { ReportActions } from "@/admin/components/ReportActions";
import {
  REPORT_TARGETS,
  REPORT_STATUSES,
  REPORT_DECISIONS,
} from "@/constants/report";
import SearchBox from "@/ui/SearchBox";
import { Button } from "@/ui/Button";
import type { ReportDecision, ReportSignal } from "@/types/report";

const choices = {
  type: ["all", "posts", "comments", "users"],
  source: ["all", "user", "system"],
  status: ["all", "pending", "resolved"],
  decision: ["all", "kept", "deleted", "blocked"],
  sort: ["newest", "oldest"],
};

const actionLabels: Record<ReportDecision, string> = {
  kept: "Залишити",
  deleted: "Видалити",
  blocked: "Заблокувати",
};

export default function ModerationPage() {
  const state = useListParams(MODERATION_DEFAULTS, choices);
  const query = useAdminReportsQuery(state.queryParams, {
    skip: state.isSearching,
  });
  const data = query.currentData;

  useCorrectPage(data?.pagination.page, state.params.page, state.correctPage);

  const reports = data?.items ?? [];
  const actionable = reports.filter((report) => report.status === "pending");
  const selection = usePageSelection(
    actionable.map((report) => report.id),
    JSON.stringify(state.params),
  );
  const selected = actionable.filter((report) =>
    selection.selected.includes(report.id),
  );

  const [mutate] = useResolveReportMutation();
  const confirmation = useActionConfirmation();
  const act = (items: ReportSignal[], decision: ReportDecision) =>
    confirmation.ask({
      label: actionLabels[decision],
      tasks: items.map((report) => ({
        id: report.id,
        run: () => mutate({ id: report.id, decision }).unwrap(),
      })),
      onDone: selection.set,
    });

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold">Модерація</h1>
        <p className="mt-1 text-muted-foreground">
          Скарги користувачів і системні сигнали.
        </p>
      </header>
      <SearchBox
        value={state.params.search}
        onChange={(value) => state.update("search", value, true)}
        placeholder="Пошук скарг і матеріалів"
      />
      <div className="flex flex-wrap gap-3">
        <Select
          label="Тип"
          value={state.params.type}
          options={{ all: "Усі", ...REPORT_TARGETS }}
          onChange={(value) => state.update("type", value)}
        />
        <Select
          label="Джерело"
          value={state.params.source}
          options={{ all: "Усі", user: "Користувач", system: "Система" }}
          onChange={(value) => state.update("source", value)}
        />
        <Select
          label="Статус"
          value={state.params.status}
          options={{ all: "Усі", ...REPORT_STATUSES }}
          onChange={(value) => state.update("status", value)}
        />
        <Select
          label="Рішення"
          value={state.params.decision}
          options={{ all: "Усі", ...REPORT_DECISIONS }}
          onChange={(value) => state.update("decision", value)}
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
        empty={reports.length === 0}
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
                disabled={
                  !actionable.length || confirmation.busy || query.isFetching
                }
                onChange={selection.toggleAll}
                className="accent-primary"
              />
              Вибрати сторінку
            </label>
            {selected.length > 0 && (
              <>
                <span className="text-sm">Вибрано: {selected.length}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={confirmation.busy || query.isFetching}
                  onClick={() => act(selected, "kept")}
                >
                  Залишити
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={
                    confirmation.busy ||
                    query.isFetching ||
                    selected.some((report) => !report.target)
                  }
                  onClick={() => act(selected, "deleted")}
                >
                  Видалити
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    confirmation.busy ||
                    query.isFetching ||
                    selected.some(
                      (report) =>
                        report.targetType !== "users" || !report.target,
                    )
                  }
                  onClick={() => act(selected, "blocked")}
                >
                  Заблокувати
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selection.set([])}
                >
                  Зняти виділення
                </Button>
              </>
            )}
          </div>
          {reports.map((report) => (
            <article
              key={report.id}
              className="space-y-4 rounded-2xl border border-border p-4"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  aria-label={`Вибрати скаргу ${report.id}`}
                  disabled={
                    report.status !== "pending" ||
                    confirmation.busy ||
                    query.isFetching
                  }
                  checked={selection.selected.includes(report.id)}
                  onChange={() => selection.toggle(report.id)}
                  className="mt-1 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <ReportSummary report={report} />
                </div>
              </div>
              <ReportPreview report={report} />
              <ReportActions
                report={report}
                busy={confirmation.busy || query.isFetching}
                onAction={(decision) => act([report], decision)}
              />
            </article>
          ))}
        </div>
      </QueryState>
      {data && (
        <Pagination
          {...data.pagination}
          busy={confirmation.busy || query.isFetching}
          onChange={(page) => state.update("page", page)}
        />
      )}
      {confirmation.modal}
    </>
  );
}

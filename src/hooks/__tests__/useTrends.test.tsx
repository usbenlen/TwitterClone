// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppStore, type AppStore } from "@/store";
import { sessionChanged } from "@/store/session";
import { trendDismissed } from "@/store/trendFeedback";
import { useTrends } from "@/hooks/useRecommendations";
import { filterExploreTrends } from "@/utils/explore";

const api = vi.hoisted(() => ({ trends: vi.fn() }));
vi.mock("@/store/sharedApi", () => ({
  useGetTrendsQuery: api.trends,
  useGetRecommendedUsersInfiniteQuery: vi.fn(),
}));

const topics = [
  { id: "a", title: "Новини", context: "Новини", query: "news" },
  { id: "b", title: "Спорт", context: "Спорт", query: "sports" },
];
let host: HTMLDivElement;
let root: Root;
let store: AppStore;

function Probe({ limit }: { limit: number }) {
  const { trends } = useTrends(limit);
  return (
    <output data-limit={limit}>
      {trends.map((trend) => trend.id).join(",")}:
      {filterExploreTrends(trends, "news").length}
    </output>
  );
}

async function render() {
  await act(async () =>
    root.render(
      <Provider store={store}>
        <Probe limit={4} />
        <Probe limit={20} />
      </Provider>,
    ),
  );
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  store = createAppStore();
  api.trends.mockReturnValue({
    data: { items: topics },
    isLoading: false,
    refetch: vi.fn(),
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
    store.dispatch(sessionChanged());
  });
  host.remove();
  vi.unstubAllGlobals();
});

describe("visible trends across surfaces", () => {
  it("filters every limit and category without altering server data, even after a refetch", async () => {
    await render();
    await act(async () => {
      store.dispatch(trendDismissed({ trendId: "a", reason: "spam" }));
    });
    expect(
      [...host.querySelectorAll("output")].map((output) => output.textContent),
    ).toEqual(["b:0", "b:0"]);
    expect(topics).toHaveLength(2);
    api.trends.mockReturnValue({
      data: { items: structuredClone(topics) },
      isLoading: false,
      refetch: vi.fn(),
    });
    await render();
    expect(host.querySelector("output")?.textContent).toBe("b:0");
    await act(async () => {
      store.dispatch(sessionChanged());
    });
    expect(host.querySelector("output")?.textContent).toBe("a,b:1");
  });
});

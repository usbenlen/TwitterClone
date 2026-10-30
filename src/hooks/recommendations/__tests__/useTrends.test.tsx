// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAppStore, type AppStore } from "@/store/store";
import { sessionChanged } from "@/store/session";
import { trendDismissed } from "@/store/trendFeedbackState";
import {
  useExploreTrends,
  useTrends,
} from "@/hooks/recommendations/useRecommendations";

const api = vi.hoisted(() => ({ trends: vi.fn() }));
vi.mock("@/store/recommendationQueries", () => ({
  useGetTrendsQuery: api.trends,
  useGetExploreTrendsQuery: api.trends,
  useGetRecommendedUsersInfiniteQuery: vi.fn()
}));

const topics = [
  { id: "a", title: "Новини", context: "Новини", query: "news" },
  { id: "b", title: "Спорт", context: "Спорт", query: "sports" },
];
let host: HTMLDivElement;
let root: Root;
let store: AppStore;

function Probe({ limit }: { limit: number }) {
  const popular = useTrends(limit);
  const news = useExploreTrends("news", limit);
  return (
    <output data-limit={limit}>
      {popular.trends.map((trend) => trend.id).join(",")}:
      {news.trends.length}
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
    currentData: { items: topics },
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
      store.dispatch(trendDismissed({ trendId: "a", reason: "spam", requestId: "r1", source: "explore" }));
    });
    expect(
      [...host.querySelectorAll("output")].map((output) => output.textContent),
    ).toEqual(["b:1", "b:1"]);
    expect(topics).toHaveLength(2);
    api.trends.mockReturnValue({
      currentData: { items: structuredClone(topics) },
      isLoading: false,
      refetch: vi.fn(),
    });
    await render();
    expect(host.querySelector("output")?.textContent).toBe("b:1");
    await act(async () => {
      store.dispatch(sessionChanged());
    });
    expect(host.querySelector("output")?.textContent).toBe("a,b:2");
  });
});

import { describe, expect, it } from "vitest";

import { createAppStore } from "@/store";
import { sessionChanged } from "@/store/session";
import { trendDismissed } from "@/store/trendFeedback";

describe("temporary trend feedback", () => {
  it("records the selected reason and resets when a session changes", () => {
    const store = createAppStore();
    store.dispatch(trendDismissed({ trendId: "topic-a", reason: "spam" }));
    store.dispatch(trendDismissed({ trendId: "topic-b", reason: "duplicate" }));
    expect(store.getState().trendFeedback.hidden).toEqual({
      "topic-a": "spam",
      "topic-b": "duplicate",
    });
    store.dispatch(sessionChanged());
    expect(store.getState().trendFeedback.hidden).toEqual({});
  });

  it("does not persist feedback into a fresh application store", () => {
    const store = createAppStore();
    store.dispatch(
      trendDismissed({ trendId: "topic-a", reason: "not_interested" }),
    );
    expect(createAppStore().getState().trendFeedback.hidden).toEqual({});
    store.dispatch(sessionChanged());
  });
});

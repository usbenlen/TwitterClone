import { describe, expect, it } from "vitest";

import { createAppStore } from "@/store/store";
import { sessionChanged } from "@/store/session";
import { trendDismissed } from "@/store/trendFeedbackState";

describe("temporary trend feedback", () => {
  it("records the selected reason and resets when a session changes", () => {
    const store = createAppStore();
    store.dispatch(trendDismissed({ trendId: "topic-a", reason: "spam", requestId: "r1", source: "explore" }));
    store.dispatch(trendDismissed({ trendId: "topic-b", reason: "duplicate", requestId: "r2", source: "sidebar" }));
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
      trendDismissed({ trendId: "topic-a", reason: "not_interested", requestId: "r1", source: "explore" }),
    );
    expect(createAppStore().getState().trendFeedback.hidden).toEqual({});
    store.dispatch(sessionChanged());
  });
});

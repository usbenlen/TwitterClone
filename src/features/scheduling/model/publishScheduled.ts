import { postsApi, publishPosts } from "@/features/content/api/postQueries";
import { scheduledPostApi } from "@/features/scheduling/api";
import {
  scheduledErrorCleared,
  scheduledErrorSet,
} from "@/features/scheduling/model/scheduleState";
import { sessionGeneration } from "@/shared/store/session";

import type { AppStore } from "@/app/store/store";

export async function publishScheduled(
  store: AppStore,
  isActive: () => boolean = () => true,
) {
  const generation = sessionGeneration(store.getState());
  try {
    const published = await scheduledPostApi.publishDue();
    if (!isActive() || generation !== sessionGeneration(store.getState()))
      return;

    if (published.length)
      publishPosts(published, store.dispatch, store.getState());

    store.dispatch(scheduledErrorCleared());
    store.dispatch(
      postsApi.util.invalidateTags([{ type: "Scheduled", id: "LIST" }]),
    );
  } catch {
    if (isActive() && generation === sessionGeneration(store.getState()))
      store.dispatch(
        scheduledErrorSet("Не вдалося опублікувати запланований допис."),
      );
  }
}

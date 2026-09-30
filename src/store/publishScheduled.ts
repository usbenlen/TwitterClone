import { scheduledPostApi } from "@/api";
import type { AppStore } from "@/store/index";
import { postsApi, publishPosts } from "@/store/postsApi";
import {
  scheduledErrorCleared,
  scheduledErrorSet,
} from "@/store/scheduledStatus";
import { sessionGeneration } from "@/store/session";

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

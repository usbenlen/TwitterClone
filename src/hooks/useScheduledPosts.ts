import { useContext } from "react";

import { ScheduledPostsContext } from "@/providers/ScheduledPostsContext.ts";

export function useScheduledPosts() {
  const context = useContext(ScheduledPostsContext);
  if (!context)
    throw new Error("useScheduledPosts має використовуватися всередині ScheduledPostsProvider");
  return context;
}

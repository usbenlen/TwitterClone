import { createContext } from "react";

import type {
  CreateScheduledPostRequest,
  ScheduledPost,
  UpdateScheduledPostRequest,
} from "@/types";

export interface ScheduledPostsContextValue {
  posts: ScheduledPost[];
  isLoading: boolean;
  error: string | null;
  create(request: CreateScheduledPostRequest): Promise<ScheduledPost>;
  update(
    id: string,
    request: UpdateScheduledPostRequest,
  ): Promise<ScheduledPost>;
  remove(id: string): Promise<void>;
  refresh(): Promise<void>;
}

export const ScheduledPostsContext = createContext<ScheduledPostsContextValue | null>(null);

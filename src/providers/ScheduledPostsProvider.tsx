import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { scheduledPostApi } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import { ScheduledPostsContext } from "@/providers/ScheduledPostsContext";

import type {
  CreateScheduledPostRequest,
  ScheduledPost,
  UpdateScheduledPostRequest,
} from "@/types";

interface ScheduledPostsProviderProps {
  children: ReactNode;
}

export function ScheduledPostsProvider({
  children,
}: ScheduledPostsProviderProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setPosts([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setPosts(await scheduledPostApi.list());
    } catch {
      setError("Не вдалося завантажити заплановані дописи.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const publishDue = useCallback(async () => {
    if (!user) return;

    try {
      const published = await scheduledPostApi.publishDue();
      published.forEach((tweet) => {
        window.dispatchEvent(
          new CustomEvent("tweet-created", { detail: { tweet } }),
        );
      });
      await refresh();
    } catch {
      setError("Не вдалося опублікувати запланований допис.");
    }
  }, [refresh, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => void publishDue(), 0);
    return () => window.clearTimeout(timer);
  }, [publishDue]);

  useEffect(() => {
    if (!user) return;

    const nextTime = posts[0]
      ? new Date(posts[0].scheduledAt).getTime()
      : Date.now() + 60_000;
    const delay = Math.max(1_000, Math.min(60_000, nextTime - Date.now()));
    const timer = window.setTimeout(() => void publishDue(), delay);

    const onFocus = () => void publishDue();
    const onStorage = () => void refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [posts, publishDue, refresh, user]);

  const create = useCallback(async (request: CreateScheduledPostRequest) => {
    const created = await scheduledPostApi.create(request);
    setPosts((current) =>
      [...current, created].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    );
    return created;
  }, []);

  const update = useCallback(
    async (id: string, request: UpdateScheduledPostRequest) => {
      const updated = await scheduledPostApi.update(id, request);
      setPosts((current) =>
        current
          .map((post) => (post.id === id ? updated : post))
          .sort(
            (a, b) =>
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime(),
          ),
      );
      return updated;
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await scheduledPostApi.delete(id);
    setPosts((current) => current.filter((post) => post.id !== id));
  }, []);

  const value = useMemo(
    () => ({ posts, isLoading, error, create, update, remove, refresh }),
    [posts, isLoading, error, create, update, remove, refresh],
  );

  return (
    <ScheduledPostsContext.Provider value={value}>
      {children}
    </ScheduledPostsContext.Provider>
  );
}

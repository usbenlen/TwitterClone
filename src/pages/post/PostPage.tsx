import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import { tweetApi, commentApi } from "@/api";

import { Spinner } from "@/ui";
import { TweetCard } from "@/components/tweet";

import { withAncestorContext } from "@/utils/ancestors";
import {
  markQuotedTargetEditedInTweets,
  markQuotedTargetUnavailableInTweets,
} from "@/utils/quotes";

import type { Tweet } from "@/types/tweet";

const viewedPostIds = new Set<string>();

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [thread, setThread] = useState<{
    target: Tweet;
    replies: Tweet[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!postId) return;

    let active = true;
    const currentId = postId;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setNotFound(false);
    setThread(null);

    async function loadThread() {
      try {
        const threadData = await commentApi.getThread(currentId);

        if (!active) return;

        setThread({
          target: {
            ...threadData.target,
            ancestors: threadData.ancestors,
          },
          replies: threadData.replies,
        });

        if (!viewedPostIds.has(currentId)) {
          viewedPostIds.add(currentId);

          try {
            if (!threadData.target.isComment) {
              await tweetApi.view(currentId);

              if (!active) return;

              setThread((current) =>
                current && current.target.id === currentId
                  ? {
                      ...current,
                      target: {
                        ...current.target,
                        viewsCount: current.target.viewsCount + 1,
                      },
                    }
                  : current,
              );
            }
          } catch {
            viewedPostIds.delete(currentId);
          }
        }
      } catch {
        if (!active) return;

        setNotFound(true);
        setThread(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    queueMicrotask(() => {
      if (!active) return;

      setIsLoading(true);
      setNotFound(false);
      void loadThread();
    });

    return () => {
      active = false;
    };
  }, [postId]);

  useEffect(() => {
    const applyUpdate = (targetType: "post" | "comment", updated: Tweet) => {
      setThread((current) => {
        if (!current) return current;

        const updateItems = (items: Tweet[]) =>
          markQuotedTargetEditedInTweets(
            items.map((item) =>
              item.id === updated.id
                ? { ...updated, ancestors: item.ancestors }
                : item,
            ),
            targetType,
            updated.id,
          );

        const ancestors = updateItems(current.target.ancestors ?? []);
        const target = updateItems([{ ...current.target, ancestors }])[0];

        return {
          target,
          replies: updateItems(current.replies),
        };
      });
    };

    const applyDeletion = (
      targetType: "post" | "comment",
      targetId: string,
    ) => {
      setThread((current) => {
        if (!current) return current;

        const ancestors = markQuotedTargetUnavailableInTweets(
          (current.target.ancestors ?? []).filter(
            (item) => item.id !== targetId,
          ),
          targetType,
          targetId,
        );

        return {
          target: markQuotedTargetUnavailableInTweets(
            [{ ...current.target, ancestors }],
            targetType,
            targetId,
          )[0],
          replies: markQuotedTargetUnavailableInTweets(
            current.replies.filter((item) => item.id !== targetId),
            targetType,
            targetId,
          ),
        };
      });
    };

    const handleTweetUpdated = (event: Event) => {
      const { tweet } = (event as CustomEvent<{ tweet: Tweet }>).detail;
      applyUpdate("post", tweet);
    };
    const handleCommentUpdated = (event: Event) => {
      const { comment } = (event as CustomEvent<{ comment: Tweet }>).detail;
      applyUpdate("comment", comment);
    };
    const handleTweetDeleted = (event: Event) => {
      const { tweetId } = (event as CustomEvent<{ tweetId: string }>).detail;
      applyDeletion("post", tweetId);
    };
    const handleCommentDeleted = (event: Event) => {
      const { commentId } = (event as CustomEvent<{ commentId: string }>)
        .detail;
      applyDeletion("comment", commentId);
    };

    window.addEventListener("tweet-updated", handleTweetUpdated);
    window.addEventListener("comment-updated", handleCommentUpdated);
    window.addEventListener("tweet-deleted", handleTweetDeleted);
    window.addEventListener("comment-deleted", handleCommentDeleted);
    return () => {
      window.removeEventListener("tweet-updated", handleTweetUpdated);
      window.removeEventListener("comment-updated", handleCommentUpdated);
      window.removeEventListener("tweet-deleted", handleTweetDeleted);
      window.removeEventListener("comment-deleted", handleCommentDeleted);
    };
  }, []);

  useEffect(() => {
    if (!thread || !targetRef.current) return;

    const frame = requestAnimationFrame(() => {
      const target = targetRef.current;

      if (!target) return;

      const header = document.querySelector("header");
      const headerHeight = header?.getBoundingClientRect().height ?? 0;

      const TARGET_TOP_OFFSET = 70;

      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        TARGET_TOP_OFFSET;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [thread]);

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background min-h-screen">
      <header className="sticky top-0 z-header flex items-center gap-3 border-b border-border bg-background/80 px-4 py-4 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cursor-pointer rounded-full p-2 text-foreground transition-colors hover:bg-muted"
          aria-label="Назад"
        >
          <ArrowLeft className="size-5" />
        </button>

        <h1 className="text-xl font-bold text-foreground">
          {thread?.target.isComment ? "Відповідь" : "Пост"}
        </h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : notFound || !thread ? (
        <div className="px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-foreground">
            Пост або коментар не знайдено
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Можливо, його було видалено або посилання некоректне.
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col">
          {/* Ancestors thread */}
          <div className="relative">
            {thread.target.ancestors?.map((ancestor) => {
              const tweet = withAncestorContext(
                ancestor,
                thread.target.ancestors ?? [],
              );

              return (
                <div key={ancestor.id} className="relative">
                  <div className="pointer-events-none absolute left-[35px] top-[59px] bottom-[-9px] z-thread w-0.5 rounded-full bg-[color-mix(in_oklab,var(--border)_95%,black)]" />

                  <TweetCard
                    tweet={tweet}
                    variant="feed"
                    navigateToPost={true}
                    className="relative border-b-0"
                  />
                </div>
              );
            })}
          </div>

          {/* Target Tweet / Comment */}
          <div ref={targetRef} className="relative">
            <TweetCard
              tweet={thread.target}
              navigateToPost={false}
              variant="post"
              commentsInitiallyOpen={true}
            />
          </div>
        </div>
      )}
    </section>
  );
}

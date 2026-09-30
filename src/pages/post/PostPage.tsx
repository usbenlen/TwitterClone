import { useEffect, useRef, useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGetThreadQuery, useViewPostMutation } from "@/store/postsApi";
import { useParams } from "react-router";

import { Spinner } from "@/ui";
import { PageHeader } from "@/components/layout/pageHeader";
import { TweetCard } from "@/components/tweet";

import { APP_ROUTES } from "@/constants/routes";

import { withAncestorContext } from "@/utils/ancestors";
export default function PostPage() {
  const { postId } = useParams<{ postId: string }>();
  const query = useGetThreadQuery(postId ?? skipToken);
  const data = query.currentData;
  const thread = useMemo(
    () =>
      data
        ? {
            target: { ...data.target, ancestors: data.ancestors },
            replies: data.replies,
          }
        : null,
    [data],
  );
  const isLoading = query.isFetching && !data;
  const notFound = query.isError;
  const targetRef = useRef<HTMLDivElement | null>(null);
  const targetId = data?.target.id;
  const isComment = data?.target.isComment;
  const [viewPost, viewState] = useViewPostMutation({
    fixedCacheKey: targetId ? `view:${targetId}` : undefined,
  });

  useEffect(() => {
    if (!targetId || isComment) return;
    if (viewState.isLoading || viewState.isSuccess) return;
    void viewPost(targetId);
  }, [isComment, targetId, viewPost, viewState.isLoading, viewState.isSuccess]);

  useEffect(() => {
    if (!targetId || !targetRef.current) return;

    const frame = requestAnimationFrame(() => {
      const target = targetRef.current;

      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [targetId]);

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background min-h-screen">
      <PageHeader
        title={thread?.target.isComment ? "Відповідь" : "Пост"}
        backTo={APP_ROUTES.HOME}
      />

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
          <div ref={targetRef} className="relative scroll-mt-14">
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

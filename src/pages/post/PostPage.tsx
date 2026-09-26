import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import { tweetApi } from "@/api/tweet.api";
import { Spinner } from "@/ui";
import { TweetCard } from "@/components/tweet";

import type { Tweet } from "@/types/tweet";

const viewedPostIds = new Set<string>();

export default function PostPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!postId) {
      setTweet(null);
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let active = true;
    const currentPostId = postId;

    async function loadPost() {
      try {
        setIsLoading(true);
        setNotFound(false);
        setTweet(null);

        const result = await tweetApi.getById(currentPostId);

        if (!active) return;

        if (result.isDeleted) {
          setTweet(null);
          setNotFound(true);
          return;
        }

        setTweet(result);

        if (!viewedPostIds.has(currentPostId)) {
          viewedPostIds.add(currentPostId);

          try {
            await tweetApi.view(currentPostId);

            if (!active) return;

            setTweet((current) =>
                current && current.id === currentPostId
                    ? {
                      ...current,
                      viewsCount: current.viewsCount + 1,
                    }
                    : current,
            );
          } catch {
            viewedPostIds.delete(currentPostId);
          }
        }
      } catch {
        if (!active) return;

        setTweet(null);
        setNotFound(true);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadPost();

    return () => {
      active = false;
    };
  }, [postId]);

  return (
      <section className="w-full max-w-3xl border-r border-border bg-background">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-4 backdrop-blur">
          <button
              type="button"
              onClick={() => navigate(-1)}
              className="cursor-pointer rounded-full p-2 text-foreground transition-colors hover:bg-muted"
              aria-label="Назад"
          >
            <ArrowLeft className="size-5" />
          </button>

          <h1 className="text-xl font-bold text-foreground">
            Пост
          </h1>
        </header>

        {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
        ) : notFound || !tweet ? (
            <div className="px-4 py-16 text-center">
              <h2 className="text-xl font-bold text-foreground">
                Пост не найден
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Можливо, він був видалений або недоступний.
              </p>
            </div>
        ) : (
            <TweetCard
                tweet={tweet}
                navigateToPost={false}
                variant="post"
                commentsInitiallyOpen={true}
                onReport={() => {
                  void tweetApi.report(tweet.id);
                }}
            />
        )}
      </section>
  );
}
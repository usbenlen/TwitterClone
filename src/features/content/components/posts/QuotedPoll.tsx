import { Link } from "react-router";

import { useGetPollStateQuery } from "@/features/content/api/postQueries";
import PostPoll from "@/features/content/components/posts/PostPoll";
import { pollsMatch } from "@/features/content/lib/posts/poll";
import { APP_ROUTES } from "@/shared/config/routes";

import type { PostPoll as Poll, Target } from "@/features/content/types";

interface QuotedPollProps {
  target: Target;
  snapshot: Poll;
  allowVoting?: boolean;
}

export default function QuotedPoll({
  target,
  snapshot,
  allowVoting = true,
}: QuotedPollProps) {
  const query = useGetPollStateQuery(target, { refetchOnMountOrArgChange: 30 });
  const poll = query.currentData;
  const notFound = query.error && "status" in query.error && query.error.status === 404;

  if (poll === null || notFound) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        Опитування недоступне
      </p>
    );
  }
  if (poll && !pollsMatch(snapshot, poll)) {
    return (
      <div className="mt-3 text-sm text-muted-foreground">
        <p>Опитування змінилося</p>
        <Link
          to={APP_ROUTES.post(target.id)}
          className="text-primary hover:underline focus-visible:focus-indicator"
        >
          Відкрити оригінал
        </Link>
      </div>
    );
  }

  return (
    <>
      <PostPoll
        postId={target.id}
        poll={poll ?? snapshot}
        isComment={target.type === "comment"}
        allowVoting={allowVoting && poll !== undefined && !query.isError}
      />
      {query.isError ? (
        <div className="mt-2 text-xs text-muted-foreground">
          <p role="alert">Не вдалося оновити опитування.</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="min-h-8 rounded-full px-2 text-primary hover:bg-primary/10 focus-visible:focus-indicator"
          >
            Спробувати ще раз
          </button>
        </div>
      ) : poll === undefined ? (
        <p role="status" className="mt-2 text-xs text-muted-foreground">
          Оновлюємо опитування…
        </p>
      ) : null}
    </>
  );
}

import { ApiError } from "@/shared/api";
import { commentsByPostId } from "@/mock/data/comments";
import { posts, setPosts } from "@/mock/data/posts";
import { MOCK_DELAYS } from "@/mock/mockConfig";
import { delay } from "@/mock/utils/delay";

import type { PostPoll, QuoteTargetType } from "@/features/content/types";

function findTarget(targetType: QuoteTargetType, targetId: string) {
  const commentEntry =
    targetType === "comment"
      ? Object.entries(commentsByPostId).find(([, comments]) =>
          comments.some((comment) => comment.id === targetId),
        )
      : undefined;
  const items = targetType === "post" ? posts : (commentEntry?.[1] ?? []);
  const target = items.find((item) => item.id === targetId);
  if (!target) throw new ApiError(404, "Пост або коментар не знайдено");

  return { target, items, commentEntry };
}

export const mockPollApi = {
  async get(
    targetType: QuoteTargetType,
    targetId: string,
  ): Promise<PostPoll | null> {
    await delay(MOCK_DELAYS.READ);
    return findTarget(targetType, targetId).target.poll ?? null;
  },

  async vote(
    targetType: QuoteTargetType,
    targetId: string,
    optionId: string,
  ): Promise<PostPoll> {
    await delay(MOCK_DELAYS.READ);

    const { target, items, commentEntry } = findTarget(targetType, targetId);

    const poll = target.poll;
    if (!poll) throw new Error("Опитування не знайдено.");
    if (!poll.options.some((option) => option.id === optionId)) {
      throw new Error("Варіант відповіді не знайдено.");
    }
    if (poll.votedOptionId) return poll;
    if (
      poll.isClosed ||
      (poll.expiresAt !== null && Date.parse(poll.expiresAt) <= Date.now())
    ) {
      throw new Error("Опитування завершене.");
    }

    const updatedPoll: PostPoll = {
      ...poll,
      votedOptionId: optionId,
      totalVotes: poll.totalVotes + 1,
      options: poll.options.map((option) =>
        option.id === optionId
          ? { ...option, votesCount: option.votesCount + 1 }
          : option,
      ),
    };
    const updatedItems = items.map((item) =>
      item.id === targetId ? { ...item, poll: updatedPoll } : item,
    );
    if (commentEntry) commentsByPostId[commentEntry[0]] = updatedItems;
    else setPosts(updatedItems);

    return updatedPoll;
  },
};
